import jwt from "jsonwebtoken"
import User from "../models/User.js";
import { asynchandler } from "./asynchandler.js";

const protect = asynchandler(async(req,res,next)=>{

    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        const token = req.headers.authorization.split(" ")[1];

        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decoded.id).select("-password");
        next();
    }
    else{
        res.status(401);
        throw new Error("not authorized,no token");
    }
});
export {protect};