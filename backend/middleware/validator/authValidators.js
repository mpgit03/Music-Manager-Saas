import {body} from "express-validator"
export const registerValidator = [
    body("name")
    .notEmpty()
    .withMessage("Name required")
    .isLength({min:3})
    .withMessage("Name must be atleast 3 characters"),
    body("email")
    .isEmail()
    .withMessage("Valid Email is required"),
    body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({min:6})
    .withMessage("Password must be atleast 6 characters")
];

export const loginValidator = [
    body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required"),
    body("password")
    .notEmpty()
    .withMessage("Password is required")
    
]