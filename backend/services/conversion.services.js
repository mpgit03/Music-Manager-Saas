//import models
import ConvertedPlaylist from "../models/convertedplaylist.js";
import Account from "../models/Account.js";
import { getValidYoutubeToken } from "../utils/youtubeToken.js";
import { getValidSpotifyToken } from "../utils/spotifyToken.js";
import { getPlaylistTracks } from "./spotify.services.js";
import { normalizePlaylistTracks } from "../utils/spotifyNormalizer.js";
import { convertPlaylistToYouTube } from "./youtube.services.js";
import { createYouTubePlaylist } from "./youtube.services.js";
import { addVideoToYoutubePlaylistInternal } from "./youtube.services.js";
console.log("🔥 DEBUG IMPORT:", getValidYoutubeToken);


export const processConversion = async (conversionId) => {
  try {

    const existingConversion = await ConvertedPlaylist.findById(conversionId);
    if(!existingConversion){
      throw new Error("conversion not found");
    }
    // 1. Mark as processing (single update)
    const conversion = await ConvertedPlaylist.findByIdAndUpdate(
      conversionId,
      {
        status: "processing",
        progress: {
          total: existingConversion?.tracks?.length || 0,
          processed: 0,
          success: 0,
          failed: 0,
        },
      },
      { returnDocument: "after" }
    );

    if (!conversion) {
      throw new Error("Conversion not found");
    }

    // 2. Get accounts
    const spotifyAccount = await Account.findOne({
      user: conversion.user,
      provider: "spotify",
    });

    if (!spotifyAccount) {
      throw new Error("Spotify account not connected");
    }

    const ytAccount = await Account.findOne({
      user: conversion.user,
      provider: "youtube",
    });

    if (!ytAccount) {
      throw new Error("YouTube account not connected");
    }

    // 3. Get valid tokens
    const spotifyToken = await getValidSpotifyToken(spotifyAccount);
    const youtubeToken = await getValidYoutubeToken(ytAccount);

    // 4. Fetch & normalize Spotify tracks
    const data = await getPlaylistTracks(
      spotifyToken,
      conversion.sourcePlaylistId
    );

    const items = Array.isArray(data) ? data : data?.items || [];
    const normalizedTracks = normalizePlaylistTracks(items);

    console.log("🎵 Tracks fetched:", normalizedTracks.length);

    // 5. Match + store tracks (first time only)
    if (!conversion.tracks || conversion.tracks.length === 0) {
      console.log(" Matching tracks...");

      const convertedTracks = await convertPlaylistToYouTube(normalizedTracks);

      await ConvertedPlaylist.findByIdAndUpdate(conversionId, {
        tracks: convertedTracks,
        totalTracks: convertedTracks.length,
        progress: {
          total: convertedTracks.length,
          processed: 0,
          success: 0,
          failed: 0,
        },
      });

      conversion.tracks = convertedTracks;
    }

    // 6. Create YouTube playlist
    const playlistName = conversion.sourcePlaylistName || "Converted Playlist" ;

    const { id: youtubePlaylistId } = await createYouTubePlaylist(
      youtubeToken,
      `${playlistName} (Converted)`
    );

    await ConvertedPlaylist.findByIdAndUpdate(conversionId, {
      targetPlaylistId: youtubePlaylistId,
    });

    // 7. Add videos
    let matched = 0;
    let failed = 0;
    let processed = 0;
    let failedTracksData = [];

    for (let i = 0; i < conversion.tracks.length; i++) {
      const track = conversion.tracks[i];
      const videoId = track?.target?.id;

      if (!videoId) {
        failed++;
        processed++;

        failedTracksData.push({
          title: track.title,
          artists: track.artists || [],
          videoId: null,
          reason: "No YouTube match found",
        });

        continue;
      }

      try {
        await safeAdd({
          youtubePlaylistId,
          videoId,
          youtubeToken,
        });
        matched++;
      } catch (err) {
        console.error("❌ Failed to add video:", videoId);

        failed++;

        failedTracksData.push({
          title: track.title,
          artists: track.artists || [],
          videoId,
          reason: err.message,
        });
      }

      processed++;

      // Update progress every 5 tracks
      if (i % 5 === 0 || i === conversion.tracks.length - 1) {
        await ConvertedPlaylist.findByIdAndUpdate(conversionId, {
          progress: {
            total: conversion.tracks.length,
            processed,
            success: matched,
            failed,
          },
          matchedTracks: matched,
          failedTracks: failed,
        });
      }

      await new Promise((res) => setTimeout(res, 300));
    }

    // 8. Final update
    await ConvertedPlaylist.findByIdAndUpdate(conversionId, {
      status: "completed",
      progress: {
        total: conversion.tracks.length,
        processed,
        success: matched,
        failed,
      },
      matchedTracks: matched,
      failedTracks: failed,
      failedTracksData,
    });

    console.log(" Conversion completed");
  } catch (error) {
    console.error("FULL ERROR:", error.message);

    // 🔥 Handle reconnect separately
    if (error.message === "YOUTUBE_RECONNECT_REQUIRED") {
      await ConvertedPlaylist.findByIdAndUpdate(conversionId, {
        status: "failed",
        error: "YOUTUBE_RECONNECT_REQUIRED",
      });
    } else {
      await ConvertedPlaylist.findByIdAndUpdate(conversionId, {
        status: "failed",
        error: error.message,
      });
    }

    throw error; // let worker decide retry
  }
};


const safeAdd = async({
  youtubePlaylistId,
  videoId,
  youtubeToken,
  retries =3
})=>{
  try{
    await addVideoToYoutubePlaylistInternal(
      youtubePlaylistId,
      videoId,
      youtubeToken);
  } catch(err){
    const status = err?.response?.status;
    if ((status === 409 || status >= 500) && retries > 0) {
      console.log(`🔁 Retry (${3 - retries + 1}) for: ${videoId}`);
      await new Promise(res => setTimeout(res, 500));

      return safeAdd({
        youtubePlaylistId,
        videoId,
        youtubeToken,
        retries: retries - 1
      });
  }
   throw err;
}
};