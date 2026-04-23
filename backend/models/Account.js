import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required:true,
    },
    provider:{
        type:String,
        enum:["spotify","youtube"],
        required:true,
    },
    providerAccountId:{
        type:String,
        required:true,
    },
    accessToken:{
        type:String,
        required:true,
    },
    refreshToken:{
        type:String,
        required:true,
    },
    expiresAt:{
        type:Date,
        required:true,
    },
    refreshExpiresAt:{
        type:Date,
    },
},
{timestamps:true});


accountSchema.index({user:1,provider:1},{unique:true});


const Account = mongoose.model("Account",accountSchema);
export default Account;