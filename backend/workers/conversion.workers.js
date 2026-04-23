import mongoose from "mongoose";    
import dns from "node:dns/promises"
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
  if (err.message === "YOUTUBE_RECONNECT_REQUIRED") return false;
  if (!err.response) return true; // network error

  const status = err.response.status;

  if (status >= 500) return true; // server errors
  if (status === 429) return true; // rate limit

  return false; // 400, 403, 404 → don't retry
};

const connection = new IORedis(process.env.REDIS_URL,{
  maxRetriesPerRequest: null,
});

// optional (prevents warning in dev)
connection.setMaxListeners(0);


new Worker(
  "convert-playlist",
  async (job) => {
    const { conversionId } = job.data;

    try {
      console.log(`🔥 Job received (Attempt ${job.attemptsMade + 1})`);

      await processConversion(conversionId);

      console.log("✅ Job completed");

    } catch (err) {
      console.log(`❌ Error on attempt ${job.attemptsMade + 1}:`, err.message);

      // 🔥 HANDLE RECONNECT ERROR
      if (err.message === "YOUTUBE_RECONNECT_REQUIRED") {
      console.log("🛑 Reconnect required — stopping job");

      await ConvertedPlaylist.findByIdAndUpdate(conversionId, {
        status: "failed",
        error: "YOUTUBE_RECONNECT_REQUIRED"
      });

        return; 
      }

      const retryable = isRetryableError(err);
      const isLastAttempt =
        job.attemptsMade + 1 === job.opts.attempts;

      if (!retryable || isLastAttempt) {
        // ❌ FINAL FAILURE
        await ConvertedPlaylist.findByIdAndUpdate(conversionId, {
          status: "failed",
          error: err.message,
        });

        if (!retryable) {
          await job.moveToFailed(err, true);
          return;
        }

        throw err;
      } else {
        // 🔁 RETRY
        await ConvertedPlaylist.findByIdAndUpdate(conversionId, {
          status: "retrying",
          error: err.message,
        });

        throw err;
      }
    }
  },
  { connection }
);