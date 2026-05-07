import mongoose from "mongoose";

const convertedPlaylistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔁 Conversion direction
    sourcePlatform: {
      type: String,
      required: true,
      enum: ["spotify", "youtube"], // extend later
    },

    targetPlatform: {
      type: String,
      required: true,
      enum: ["spotify", "youtube"], // extend later
    },

    // 🔗 Input playlist
    sourcePlaylistId: {
      type: String,
      required: true,
    },
    sourcePlaylistName: {
      type: String,
    },

    // 🔗 Output playlist (REAL RESULT)
    targetPlaylistId: {
      type: String,
    },

    // 📊 Job state
    status: {
      type: String,
      enum: [
      "queued",
      "processing",
      "retrying",
      "completed",
      "partial_success",
      "failed"
    ],
      default: "queued",
    },

    progress: {
  total: { type: Number, default: 0 },
  processed: { type: Number, default: 0 },
  success: { type: Number, default: 0 },
  failed: { type: Number, default: 0 }
},

    // 📈 Stats (very useful)
    totalTracks: {
      type: Number,
      default: 0,
    },

    matchedTracks: {
      type: Number,
      default: 0,
    },

    failedTracks: {
      type: Number,
      default: 0,
    },
    failedTracksData:[{
      title: String,
      artists: [String],
      videoId: String,
      reason: String,
    }],

    // ❌ Error handling
    error: {
      type: String,
    },

    // 🎵 Track-level data (keep for now, optimize later)
    tracks: [
      {
        title: String,
        artists: [String],
        album: String,
        duration_ms: Number,
        isrc: String,

        source: {
          id: String,
          platform: String,
        },

        target: {
  id: String,
  platform: String,
  title: String,
  url: String,

  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending"
  },

  error: String,

  retryCount: {
    type: Number,
    default: 0
  }
},
      },
    ],
  },
  { timestamps: true }
);

// 🚫 Prevent duplicate active conversions
convertedPlaylistSchema.index(
  { user: 1, sourcePlaylistId: 1, targetPlatform: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["queued", "processing"] },
    },
  }
);

export default mongoose.model("ConvertedPlaylist", convertedPlaylistSchema);