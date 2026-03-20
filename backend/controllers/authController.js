import User from "../models/User.js"
import {asynchandler} from "../middleware/asynchandler.js"
import generateToken from "../utils/generateToken.js"

const registerUser = asynchandler(
    async(req,res)=>{
        const {name,email,password} = req.body
        if(!name|!email|!password) {
            res.status(400)
            throw new Error("All field required")
        }

        const userExists = await User.findOne({email})
        console.log("User found:", userExists);
        
        if(userExists){
            res.status(400)
            
            throw new Error("User already exists")
        }

        const user = await User.create({
            name,
            email,
            password
        })
        res.status(201).json({
            id:user._id,
            name:user.name,
            email:user.email
        })
 })


const loginUser = asynchandler(
    async (req,res)=>{
        const {email,password} = req.body;
        const user = await User.findOne({email});
        if(user && await (user.matchPassword(password))){
            const token =  generateToken(user._id);

            res.json({
                id:user._id,
                name:user.name,
                email:user.email,
                token

            });
        }
        else{
            res.status(401);
            throw new Error("invalid email or password");
        }
    });

export const getMe = asynchandler(async(req,res)=>{
        res.status(200).json(req.user);
    });


export {registerUser,loginUser}