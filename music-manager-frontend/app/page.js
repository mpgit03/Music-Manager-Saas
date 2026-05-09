"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.push("/dashboard");
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      {/* Background Glow Effects */}
      <div className="absolute left-[-120px] top-[-120px] h-[400px] w-[400px] rounded-full bg-green-500/20 blur-3xl" />
      <div className="absolute bottom-[-120px] right-[-120px] h-[400px] w-[400px] rounded-full bg-red-500/20 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Navbar */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            Music Manager
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-white/10"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="rounded-2xl bg-white px-5 py-2.5 text-sm font-black text-black transition-all duration-300 hover:scale-105 hover:bg-gray-200"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pb-20 pt-10 text-center">

        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-gray-300 backdrop-blur-xl">
          <span>🎵</span>
          Spotify ↔ YouTube Playlist Transfer
        </div>

        <h1 className="mt-8 max-w-5xl text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          Move Your Music
          <span className="bg-gradient-to-r from-green-400 via-blue-400 to-red-400 bg-clip-text text-transparent">
            {" "}
            Across Platforms
          </span>
        </h1>

        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-gray-400 sm:text-xl">
          Convert playlists between Spotify and YouTube with OAuth-powered integrations,
          async processing, conversion tracking, retry support, and a sleek modern interface.
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-3xl bg-gradient-to-r from-green-500 via-blue-500 to-red-500 px-10 py-5 text-lg font-black shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-blue-500/30"
          >
            Get Started →
          </Link>

          <Link
            href="/login"
            className="rounded-3xl border border-white/10 bg-white/5 px-10 py-5 text-lg font-semibold text-white backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:bg-white/10"
          >
            Login
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid w-full gap-8 lg:grid-cols-3">

          {/* Feature 1 */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-left backdrop-blur-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.07]">
            <div className="mb-6 inline-flex rounded-2xl bg-green-500/10 px-4 py-3 text-3xl">
              🎧
            </div>

            <h3 className="text-2xl font-bold">
              Spotify Integration
            </h3>

            <p className="mt-4 text-gray-400 leading-relaxed">
              Connect your Spotify account securely with OAuth and import playlists instantly.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-left backdrop-blur-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.07]">
            <div className="mb-6 inline-flex rounded-2xl bg-red-500/10 px-4 py-3 text-3xl">
              ▶️
            </div>

            <h3 className="text-2xl font-bold">
              YouTube Conversion
            </h3>

            <p className="mt-4 text-gray-400 leading-relaxed">
              Create YouTube playlists automatically with intelligent track matching.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-left backdrop-blur-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.07]">
            <div className="mb-6 inline-flex rounded-2xl bg-blue-500/10 px-4 py-3 text-3xl">
              ⚡
            </div>

            <h3 className="text-2xl font-bold">
              Async Processing
            </h3>

            <p className="mt-4 text-gray-400 leading-relaxed">
              Production-style queue architecture with progress tracking and retry support.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid w-full gap-6 rounded-[40px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl md:grid-cols-3">

          <div>
            <h2 className="text-4xl font-black text-green-400">
              OAuth
            </h2>
            <p className="mt-2 text-gray-400">
              Secure authentication flows
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-black text-blue-400">
              Async Jobs
            </h2>
            <p className="mt-2 text-gray-400">
              Reliable background conversion
            </p>
          </div>

          <div>
            <h2 className="text-4xl font-black text-red-400">
              Retry System
            </h2>
            <p className="mt-2 text-gray-400">
              Recover failed track conversions
            </p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-24 flex flex-col items-center text-center">
          <h2 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
            Start Converting Your Playlists Today
          </h2>

          <p className="mt-6 max-w-2xl text-lg text-gray-400">
            Connect your accounts and seamlessly move your music ecosystem across platforms.
          </p>

          <Link
            href="/signup"
            className="mt-10 rounded-3xl bg-white px-10 py-5 text-lg font-black text-black transition-all duration-500 hover:scale-105 hover:bg-gray-200"
          >
            Launch App →
          </Link>
        </div>
      </main>
    </div>
  );
}