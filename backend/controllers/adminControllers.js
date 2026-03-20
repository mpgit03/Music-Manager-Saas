import User from "../models/User.js";

export const getAllusers = async(req,res)=>{
    const users = await User.find().select("-password");
    res.status(200).json(users);
}