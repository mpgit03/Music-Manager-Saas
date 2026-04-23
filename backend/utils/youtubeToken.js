import ExpressMongoSanitize from "express-mongo-sanitize";

import axios from "axios";

export const getValidYoutubeToken = async (account) => {
  try {
    // Access token still valid
    if (account.expiresAt && Date.now() < account.expiresAt.getTime()) {
      return account.accessToken;
    }

    console.log("🔄 Refreshing YouTube token...");

    const res = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: account.refreshToken,
      grant_type: "refresh_token",
    });

    const newToken = res.data.access_token;

    account.accessToken = newToken;
    account.expiresAt = new Date(Date.now() + res.data.expires_in * 1000);

    await account.save();

    return newToken;

  } catch (err) {
    const errorData = err.response?.data;

    // 🔥 ONLY case for reconnect
    if (errorData?.error === "invalid_grant") {
      throw new Error("YOUTUBE_RECONNECT_REQUIRED");
    }

    console.error("❌ YouTube Token Refresh Failed:", errorData || err.message);
    console.log("error data;" , errorData);
    console.log("err.message:",err.message);

    //  propagate original error
    throw new Error(err.message);
  }
};