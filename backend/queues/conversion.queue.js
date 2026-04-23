import dotenv from "dotenv";
dotenv.config();

import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL,{
  maxRetriesPerRequest: null,
});

// optional (prevents warning in dev)
connection.setMaxListeners(0);

export const conversionQueue = new Queue("convert-playlist", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});