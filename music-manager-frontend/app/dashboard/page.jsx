"use client";
export const dynamic = "force-dynamic";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchUser = async () => {
    const token = localStorage.getItem("token");

    setError("");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 10000);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

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

      if (err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError("Failed to load dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

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

      setTimeout(() => {
        router.replace("/dashboard");
      }, 100);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[#050505]">
        <div className="absolute h-[300px] w-[300px] rounded-full bg-green-500/20 blur-3xl" />
        <div className="absolute right-0 h-[300px] w-[300px] rounded-full bg-red-500/20 blur-3xl" />

        <div className="z-10 rounded-3xl border border-white/10 bg-white/5 px-10 py-6 backdrop-blur-xl">
          <p className="animate-pulse text-xl font-semibold text-white">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505] px-4">
        <div className="w-full max-w-md rounded-[32px] border border-red-500/20 bg-white/5 p-8 text-center backdrop-blur-2xl">
          <p className="text-lg text-red-300">{error}</p>

          <button
            onClick={() => {
              setLoading(true);
              fetchUser();
            }}
            className="mt-5 rounded-2xl bg-white px-6 py-3 font-semibold text-black transition-all duration-300 hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">

      {/* BACKGROUND GLOWS */}
      <div className="absolute left-[-100px] top-[-100px] h-[350px] w-[350px] rounded-full bg-green-500/20 blur-3xl" />
      <div className="absolute bottom-[-100px] right-[-100px] h-[350px] w-[350px] rounded-full bg-red-500/20 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col px-4 py-10">

        {/* TOP BAR */}
        <div className="mb-12 flex items-center justify-between rounded-[32px] border border-white/10 bg-white/5 px-8 py-6 backdrop-blur-2xl">
          <div>
            <h1 className="text-5xl font-black tracking-tight">
              Music Manager
            </h1>

            <p className="mt-2 text-lg text-gray-400">
              Convert playlists seamlessly across platforms.
            </p>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/login");
            }}
            className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 text-sm font-medium text-gray-200 transition-all duration-300 hover:scale-105 hover:bg-white/20"
          >
            Logout
          </button>
        </div>

        {/* USER CARD */}
        <div className="mb-10 rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-4xl font-bold tracking-tight">
                Welcome back, {user?.name}
              </h2>

              <p className="mt-2 text-lg text-gray-400">
                {user?.email}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-3 md:mt-0">
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300">
                Spotify {user?.spotifyConnected ? "Connected" : "Disconnected"}
              </div>

              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300">
                YouTube {user?.youtubeConnected ? "Connected" : "Disconnected"}
              </div>
            </div>
          </div>
        </div>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="mb-8 rounded-[28px] border border-green-500/20 bg-green-500/10 px-6 py-5 text-lg font-medium text-green-300 backdrop-blur-xl">
            {message}
          </div>
        )}

        {/* PLATFORM CARDS */}
        <div className="grid gap-8 lg:grid-cols-2">

          {/* SPOTIFY */}
          <div className="group relative overflow-hidden rounded-[36px] border border-green-400/20 bg-gradient-to-br from-green-400 via-green-500 to-green-700 p-8 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-green-500/30">

            <div className="absolute right-[-40px] top-[-40px] h-40 w-40 rounded-full bg-white/10 blur-2xl transition-all duration-500 group-hover:scale-125" />

            <div className="relative z-10">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-5xl font-black text-white">
                    Spotify
                  </h2>

                  <p className="mt-3 max-w-sm text-lg text-white/80">
                    Import playlists directly from Spotify.
                  </p>
                </div>

                <div className="rounded-3xl bg-white/15 px-5 py-3 text-lg font-bold text-white backdrop-blur-xl">
                  🎧
                </div>
              </div>

              {user?.spotifyConnected ? (
                <div className="space-y-5">
                  <div className="rounded-3xl border border-white/10 bg-white/15 px-6 py-5 text-center text-2xl font-bold text-white backdrop-blur-xl">
                    Connected ✅
                  </div>

                  <button
                    onClick={() => {
                      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/spotify/login?userId=${user._id}`;
                    }}
                    className="w-full rounded-3xl bg-white/20 px-6 py-5 text-xl font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/30"
                  >
                    Reconnect Spotify
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/spotify/login?userId=${user._id}`;
                  }}
                  className="w-full rounded-3xl bg-white px-6 py-5 text-2xl font-black text-green-700 transition-all duration-300 hover:scale-[1.02] hover:bg-gray-100"
                >
                  Connect Spotify
                </button>
              )}
            </div>
          </div>

          {/* YOUTUBE */}
          <div className="group relative overflow-hidden rounded-[36px] border border-red-400/20 bg-gradient-to-br from-red-400 via-red-500 to-red-700 p-8 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-red-500/30">

            <div className="absolute right-[-40px] top-[-40px] h-40 w-40 rounded-full bg-white/10 blur-2xl transition-all duration-500 group-hover:scale-125" />

            <div className="relative z-10">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-5xl font-black text-white">
                    YouTube
                  </h2>

                  <p className="mt-3 max-w-sm text-lg text-white/80">
                    Create playlists instantly on YouTube.
                  </p>
                </div>

                <div className="rounded-3xl bg-white/15 px-5 py-3 text-lg font-bold text-white backdrop-blur-xl">
                  ▶️
                </div>
              </div>

              {user?.youtubeConnected ? (
                <div className="space-y-5">
                  <div className="rounded-3xl border border-white/10 bg-white/15 px-6 py-5 text-center text-2xl font-bold text-white backdrop-blur-xl">
                    Connected ✅
                  </div>

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
                    className="w-full rounded-3xl bg-white/20 px-6 py-5 text-xl font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/30"
                  >
                    Reconnect YouTube
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/youtube/login?userId=${user._id}`;
                  }}
                  className="w-full rounded-3xl bg-white px-6 py-5 text-2xl font-black text-red-700 transition-all duration-300 hover:scale-[1.02] hover:bg-gray-100"
                >
                  Connect YouTube
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MAIN CTA */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => router.push("/playlists?source=spotify")}
            className="group relative overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-12 py-6 text-2xl font-black shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-purple-500/40"
          >
            <span className="relative z-10">Convert Playlist →</span>

            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-black text-white">
          Loading...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}