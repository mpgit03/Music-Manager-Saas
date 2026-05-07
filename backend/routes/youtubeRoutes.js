import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { connectYouTube, testYouTubeMatch, youtubecallback, youtubeReconnect } from "../controllers/youtubeController.js";


const router = express.Router();

// 🔍 Test YouTube matching (optional debug route)
router.post("/test-match", protect, testYouTubeMatch);

router.get("/login",connectYouTube);

router.get("/callback", youtubecallback);

router.get("/reconnect" ,protect ,youtubeReconnect);

// router.get("/create_playlist" , protect , createPlaylistonYoutubecontroller);

// router.post("/playlist-items" , protect, addVideoToYoutubePlaylist);

export default router;