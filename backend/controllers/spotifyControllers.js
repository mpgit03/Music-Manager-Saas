import dotenv from 'dotenv';
import mongoose from "mongoose"
import axios from "axios";
import {asynchandler} from "../middleware/asynchandler.js";
import Account from '../models/Account.js';
import { getPlaylistTracks, getSpotifyProfile,getUserPlaylists, refreshSpotifyToken } from '../services/spotify.services.js';
import User from '../models/User.js';
import { normalizePlaylistTracks} from '../utils/spotifyNormalizer.js';
import { getValidSpotifyToken } from '../utils/spotifyToken.js';
import  {buildSearchQuery}  from '../utils/queryBuilder.js';

dotenv.config();
export const redirectToSpotify = asynchandler(
  (req, res) => {
    const {userId} = req.query ;

    const state = userId;
    const scope = [
     "playlist-read-private",
     "playlist-modify-private",
     "playlist-modify-public",
     "user-read-email",
     "user-read-private",
     "playlist-read-collaborative",
].join(" ");

    const authurl = "https://accounts.spotify.com/authorize?"+
      new URLSearchParams({
        response_type:"code",
        client_id:process.env.SPOTIFY_CLIENT_ID,
        scope:scope,
        redirect_uri:process.env.SPOTIFY_REDIRECT_URI,
        state:state,
        show_dialog:"true",
      }).toString();

      console.log("authurl :",authurl);
      res.redirect(authurl);
      return;
}
)



export const spotifyCallback = asynchandler(
  async (req,res)=>{
    const code = req.query.code;
    const userId=req.query.state;

    if(!code|| !userId){
      res.status(401);
      throw new Error("Authorization code missing");
    }
    console.log("REDIRECT URI:", process.env.SPOTIFY_REDIRECT_URI);

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

     const userProfile = await axios.get("https://api.spotify.com/v1/me",{
      headers:{
        Authorization: `Bearer ${access_token}`,
      }
     });

     const spotifyUser = userProfile.data;
    
    let account  = await Account.findOne({
        user:userId,
        provider:"spotify"
      });


    if(!account){
     account = await Account.create({
      user: new mongoose.Types.ObjectId(userId),
      provider:"spotify",
      providerAccountId:spotifyUser.id,
      accessToken:access_token,
      refreshToken:refresh_token,
      expiresAt: new Date(Date.now()+expires_in*1000),
     });

    }
    else{
      account.accessToken = access_token;
      account.refreshToken = refresh_token;
      account.expiresAt = new Date(Date.now()+expires_in*1000);
      await account.save();
    }


    res.redirect(`${process.env.FRONTEND_URL}/dashboard?spotify=success`);

  });


export const getMySpotifyData = asynchandler(
  async(req,res)=>{
    console.log("req.user:", req.user);
    
    const account = await Account.findOne({
      user : req.user._id,
      provider : "spotify",
    }) ; 
    if(!account){
      res.status(404);
      throw new Error("Spotify account not connected");
    }

    const accessToken = await getValidSpotifyToken(account);
    const profile = await getSpotifyProfile(accessToken);
    const playlists = await getUserPlaylists(accessToken);

    res.json({
      success:true,
      profile,
      playlists,
    });
  }
)

export const getPlaylistTracksController = asynchandler(
  async (req, res) => {
    const { playlistId } = req.params;

    const account = await Account.findOne({
      user: req.user._id,
      provider: "spotify",
    });

    if (!account) {
      res.status(404);
      throw new Error("Spotify account not connected");
    }

    const accessToken = await getValidSpotifyToken(account);
    console.log("TOKEN:", account.accessToken);

    const tracks = await getPlaylistTracks(accessToken, playlistId);

    res.json(tracks);
  }
);

export const getUserPlaylistsController = asynchandler(async(req,res)=>{
    const account = await Account.findOne({
      user: req.user._id,
      provider: "spotify",
    });

    if (!account) {
      res.status(404);
      throw new Error("Spotify account not connected");
    }
    const accessToken = await getValidSpotifyToken(account);

    const playlists = await getUserPlaylists(accessToken);
    res.json(
    playlists.items.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.images?.[0]?.url,
    tracksCount: p.items?.total,
  }))
);


}
)

export const getNormalizedPlaylistController = asynchandler(
  async(req,res)=>{
    const {playlistId} = req.params;
    
    
    const account = await Account.findOne({
      user:req.user._id,
      provider : "spotify",
    });

    if(!account){
      res.status(404);
      throw new Error("Spotify Account not linked");
      
    }

    const accessToken = await getValidSpotifyToken(account);

    const data = await getPlaylistTracks(
      accessToken,
      playlistId
    );


    const items = Array.isArray(data) ? data : data?.items || [];

//     if (!items.length) {
//     return res.json({
//     Total: 0,
//     Tracks: [],
//       });
// }

    const normalizedTracks = normalizePlaylistTracks(items);

     console.log(buildSearchQuery(normalizedTracks[0]));

    res.json({
      Total:normalizedTracks.length,
      Tracks:normalizedTracks,
    });
    

  }
)

