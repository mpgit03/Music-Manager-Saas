import SpotifyWebApi from "spotify-web-api-node";

export const createSpotifyClient = (accessToken) => {
  const spotifyApi = new SpotifyWebApi();
  spotifyApi.setAccessToken(accessToken);
  return spotifyApi;
};