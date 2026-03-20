import dotenv from 'dotenv';
dotenv.config();
const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

export const redirectToSpotify = (req, res) => {
    const scope = "playlist-read-private playlist-modify-private playlist-modify-public"
    const authurl = "https://accounts.spotify.com/authorize?"+
      new URLSearchParams({
        response_type:"code",
        client_id:CLIENT_ID,
            scope:scope,
            redirect_uri:REDIRECT_URI,
      })

      res.redirect(authurl);
}