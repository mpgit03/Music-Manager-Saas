"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ConversionsPage() {
  const router = useRouter();

  const [conversions, setConversions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);
  
  
  const fetchConversions = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/conversions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch");

      let data;

      try {
        data = await res.json();
      } catch (err) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        return; // stop execution safely
      }

      setConversions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching conversions:", err);
      setConversions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id) => {
    try {
      const token = localStorage.getItem("token");
      setRetryingId(id);

      const res = await fetch(
        `http://localhost:5000/api/conversions/${id}/retry`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data;

      try {
        data = await res.json();
      } catch (err) {
        const text = await res.text();
        console.error("Retry response error:", text);
        return;
      }

      router.push(`/conversions/${data.conversion._id}`);
    } catch (err) {
      console.error("Retry failed:", err);
    } finally {
      setRetryingId(null);
    }
  };

  const [isPolling, setIsPolling] = useState(false);

useEffect(() => {
  fetchConversions();
}, []);

useEffect(() => {
  if (process.env.NODE_ENV !== "production") return;
  if (!conversions.length) return;

  const hasActive = conversions.some(
    (c) => c.status === "processing" || c.status === "queued"
  );

  if (hasActive && !isPolling) {
    setIsPolling(true);
  }

  if (!hasActive && isPolling) {
    setIsPolling(false);
  }
}, [conversions]);

useEffect(() => {
  if (!isPolling) return;

  const interval = setInterval(fetchConversions, 5000);
  return () => clearInterval(interval);
}, [isPolling]);


  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 h-8 w-56 animate-pulse rounded-lg bg-[#1f1f1f]" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-[#181818] p-5"
              >
                <div className="mb-4 h-4 w-3/4 animate-pulse rounded bg-[#2a2a2a]" />
                <div className="mb-5 h-3 w-1/2 animate-pulse rounded bg-[#232323]" />
                <div className="mb-4 h-2 w-full animate-pulse rounded bg-[#2a2a2a]" />
                <div className="mb-5 h-3 w-1/3 animate-pulse rounded bg-[#232323]" />
                <div className="flex gap-2">
                  <div className="h-8 w-16 animate-pulse rounded-full bg-[#2a2a2a]" />
                  <div className="h-8 w-16 animate-pulse rounded-full bg-[#2a2a2a]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 🔥 sort by priority
  const priority = {
    failed: 0,
    processing: 1,
    queued: 1,
    completed: 2,
  };

  const sortedConversions = [...conversions].sort(
    (a, b) => priority[a.status] - priority[b.status]
  );

  return (
    <div className="min-h-screen bg-[#121212] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-white">
          🔄 My Conversions
        </h1>

        {sortedConversions.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-[#181818] px-6 py-5 text-sm text-[#b3b3b3] shadow-md shadow-black/30">
            No conversions yet
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {sortedConversions.map((conv) => {
              const total = conv.progress?.total ?? 0;
              const success = conv.progress?.success ?? 0;
              const failed = conv.progress?.failed ?? 0;

              const successPercent = total > 0 ? (success / total) * 100 : 0;
              const failedPercent = total > 0 ? (failed / total) * 100 : 0;

              const statusColors =
                conv.status === "completed"
                  ? {
                      badge: "bg-green-500/10 text-green-400 border-green-500/25",
                      border: "border-green-500/30 ring-green-500/10",
                      progress: "bg-green-400",
                    }
                  : conv.status === "failed"
                  ? {
                      badge: "bg-red-500/10 text-red-400 border-red-500/25",
                      border: "border-red-500/30 ring-red-500/10",
                      progress: "bg-red-400",
                    }
                  : {
                      badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/25",
                      border: "border-yellow-500/30 ring-yellow-500/10",
                      progress: "bg-amber-400",
                    };

              return (
                <div
                  key={conv._id}
                  className={`group rounded-2xl border ${statusColors.border} ring-1 bg-gradient-to-b from-[#1a1a1a] to-[#121212] p-5 
                  shadow-md shadow-black/30 
                  hover:shadow-xl hover:shadow-black/50 
                  hover:scale-[1.025] hover:ring-1 hover:ring-1 
                  transition-all duration-300`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold leading-tight text-white">
                        {conv.sourcePlatform} → {conv.targetPlatform}
                      </h2>
                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(conv.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusColors.badge}`}
                    >
                      {conv.status}
                    </span>
                  </div>

                  <div className="mb-5">
                    <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs text-gray-400">Progress</p>

                    <p className="text-xs text-gray-400 tabular-nums w-[60px] text-right">
                      {success+failed} / {total}
                    </p>
                  </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#2a2a2a] flex">
                    {/* success (green) */}
                    <div
                      className="bg-green-400 h-full"
                      style={{ width: `${successPercent}%` }}
                    />

                    {/* failed (red) */}
                    <div
                      className="bg-red-400 h-full"
                      style={{ width: `${failedPercent}%` }}
                    />
                  </div>
                    <p className="mt-3 text-xs text-gray-400">
                      {success} / {total} tracks
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        router.push(`/conversions/${conv._id}`)
                      }
                      className="rounded-full bg-[#2a2a2a] px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-[#3a3a3a]"
                    >
                      View
                    </button>

                    {conv.status === "failed" && (
                      <button
                        onClick={() => handleRetry(conv._id)}
                        disabled={retryingId === conv._id}
                        className={`rounded-full px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:scale-105 ${
                          retryingId === conv._id
                            ? "cursor-not-allowed bg-[#535353]"
                            : "bg-amber-500 hover:bg-amber-400"
                        }`}
                      >
                        {retryingId === conv._id
                          ? "Retrying..."
                          : "Retry"}
                      </button>
                    )}

                    {conv.status === "completed" &&
                      conv.targetPlaylistUrl && (
                        <a
                          href={conv.targetPlaylistUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-[#1DB954] px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-[#1ed760]"
                        >
                          Open
                        </a>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}