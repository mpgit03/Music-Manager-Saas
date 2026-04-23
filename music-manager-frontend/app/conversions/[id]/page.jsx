"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

export default function ConversionPage() {
  const { id } = useParams();

  const [conversion, setConversion] = useState(null);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef(null);

  const fetchConversion = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversions/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setConversion(data);

      // 🔥 Stop polling when done
      if (data.status === "completed" || data.status === "failed") {
        clearInterval(intervalRef.current);
      }
    } catch (err) {
      console.error("Error fetching conversion:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversion();

    intervalRef.current = setInterval(fetchConversion, 3000);

    return () => clearInterval(intervalRef.current);
  }, [id]);

  const handleRetry = async () => {
    const token = localStorage.getItem("token");

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversions/${id}/retry`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchConversion();
    } catch (err) {
      console.error("Retry failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] text-white">
        Loading...
      </div>
    );
  }

  if (!conversion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121212] text-white">
        Conversion not found
      </div>
    );
  }

  // 🔥 Progress calculation
  const progressData = conversion.progress || {};
  const percent =
    progressData.total > 0
      ? Math.round((progressData.processed / progressData.total) * 100)
      : 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#181818] p-6 shadow-lg">

        <h1 className="text-xl font-bold mb-4 text-center">
          Conversion Status
        </h1>

        {/* STATUS */}
        <div className="text-center mb-4">
          {conversion.status === "queued" && (
            <p className="text-yellow-400">Queued...</p>
          )}
          {conversion.status === "processing" && (
            <p className="text-blue-400">Processing...</p>
          )}
          {conversion.status === "completed" && (
            <p className="text-green-400">
              Completed ✅ Playlist ready!
            </p>
          )}
          {conversion.status === "failed" && (
            <p className="text-red-400">Failed ❌</p>
          )}
        </div>

        {/* 🔥 PLAYLIST LINK */}
        {conversion.status === "completed" && conversion.targetPlaylistId && (
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-400 mb-2">
              {conversion.sourcePlaylistName} (Converted)
            </p>

            <a
              href={`https://www.youtube.com/playlist?list=${conversion.targetPlaylistId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 rounded bg-green-600 hover:bg-green-500 transition font-semibold"
            >
              Open YouTube Playlist 🎵
            </a>
          </div>
        )}

        {/* 🔥 PROGRESS BAR */}
        {progressData.total > 0 && (
          <div className="mb-4">
            <div className="h-2 w-full rounded bg-[#2a2a2a] overflow-hidden">
              <div
                className="h-2 bg-green-500 transition-all duration-500 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>

            <p className="mt-2 text-center text-sm text-gray-400">
              {percent}% • {progressData.processed}/{progressData.total} tracks
            </p>
          </div>
        )}

        {/* 🔥 STATS */}
        {progressData.total > 0 && (
          <div className="grid grid-cols-3 gap-2 text-xs text-center text-gray-400 mb-4">
            <div>
              <p className="text-white font-semibold">
                {progressData.success || 0}
              </p>
              <p>Success</p>
            </div>
            <div>
              <p className="text-white font-semibold">
                {progressData.failed || 0}
              </p>
              <p>Failed</p>
            </div>
            <div>
              <p className="text-white font-semibold">
                {progressData.total}
              </p>
              <p>Total</p>
            </div>
          </div>
        )}

        {/* 🔥 FAILED WARNING */}
        {progressData.failed > 0 && (
          <p className="text-yellow-400 text-xs text-center mb-3">
            {progressData.failed} tracks could not be added
          </p>
        )}

        {/* ERROR */}
        {conversion.error && (
          <p className="text-sm text-red-400 text-center mb-4">
            {conversion.error}
          </p>
        )}

        {/* ACTIONS */}
        <div className="flex justify-center gap-3">
          {conversion.status === "failed" && (
            <button
              onClick={handleRetry}
              className="px-4 py-2 rounded bg-yellow-500 text-black font-semibold"
            >
              Retry
            </button>
          )}

          {conversion.error === "YOUTUBE_AUTH_EXPIRED" && (
            <button
              onClick={() =>
                (window.location.href =
                  `${process.env.NEXT_PUBLIC_API_URL}/youtube/connect`)
              }
              className="px-4 py-2 rounded bg-red-500 text-white font-semibold"
            >
              Reconnect YouTube
            </button>
          )}
        </div>
      </div>
    </div>
  );
}