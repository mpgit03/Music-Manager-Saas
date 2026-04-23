import axios from "axios";
import { asynchandler } from "../middleware/asynchandler.js";


axios.interceptors.request.use((req) => {
  console.log("➡️ YOUTUBE REQUEST:", req.method?.toUpperCase(), req.url);
  return req;
});

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("❌ FAILED URL:", err.config?.url);
    console.error("❌ RESPONSE:", err.response?.data);
    return Promise.reject(err);
  }
);

export const getSpotifyProfile =
    async(accessToken)=>{
        const res = await axios.get("https://api.spotify.com/v1/me",{
            headers:{
                Authorization:`Bearer ${accessToken}`,
            },
        });
        return res.data;
    }



export const getUserPlaylists =
    async(accessToken)=>{
        const res = await axios.get("https://api.spotify.com/v1/me/playlists",{
            headers:{
                Authorization:`Bearer ${accessToken}`,
            },
        params:{limit:20} });

        return res.data;
    }


export const getPlaylistTracks = async (accessToken, playlistId) => {
  const res = await axios.get(
    `https://api.spotify.com/v1/playlists/${playlistId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  // console.log("FULL RESPONSE:", res.data);

  return res.data.items; 
};

export const refreshSpotifyToken = async (refreshToken) => {
  // console.log("REFRESH TOKEN BEING USED:", refreshToken);

  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.SPOTIFY_CLIENT_ID +
              ":" +
              process.env.SPOTIFY_CLIENT_SECRET
          ).toString("base64"),
      },
    }
  );

  return response.data;
};

