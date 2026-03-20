import express from "express";
import { authorize } from "../middleware/authorize.js";
import { protect } from "../middleware/authMiddleware.js";
import { getAllusers } from "../controllers/adminControllers.js";
const router =  express.Router();

export default router.get("/users",protect,authorize("admin"),getAllusers);
