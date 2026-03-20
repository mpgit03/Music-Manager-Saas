import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import { createTask, deleteTask, getProjectTasks, updateTask } from "../controllers/taskController.js";
import { checkOwnership, checkProjectOwnership,checktaskOwnership } from "../middleware/checkownership.js";
import { createTaskValidator } from "../middleware/validator/taskValidator.js";
import upload from "../middleware/uploadmiddleware.js"
import { validateRequest } from "../middleware/validateRequest.js";


const router = express.Router({mergeParams:true});
//get or create tasks inside a project
router.get("/",protect,checkProjectOwnership,getProjectTasks);
router.post("/",protect,checkProjectOwnership,createTaskValidator,validateRequest,upload.single("file"),createTask);

//update or delete task by id

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated
 */
/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
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
 *         description: Task deleted
 */
router.delete("/:id", protect, deleteTask);
router.put("/:id", protect, updateTask);
router.put("/:taskId",protect,checktaskOwnership,updateTask);
router.delete("/:taskId",protect,checktaskOwnership,deleteTask);

export default router;