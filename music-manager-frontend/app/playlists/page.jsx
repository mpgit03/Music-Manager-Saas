  "use client";
  export const dynamic = "force-dynamic";

  import { useEffect, useState } from "react";
  import { useSearchParams, useRouter } from "next/navigation";

  export default function PlaylistsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const source = searchParams.get("source"); // spotify / youtube

    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [convertingId, setConvertingId] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const fetchPlaylists = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/${source}/playlists`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setPlaylists(data);
      } catch (err) {
        console.error("Error fetching playlists:", err);
      } finally {
        setLoading(false);
      }
    };

    const handleConvert = async (playlistId) => {
    const token = localStorage.getItem("token");
    setConvertingId(playlistId);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversions/${playlistId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            sourcePlatform: source,
          }),
        }
      );

      const data = await res.json();

        router.push(`/conversions/${data.conversion._id}`);
      } catch (err) {
      console.error("Conversion failed:", err);
    } finally {
      setConvertingId(null);
    }
  };

    useEffect(() => {
      if (!source) return;
      fetchPlaylists();
    }, [source]);

    // 🚫 No source
    if (!source) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#121212] px-6 text-center">
          <p className="rounded-2xl border border-white/10 bg-[#181818] px-6 py-4 text-sm text-[#b3b3b3] shadow-lg">
            Select a source platform first
          </p>
        </div>
      );
    }

    // ⏳ Loading
    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#121212] px-6 text-center">
          <p className="rounded-2xl border border-white/10 bg-[#181818] px-6 py-4 text-sm text-[#b3b3b3] shadow-lg">
            Loading playlists...
          </p>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#121212] px-4 py-10 sm:px-6">
        <div className={`w-full ${isExpanded ? "max-w-6xl" : "max-w-xl"}`}>
          {/* TITLE + TOGGLE */}
          <div className="mb-5 flex items-center justify-between gap-4">
            <h1 className="text-left text-xl font-bold tracking-tight text-white sm:text-2xl">
              {source === "spotify"
                ? "🎧 Spotify Playlists"
                : "▶️ YouTube Playlists"}
            </h1>

            <div className="flex items-center gap-2">
            {/* My Conversions Button */}
            <button
              onClick={() => router.push("/conversions")}
              className="shrink-0 rounded-full border border-white/10 bg-[#1f1f1f] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#282828]"
            >
              My Conversions
            </button>

            {/* Expand Toggle */}
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="shrink-0 rounded-full border border-white/10 bg-[#1f1f1f] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#282828]"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </button>
          </div>
          </div>

          {/* 🚫 No playlists */}
          {playlists.length === 0 && (
            <p className="rounded-2xl border border-white/10 bg-[#181818] px-6 py-4 text-left text-sm text-[#b3b3b3]">
              No playlists found
            </p>
          )}

          {/* PLAYLIST LIBRARY */}
          <div
            className={`transition-all duration-300 ease-out ${
              isExpanded
                ? "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
                : "flex flex-col gap-1.5"
            }`}
          >
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className={`rounded-xl border border-white/10 bg-[#181818] transition-all duration-200 ${
                  isExpanded
                    ? "overflow-hidden shadow-md shadow-black/25 hover:scale-[1.015] hover:bg-[#202020] hover:shadow-lg hover:shadow-black/40"
                    : "flex items-center justify-between px-2.5 py-2 hover:bg-[#282828]"
                }`}
              >
                {isExpanded ? (
                  <div className="flex h-full flex-col">
                    <div className="aspect-square w-full bg-[#202020]">
                      {playlist.image ? (
                        <img
                          src={playlist.image}
                          alt={playlist.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-[#2a2a2a]" />
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-white">
                          {playlist.name}
                        </h2>
                        <p className="mt-1 text-xs text-[#b3b3b3]">
                          {playlist.tracksCount} tracks
                        </p>
                      </div>

                      <button
                        onClick={() => handleConvert(playlist.id)}
                        disabled={convertingId === playlist.id}
                        className={`mt-3 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-200 ${
                          convertingId === playlist.id
                            ? "cursor-not-allowed bg-[#535353]"
                            : "bg-[#1DB954] hover:bg-[#1ed760]"
                        }`}
                      >
                        {convertingId === playlist.id ? "Converting..." : "Convert"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex min-w-0 items-center gap-2.5">
                      {playlist.image ? (
                        <img
                          src={playlist.image}
                          alt={playlist.name}
                          className="h-11 w-11 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-md bg-[#2a2a2a]" />
                      )}

                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-white">
                          {playlist.name}
                        </h2>
                        <p className="text-xs text-[#b3b3b3]">
                          {playlist.tracksCount} tracks
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleConvert(playlist.id)}
                      disabled={convertingId === playlist.id}
                      className={`ml-2 shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-200 ${
                        convertingId === playlist.id
                          ? "cursor-not-allowed bg-[#535353]"
                          : "bg-[#1DB954] hover:bg-[#1ed760] active:scale-[0.98]"
                      }`}
                    >
                      {convertingId === playlist.id ? "Converting..." : "Convert"}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }