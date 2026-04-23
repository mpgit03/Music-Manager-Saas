import { asynchandler } from "../middleware/asynchandler.js";
import {searchTrackOnYoutube } from "../services/youtube.services.js";
import Account from "../models/Account.js";
import axios from "axios";
import mongoose from "mongoose";


export const testYouTubeMatch = async (req, res) => {
  const track = {
    title: "Without You",
    artists: ["Avicii"],  
  };

  const result = await searchTrackOnYoutube(track);

  res.json(result);
};

export const connectYouTube = asynchandler(
  (req, res) => {
  const {userId}= req.query;

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(
      "https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.readonly"
    )}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${userId}`;

  res.redirect(authUrl);
}
)


export const youtubecallback = asynchandler(
  async (req,res)=>{
    const code = req.query.code;
    const userId=req.query.state;

    if(!code|| !userId){
      res.status(401);
      throw new Error("Authorization code missing");
    }
    console.log("REDIRECT URI:", process.env.GOOGLE_REDIRECT_URI);

    let tokenResponse;

try {
  tokenResponse = await axios.post(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
} catch (err) {
  console.error(" GOOGLE ERROR FULL:", err.response?.data);
  return res.status(400).json({
    error: err.response?.data || err.message,
  });
}

     const {access_token,refresh_token,expires_in,refresh_token_expires_in} = tokenResponse.data;

     const response = await axios.get("https://www.googleapis.com/youtube/v3/channels" , 
      {
        params:{
          part:"id",
          mine:true,
        },
        headers:{
          Authorization:`Bearer ${access_token}`
        }
      }
     );

     if (!response.data.items.length) {
     throw new Error("No YouTube channel found for this user");
    }

     const channelId = response.data.items[0].id;

     let account = await Account.findOne({
      user:new mongoose.Types.ObjectId(userId),
      provider:"youtube"
     });


     if(!account){
      account = await Account.create({
        user: new mongoose.Types.ObjectId(userId),
        provider:"youtube",
        providerAccountId:channelId,
        accessToken:access_token,
        refreshToken:refresh_token,
        expiresAt: new Date( Date.now() + expires_in * 1000),
        refreshExpiresAt : refresh_token_expires_in
        ? new Date(Date.now() + refresh_token_expires_in * 1000)
        : undefined,
        });

     }
     else{
      account.accessToken = access_token;
      if(refresh_token) account.refreshToken = refresh_token;
      account.expiresAt = new Date( Date.now() + expires_in * 1000);
      if(refresh_token_expires_in){
        account.refreshExpiresAt = new Date(
          Date.now() + refresh_token_expires_in * 1000);
      }
      await account.save();
     }

     res.redirect(`${process.env.FRONTEND_URL}/dashboard?youtube=success`);
  });

// Youtube reconnect for refresh token expiry error
  export const youtubeReconnect = asynchandler(async (req, res) => {
  const userId = req.user._id;

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube",
    access_type: "offline",
    prompt: "consent", //  ensures refresh_token
    state: userId.toString(),
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  res.redirect(authUrl);
});

