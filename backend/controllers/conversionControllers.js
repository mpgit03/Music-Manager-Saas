import convertedPlaylist from "../models/convertedplaylist.js";
import Account from "../models/Account.js";
import { conversionQueue } from "../queues/conversion.queue.js";
import { asynchandler } from "../middleware/asynchandler.js";
import { createSpotifyClient } from "../utils/spotifyClient.js";
import { getValidSpotifyToken } from "../utils/spotifyToken.js";

export const convertPlaylistController = asynchandler(
  async (req, res) => {
    const { playlistId } = req.params;

    // ✅ 1. Prevent duplicate ACTIVE conversions
    const existingActive = await convertedPlaylist.findOne({
      user: req.user._id,
      sourcePlaylistId: playlistId,
      targetPlatform: "youtube",
      status: { $in: ["queued", "processing"] },
    });

    if (existingActive) {
      console.log("Resuming stuck conversion:", existingActive._id);

      await conversionQueue.add("convert-playlist", {
        conversionId: existingActive._id,
      });

      return res.json({
        message: "Resuming conversion",
        conversion: existingActive,
      });
    }

    // ✅ 2. Return already completed conversion
    const existingCompleted = await convertedPlaylist.findOne({
      user: req.user._id,
      sourcePlaylistId: playlistId,
      targetPlatform: "youtube",
      status: "completed",
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

    // ✅ 4. Validate playlist via Spotify API
    const spotifyApi = createSpotifyClient(accessToken);

    let playlist;
    let playlistName;

    try {
      const response = await spotifyApi.getPlaylist(playlistId);
      playlist = response.body;
      playlistName = playlist.name;
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(400).json({
          message: "Playlist not found",
        });
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

      throw err; // handled by asyncHandler
    }

    // ✅ 5. Create conversion + queue job (with race condition handling)
    let conversion;

    try {
      conversion = await convertedPlaylist.create({
        user: req.user._id,
        sourcePlatform: "spotify",
        targetPlatform: "youtube",
        sourcePlaylistId: playlistId,
        sourcePlaylistName:playlistName,
        status: "queued",
      });
      console.log(playlistName);
    } catch (err) {
      // 🔥 Handle duplicate key error from partial index
      if (err.code === 11000) {
        const existing = await convertedPlaylist.findOne({
          user: req.user._id,
          sourcePlaylistId: playlistId,
          targetPlatform: "youtube",
          status: { $in: ["queued", "processing"] },
        });

        return res.json({
          message: "Conversion already in progress",
          conversion: existing,
        });
      }

      throw err;
    }

    // ✅ 6. Add job to queue
    await conversionQueue.add("convert-playlist", {
      conversionId: conversion._id,
    });

    return res.json({
      message: "Conversion started",
      conversion,
    });
  }
);

export const retryConversion = asynchandler(async (req, res) => {
  const { conversionId } = req.params;

  const conversion = await convertedPlaylist.findById(conversionId);

  if (!conversion) {
    res.status(404);
    throw new Error("Conversion not found");
  }

  if (conversion.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  // Allow retry ONLY if failed
  if (conversion.status !== "failed") {
    res.status(400);
    throw new Error("Only failed conversions can be retried");
  }

  // Optional: ensure it's a reconnect failure
  // (you can relax this later)
  if (conversion.error !== "YOUTUBE_RECONNECT_REQUIRED") {
    res.status(400);
    throw new Error("This conversion cannot be retried");
  }

  //  Reset state
  conversion.status = "queued";
  conversion.error = null;

  conversion.progress = {
    total: conversion.totalTracks || 0,
    processed: 0,
    success: 0,
    failed: 0
  };

  await conversion.save();

  //  Add back to queue
  await conversionQueue.add("convert-playlist", {
    conversionId: conversion._id,
  });

  res.json({
    success: true,
    message: "Conversion retried successfully"
  });
});


// 📊 Get all conversions
export const getConversions = async (req, res) => {
  const conversions = await convertedPlaylist.find({
    user: req.user._id,
    targetPlatform: "youtube",
  }).sort({ createdAt: -1 });

  res.json(conversions);
};

// 📊 Get single conversion
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