import dotenv from 'dotenv';
import axios from "axios";
import {asynchandler} from "../middleware/asynchandler.js";

dotenv.config();
export const redirectToSpotify = asynchandler(
  (req, res) => {
    const scope = "playlist-read-private playlist-modify-private playlist-modify-public"
    const authurl = "https://accounts.spotify.com/authorize?"+
      new URLSearchParams({
        response_type:"code",
        client_id:process.env.SPOTIFY_CLIENT_ID,
        scope:scope,
        redirect_uri:process.env.SPOTIFY_REDIRECT_URI,
      })
      console.log("authurl :",authurl);
      res.redirect(authurl);
}
)



export const spotifyCallback = asynchandler(
  async (req,res)=>{
    const code = req.query.code;
    if(!code){
      res.status(401);
      throw new Error("Authorization code missing");
    }

    const tokenResponse = await axios.post("https://accounts.spotify.com/api/token",new URLSearchParams({
      code:code,
      redirect_uri:process.env.SPOTIFY_REDIRECT_URI,
      grant_type: "authorization_code"
    }).toString(),
    {
      headers: {
      "Content-type":"application/x-www-form-urlencoded",
      Authorization : "Basic " +
      Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64"),
    },}
     );

     const {access_token,refresh_token,expires_in} = tokenResponse.data;
      res.status(200).json({
      success:true,
      access_token,
      refresh_token,
      expires_in
     });



     const userProfile = await axios.get("https://api.spotify.com/v1/me",{
      headers:{
        Authorization: `Bearer ${access_token}`,
      }
     });

     console.log(userProfile.data);
    //  res.status(200).json({
    //   success:true,
    //   access_token,
    //   refresh_token,
    //   expires_in
    //  });

  }
);





