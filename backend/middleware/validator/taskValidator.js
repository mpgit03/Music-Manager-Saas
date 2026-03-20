import { body } from "express-validator";

export const createTaskValidator = [

  body("title")
    .notEmpty()
    .withMessage("Task title is required"),

  body("status")
    .optional()
    .isIn(["pending", "in-progress", "completed"])
    .withMessage("Invalid task status")

];