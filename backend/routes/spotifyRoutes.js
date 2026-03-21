import express from "express";
const router = express.Router();
import { redirectToSpotify, spotifyCallback } from "../controllers/spotifyControllers.js";



router.get("/login" , redirectToSpotify);
router.get("/callback",spotifyCallback);

export default router;