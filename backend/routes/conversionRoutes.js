import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getConversions ,getConversionById, retryConversion } from "../controllers/conversionControllers.js";
import { convertPlaylistController } from "../controllers/conversionControllers.js";

const router = express.Router();    


router.post("/:playlistId", protect, convertPlaylistController);
router.post("/:conversionId/retry" , protect , retryConversion);
router.get("/",protect,getConversions);
router.get("/:id",protect,getConversionById);

export default router;