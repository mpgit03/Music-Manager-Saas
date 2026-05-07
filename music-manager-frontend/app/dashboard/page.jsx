"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🔥 handle non-JSON safely
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch user");
      }

      const data = await res.json();
      setUser(data);

    } catch (err) {
      console.error("Fetch user error:", err);
      // ❌ DO NOT logout on random errors
    } finally {
      setLoading(false);
    }
  };

  // ✅ Run once only
  useEffect(() => {
    fetchUser();
  }, []);

  // ✅ Handle OAuth redirect safely
  useEffect(() => {
    const spotify = searchParams.get("spotify");
    const youtube = searchParams.get("youtube");

    if (spotify === "success" || youtube === "success") {
      setMessage(
        spotify
          ? "Spotify connected successfully 🎧"
          : "YouTube connected successfully ▶️"
      );

      fetchUser();

      // clean URL AFTER render
      setTimeout(() => {
        router.replace("/dashboard");
      }, 100);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen items-center justify-center gap-6">
      
      {/* USER INFO */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.name}
        </h1>
        <p className="text-gray-500">{user?.email}</p>
      </div>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded">
          {message}
        </div>
      )}

      {/* SPOTIFY */}
      {user?.spotifyConnected ? (
        <div className="flex flex-col items-center gap-2">
          <span className="text-green-600 font-semibold">
            Spotify Connected ✅
          </span>

          <button
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/spotify/login?userId=${user._id}`;
            }}
            className="bg-gray-500 text-white px-3 py-1 rounded"
          >
            Reconnect
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/spotify/login?userId=${user._id}`;
          }}
          className="bg-green-500 text-white px-4 py-2 rounded-lg"
        >
          Connect Spotify
        </button>
      )}

      {/* YOUTUBE */}
      {user?.youtubeConnected ? (
        <div className="flex flex-col items-center gap-2">
          <span className="text-green-600 font-semibold">
            YouTube Connected ✅
          </span>

          <button
          onClick={async () => {

            try {
              const token = localStorage.getItem("token");

              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/youtube/reconnect`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const data = await res.json();

              if (data.authUrl) {
                window.location.href = data.authUrl;
              }

            } catch (err) {
              console.error("Reconnect failed:", err);
            }
          }}
          className="bg-gray-500 text-white px-3 py-1 rounded"
        >
          Reconnect
        </button>
        </div>
      ) : (
        <button
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/youtube/login?userId=${user._id}`;
          }}
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Connect YouTube
        </button>
      )}
      <button onClick={() => router.push("/playlists?source=spotify")}>
        Convert from Spotify
      </button>

      {/* LOGOUT */}
      <button
        onClick={() => {
          localStorage.removeItem("token");
          router.push("/login");
        }}
        className="bg-black text-white px-4 py-2 rounded-lg"
      >
        Logout
      </button>
    </div>
  );
}