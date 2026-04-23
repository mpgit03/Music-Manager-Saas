import express from "express"
import { protect } from "../middleware/authMiddleware.js";
import { getMySpotifyData, redirectToSpotify, spotifyCallback,getNormalizedPlaylistController, getUserPlaylistsController } from "../controllers/spotifyControllers.js";
import { getPlaylistTracksController } from "../controllers/spotifyControllers.js";

 

const router = express.Router();


router.get("/login",redirectToSpotify);
router.get("/callback",spotifyCallback);
router.get("/me",protect,getMySpotifyData);
router.get("/playlists",protect,getUserPlaylistsController);
router.get("/playlist/:playlistId",protect,getPlaylistTracksController);
router.get("/playlist/:playlistId/normalized",protect,getNormalizedPlaylistController);

export default router;


