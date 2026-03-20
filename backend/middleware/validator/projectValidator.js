import {body} from "express-validator";
export const createProjectValidator = [
    body("name")
    .notEmpty()
    .withMessage("Project name is required")
    .isLength({min:3})
    .withMessage("Project name must be at least 3 characters"),
    body("description")
    .optional()
    .isLength({min:5})
    .withMessage("description must be atleast 5 characters")
] ;
