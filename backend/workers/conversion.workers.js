import mongoose from "mongoose";
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import IORedis from "ioredis";

import { processConversion } from "../services/conversion.services.js";
import ConvertedPlaylist from "../models/convertedplaylist.js";

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Worker MongoDB Connected");

const isRetryableError = (err) => {

  // 🔒 User reconnect required
  if (
    err.message ===
    "YOUTUBE_RECONNECT_REQUIRED"
  ) {
    return false;
  }

  // 🌐 Network errors → retry
  if (!err.response) {
    return true;
  }

  const status = err.response.status;

  const message =
    err?.response?.data?.error?.message || "";

  // ❌ YouTube daily quota exceeded
  if (
    status === 403 &&
    message.toLowerCase().includes("quota")
  ) {
    return false;
  }

  // 🔁 Server errors
  if (status >= 500) {
    return true;
  }

  // 🔁 Rate limit
  if (status === 429) {
    return true;
  }

  // ❌ Everything else
  return false;
};

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

// optional
connection.setMaxListeners(0);

new Worker(
  "convert-playlist",
  async (job) => {
    const { conversionId, retryOnly } = job.data;

    try {
      console.log(
        `🔥 Job received (Attempt ${job.attemptsMade + 1})`
      );

      const conversion = await ConvertedPlaylist.findById(
        conversionId
      );

      if (!conversion) {
        throw new Error("Conversion not found");
      }

      let tracksToProcess = null;

      // 🔁 RETRY FLOW ONLY
      if (retryOnly) {
        tracksToProcess = conversion.tracks.filter(
          (track) => track.target?.status === "failed"
        );

        if (tracksToProcess.length === 0) {
          console.log("⚠️ No failed tracks to retry");
          return;
        }

        console.log(
          `🔁 Retrying ${tracksToProcess.length} failed tracks`
        );
      }

      // ✅ NORMAL FLOW:
      // processConversion will fetch + populate tracks itself
      await processConversion(conversion, tracksToProcess);

      console.log("✅ Job completed");
    } catch (err) {
      console.log(
        `❌ Error on attempt ${
          job.attemptsMade + 1
        }:`,
        err.message
      );

      // 🔒 User must reconnect YouTube
      if (err.message === "YOUTUBE_RECONNECT_REQUIRED") {
        await ConvertedPlaylist.findByIdAndUpdate(
          conversionId,
          {
            status: "failed",
            error: "YOUTUBE_RECONNECT_REQUIRED",
          }
        );

        return;
      }

      const retryable = isRetryableError(err);

      const isLastAttempt =
        job.attemptsMade + 1 === job.opts.attempts;

      // ❌ Permanent failure
      if (!retryable || isLastAttempt) {
        await ConvertedPlaylist.findByIdAndUpdate(
          conversionId,
          {
            status: "failed",
            error: err.message,
          }
        );

        // non-retryable → immediately fail job
        if (!retryable) {
          await job.moveToFailed(err, true);
          return;
        }

        throw err;
      }

      // 🔁 BullMQ retry
      await ConvertedPlaylist.findByIdAndUpdate(
        conversionId,
        {
          status: "retrying",
          error: err.message,
        }
      );

      throw err;
    }
  },
  { connection }
);

console.log("🚀 Conversion Worker Running");