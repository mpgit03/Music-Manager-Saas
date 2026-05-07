import ConvertedPlaylist from "../models/convertedplaylist.js";
import Account from "../models/Account.js";
import { getValidYoutubeToken } from "../utils/youtubeToken.js";
import { getValidSpotifyToken } from "../utils/spotifyToken.js";
import { getPlaylistTracks } from "./spotify.services.js";
import { normalizePlaylistTracks } from "../utils/spotifyNormalizer.js";
import { convertPlaylistToYouTube } from "./youtube.services.js";
import { createYouTubePlaylist } from "./youtube.services.js";
import { addVideoToYoutubePlaylistInternal } from "./youtube.services.js";

export const processConversion = async (
  conversion,
  tracksToProcess = null
) => {
  try {
    if (!conversion) {
      throw new Error("Conversion not found");
    }

    // 🔹 Get accounts
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

    // 🔹 Tokens
    const spotifyToken = await getValidSpotifyToken(
      spotifyAccount
    );

    const youtubeToken = await getValidYoutubeToken(
      ytAccount
    );

    // 🔹 FIRST RUN ONLY → Fetch + normalize + match
    if (
      !conversion.tracks ||
      conversion.tracks.length === 0
    ) {
      const data = await getPlaylistTracks(
        spotifyToken,
        conversion.sourcePlaylistId
      );

      const items = Array.isArray(data)
        ? data
        : data?.items || [];

      const normalizedTracks =
        normalizePlaylistTracks(items);

      console.log(
        "🎵 Tracks fetched:",
        normalizedTracks.length
      );

      const convertedTracks =
        await convertPlaylistToYouTube(
          normalizedTracks
        );

      conversion.tracks = convertedTracks;
      conversion.totalTracks =
        convertedTracks.length;

      await conversion.save();
    }

    //  Decide tracks AFTER fetching
    const tracks =
      tracksToProcess || conversion.tracks;

    // 🔹 Create playlist ONLY once
    let youtubePlaylistId =
      conversion.targetPlaylistId;

    if (!youtubePlaylistId) {
      const res = await createYouTubePlaylist(
        youtubeToken,
        `${
          conversion.sourcePlaylistName ||
          "Converted"
        } (Converted)`
      );

      youtubePlaylistId = res.id;

      conversion.targetPlaylistId =
        youtubePlaylistId;

      await conversion.save();
    }

    // 🔹 PROCESS TRACKS
    for (let track of tracks) {
      const videoId = track?.target?.id;

      // ❌ No match found
      if (!videoId) {
        track.target = {
          ...track.target,
          status: "failed",
          error: "No YouTube match found",
        };

        continue;
      }

      try {
        await safeAdd({
          youtubePlaylistId,
          videoId,
          youtubeToken,
        });

        track.target = {
          ...track.target,
          status: "success",
          error: null,
        };

      } catch (err) {
        track.target = {
          ...track.target,
          status: "failed",
          error: err.message,
        };
      }

      // ⚡ Small delay (rate limit protection)
      await new Promise((res) =>
        setTimeout(res, 300)
      );
    }

    // 🔹 Save updated tracks
    await conversion.save();

    // 🔹 Compute progress
    const success = conversion.tracks.filter(
      (t) => t.target?.status === "success"
    ).length;

    const failed = conversion.tracks.filter(
      (t) => t.target?.status === "failed"
    ).length;

    const total = conversion.tracks.length;
      const failedTracksData = conversion.tracks
      .filter((t) => t.target?.status === "failed")
      .map((t) => ({
        title: t.title,

        artists: t.artists,

        videoId:
          t.target?.id || null,

        reason:
          t.target?.error ||
          "Unknown error",
      }));


    // 🔹 Update progress
    await ConvertedPlaylist.findByIdAndUpdate(
      conversion._id,
      {
        progress: {
          total,
          processed: success + failed,
          success,
          failed,
        },

        matchedTracks: success,

        failedTracks: failed,

        failedTracksData,
      }
    );

    // 🔹 Final status
    let status = "completed";

    if (failed > 0 && success > 0) {
      status = "partial_success";
    } else if (failed === total) {
      status = "failed";
    }

    await ConvertedPlaylist.findByIdAndUpdate(
      conversion._id,
      {
        status,
      }
    );

    console.log("✅ Conversion step completed");

  } catch (error) {
    console.error(
      "❌ FULL ERROR:",
      error.message
    );

    if (
      error.message ===
      "YOUTUBE_RECONNECT_REQUIRED"
    ) {
      await ConvertedPlaylist.findByIdAndUpdate(
        conversion._id,
        {
          status: "failed",
          error:
            "YOUTUBE_RECONNECT_REQUIRED",
        }
      );

    } else {
      await ConvertedPlaylist.findByIdAndUpdate(
        conversion._id,
        {
          status: "failed",
          error: error.message,
        }
      );
    }

    throw error;
  }
};

// 🔁 Internal retry for adding video
const safeAdd = async ({
  youtubePlaylistId,
  videoId,
  youtubeToken,
  retries = 3,
}) => {
  try {
    await addVideoToYoutubePlaylistInternal(
      youtubePlaylistId,
      videoId,
      youtubeToken
    );

  } catch (err) {
    const status = err?.response?.status;

    if (
      (status === 409 || status >= 500) &&
      retries > 0
    ) {
      console.log(
        `🔁 Retry (${3 - retries + 1}) for: ${videoId}`
      );

      await new Promise((res) =>
        setTimeout(res, 500)
      );

      return safeAdd({
        youtubePlaylistId,
        videoId,
        youtubeToken,
        retries: retries - 1,
      });
    }

    throw err;
  }
};