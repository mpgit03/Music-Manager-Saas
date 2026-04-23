import axios from "axios";

export const getValidSpotifyToken = async (account) => {
  try {
    if (Date.now() < account.expiresAt) {
      return account.accessToken;
    }

    console.log("🔄 Refreshing Spotify token...");

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: account.refreshToken,
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

    account.accessToken = response.data.access_token;

    // 🔥 IMPORTANT: refresh token may or may not come
    if (response.data.refresh_token) {
      account.refreshToken = response.data.refresh_token;
    }

    account.expiresAt = Date.now() + response.data.expires_in * 1000;

    await account.save();

    console.log("✅ Token refreshed");

    return account.accessToken;
  } catch (error) {
    console.error(
      "❌ Spotify token refresh error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to refresh Spotify token");
  }
};