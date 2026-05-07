import convertedPlaylist from "../models/convertedplaylist.js";
import Account from "../models/Account.js";
import { conversionQueue } from "../queues/conversion.queue.js";
import { asynchandler } from "../middleware/asynchandler.js";
import { createSpotifyClient } from "../utils/spotifyClient.js";
import { getValidSpotifyToken } from "../utils/spotifyToken.js";


// 🔥 CONVERT PLAYLIST
export const convertPlaylistController = asynchandler(
  async (req, res) => {
    const { playlistId } = req.params;

    //  Prevent duplicate ACTIVE conversions
    const existingActive = await convertedPlaylist.findOne({
      user: req.user._id,
      sourcePlaylistId: playlistId,
      targetPlatform: "youtube",
      status: { $in: ["queued", "processing", "retrying"] }, 
    });

    ///  why 
    if (existingActive) {
      console.log("Resuming conversion:", existingActive._id);

      await conversionQueue.add("convert-playlist", {
        conversionId: existingActive._id,
      });

      return res.json({
        message: "Resuming conversion",
        conversion: existingActive,
      });
    }

    // Return already completed OR partial
    const existingCompleted = await convertedPlaylist.findOne({
      user: req.user._id,
      sourcePlaylistId: playlistId,
      targetPlatform: "youtube",
      status: { $in: ["completed", "partial_success"] }, // 🔥 updated
    });

    if (existingCompleted) {
      return res.json({
        message: "Playlist already converted",
        conversion: existingCompleted,
      });
    }

    // ✅ 3. Get Spotify account
    const account = await Account.findOne({
      user: req.user._id,
      provider: "spotify",
    });

    if (!account || !account.accessToken) {
      return res.status(401).json({
        message: "Spotify not connected",
      });
    }

    const accessToken = await getValidSpotifyToken(account);

    // ✅ 4. Validate playlist via Spotify
    const spotifyApi = createSpotifyClient(accessToken);

    let playlistName;

    try {
      const response = await spotifyApi.getPlaylist(playlistId);
      playlistName = response.body.name;
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(400).json({ message: "Playlist not found" });
      }

      if (err.statusCode === 403) {
        return res.status(403).json({
          message: "Playlist is private or inaccessible",
        });
      }

      if (err.statusCode === 401) {
        return res.status(401).json({
          message: "Spotify token expired, reconnect required",
        });
      }

      throw err;
    }

    // ✅ 5. Create conversion (safe against race)
    let conversion;

    try {
      conversion = await convertedPlaylist.create({
        user: req.user._id,
        sourcePlatform: "spotify",
        targetPlatform: "youtube",
        sourcePlaylistId: playlistId,
        sourcePlaylistName: playlistName,
        status: "queued",
      });
    } catch (err) {
      if (err.code === 11000) {
        const existing = await convertedPlaylist.findOne({
          user: req.user._id,
          sourcePlaylistId: playlistId,
          targetPlatform: "youtube",
          status: { $in: ["queued", "processing", "retrying"] },
        });

        return res.json({
          message: "Conversion already in progress",
          conversion: existing,
        });
      }

      throw err;
    }

    // ✅ 6. Queue job
    await conversionQueue.add("convert-playlist", {
      conversionId: conversion._id,
    });

    return res.json({
      message: "Conversion started",
      conversion,
    });
  }
);


// 🔁 RETRY CONVERSION
export const retryConversion = asynchandler(async (req, res) => {
  const { conversionId } = req.params;

  const conversion = await convertedPlaylist.findById(conversionId);

  if (!conversion) {
    res.status(404);
    throw new Error("Conversion not found");
  }

  // 🔐 Authorization
  if (conversion.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  // 🔍 Find failed tracks (NEW SCHEMA)
  const failedTracks = conversion.tracks.filter(
    (track) => track.target?.status === "failed"
  );

  if (failedTracks.length === 0) {
    res.status(400);
    throw new Error("No failed tracks to retry");
  }

  // 🔁 Queue retry job
  await conversionQueue.add("convert-playlist", {
    conversionId: conversion._id,
    retryOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Retry started",
    retryCount: failedTracks.length,
  });
});


// 📊 GET ALL CONVERSIONS
export const getConversions = async (req, res) => {
  const conversions = await convertedPlaylist.find({
    user: req.user._id,
    targetPlatform: "youtube",
  }).sort({ createdAt: -1 });

  res.json(conversions);
};


// 📊 GET SINGLE CONVERSION
export const getConversionById = async (req, res) => {
  const conversion = await convertedPlaylist.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!conversion) {
    return res.status(404).json({ message: "Conversion not found" });
  }

  res.json(conversion);
};