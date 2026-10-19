
import dns from "node:dns/promises";

// Keep DNS configuration before application startup.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import "dotenv/config";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import express from "express";
import rateLimit from "express-rate-limit";

import swaggerSpec from "./config/swagger.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import youtubeRoutes from "./routes/youtubeRoutes.js";
import conversionRoutes from "./routes/conversionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import spotifyRoutes from "./routes/spotifyRoutes.js";
import notFound from "./middleware/notFound.js";
import { errorhandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "https://music-manager-saas.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "Music Management Api",
    docs: "/api-docs",
  });
});

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    timeStamp: new Date().toISOString(),
  });
});

app.use(
  "/api/auth/login",
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: "Too many login attempts. Try again later.",
  })
);

app.use("/api/spotify", spotifyRoutes);
app.use("/api/auth/youtube", youtubeRoutes);
app.use("/api/conversions", conversionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/uploads", express.static("uploads"));

app.use(notFound);
app.use(errorhandler);

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
      console.log("REDIS:", process.env.REDIS_URL);
    });
  } catch (error) {
    console.error("Failed to start API server:", error);
    process.exit(1);
  }
}

startServer();
