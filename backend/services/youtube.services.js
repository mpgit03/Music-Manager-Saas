import axios from "axios";
import { buildSearchQuery } from "../utils/queryBuilder.js";
import { getValidYoutubeToken } from "../utils/youtubeToken.js";

// 🔍 Search YouTube
export const searchYoutube = async (query) => {
  try {
    if (!query || query.trim() === "") {
      throw new Error("Invalid query");
    }

    console.log("🔍 YouTube query:", query);

    const res = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          key: process.env.YOUTUBE_API_KEY,
          maxResults: 3,
          type: "video",
        },
      }
    );

    console.log("✅ YouTube success:", res.data.items?.length);

    return res.data.items || [];
  } catch (err) {
    console.error("❌ YOUTUBE ERROR STATUS:", err.response?.status);
    console.error("❌ YOUTUBE ERROR DATA:", err.response?.data);

    throw err; // important
  }
};



// 🎯 Pick best match
export const pickBestMatch = (results, track) => {
  if (!results || results.length === 0) return null;

  const trackTitle = track.title?.toLowerCase() || "";
  const trackArtists = (track.artists || []).join(" ").toLowerCase();

  let bestscore = -Infinity;
  let bestvideo = null;

  for (const video of results) {
    let score = 0;
    const title = video.snippet.title.toLowerCase();

    if (title.includes(trackTitle)) score += 5;
    if (title.includes(trackArtists)) score += 3;

    // penalties
    if (title.includes("remix")) score -= 3;
    if (title.includes("live")) score -= 3;
    if (title.includes("lyrics")) score -= 2;

    if (score > bestscore) {
      bestscore = score;
      bestvideo = video;
    }
  }

  return bestvideo;
};



// 🔄 Convert single track
export const searchTrackOnYoutube = async (track) => {
  try {
    console.log("🟡 TRACK:", track);

    const query = buildSearchQuery(track);

    console.log("🟡 QUERY:", query);

    if (!query || query.trim() === "") {
      console.log("⚠️ Skipping invalid query");
      return null;
    }

    const results = await searchYoutube(query);

    console.log("🟢 RESULTS:", results.length);

    const best = pickBestMatch(results, track);

    if (!best) {
      console.log("❌ No match found");
      return null;
    }

    return {
      id: best.id.videoId,
      platform: "youtube",
      title: best.snippet.title,
      url: `https://www.youtube.com/watch?v=${best.id.videoId}`,
    };
  } catch (err) {
    console.error("❌ TRACK FAILED:", track.title);
    console.error("❌ ERROR:", err.response?.data || err.message);

    throw err;
  }
};



// 🚀 Convert playlist (SAFE VERSION)
export const convertPlaylistToYouTube = async (tracks) => {
  const batchSize = 5;
  const results = [];

  for (let i = 0; i < tracks.length; i += batchSize) {
    const batch = tracks.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (track) => {
        try {
          const yt = await searchTrackOnYoutube(track);

          return {
            title: track.title,
            artists: track.artists,
            album: track.album,
            duration_ms: track.duration_ms,
            isrc: track.isrc,

            source: {
              id: track.spotifyId,
              platform: "spotify",
            },

            target: yt,
          };
        } catch (err) {
          console.error("❌ TRACK FAILED IN BATCH:", track.title);
          return null; // prevent crash
        }
      })
    );

    // remove failed ones
    results.push(...batchResults.filter(Boolean));
  }

  return results;
};



export const createYouTubePlaylist = async (accessToken, title) => {
  

  console.log(`source playlist name ${title}`);
  const playlistData = {
    snippet: {
      title: title ,
      description: "Created by Music Manager",
    },
    status: {
      privacyStatus: "private",
    },
  };

  try {
    const response = await axios.post(
      "https://www.googleapis.com/youtube/v3/playlists?part=snippet,status",
      playlistData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      id: response.data.id,
      url: `https://www.youtube.com/playlist?list=${response.data.id}`,
    };

  } catch (err) {
    console.error(
      "❌ YouTube playlist creation failed:",
      err.response?.data || err.message
    );
    throw new Error("YouTube playlist creation failed");
  }
};


export const addVideoToYoutubePlaylistInternal = async (
  playlistId,
  videoId,
  accessToken
) => {
  if (!playlistId || !videoId) {
    throw new Error("playlistId and videoId are required");
  }

  try {
    const response = await axios.post(
      "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet",
      {
        snippet: {
          playlistId,
          resourceId: {
            kind: "youtube#video",
            videoId,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      id: response.data.id,
      videoId,
    };

  } catch (err) {
    const errorData = err.response?.data;

    // 🔥 Handle common API errors cleanly
    if (err.response?.status === 403) {
      console.error("❌ YouTube quota or permission error:", errorData);
    } else if (err.response?.status === 404) {
      console.error("❌ Video not found:", videoId);
    } else if (err.response?.status === 401) {
      console.error("❌ Unauthorized (token issue)");
    } else {
      console.error("❌ Add video failed:", errorData || err.message);
    }

    throw new Error("Failed to add video to YouTube playlist");
  }
};