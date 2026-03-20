import express from "express";
const router = express.Router();
import { redirectToSpotify } from "../controllers/spotifyControllers.js";



router.get("/login" , redirectToSpotify);

export default router;