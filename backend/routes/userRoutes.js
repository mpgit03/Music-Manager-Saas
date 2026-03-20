import express from "express"
import { getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { updateprofile } from "../controllers/updateprofile.js";


const router = express.Router();

router.get("/getme",protect,getMe);
router.put("/profile",protect,updateprofile)

export default router;