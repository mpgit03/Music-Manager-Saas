import express from "express"
import {checkOwnership}from "../middleware/checkownership.js"
import { getProject,deleteProject,updateProject, createProject,getProjects } from "../controllers/projectController.js"
import { protect } from "../middleware/authMiddleware.js"
import taskRoutes from "../routes/taskRoutes.js"
import Project from "../models/Project.js";
import { createProjectValidator } from "../middleware/validator/projectValidator.js"
import { validateRequest } from "../middleware/validateRequest.js"
 
const router =express.Router();

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created successfully
 */


router.post("/", protect, createProject);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of projects
 */
router.get("/", protect, getProjects);
router.route("/")
   .get(protect,getProjects)
   .post(protect ,createProjectValidator,validateRequest,createProject)


   /**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project found
 */
router.get("/:id", protect, getProjects);
router.route("/:id") 
    .delete(protect,checkOwnership(Project),deleteProject)
    .get(protect,checkOwnership(Project),getProject)  
    .put(protect,checkOwnership(Project),updateProject)

router .use("/:projectId/tasks",taskRoutes)    
    
export default router;