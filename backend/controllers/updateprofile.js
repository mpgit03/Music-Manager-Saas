import { asynchandler } from "../middleware/asynchandler.js"
import User from "../models/User.js"

export const updateprofile  = asynchandler(
    async (req,res)=>{
    const user = await User.findById(req.user._id);
    if(!user){
        res.status(404).json({
            message:"User not found"
        })
    }

    user.name = req.body.name|| user.name;
    user.email = req.body.email|| user.email;
    if(req.body.password){
        user.password = req.body.password
    }
    await user.save();
    res.status(200).json({
        success:true,
        user
    })
}
)