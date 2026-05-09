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
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-green-500/20 blur-3xl animate-pulse" />
        <div className="absolute right-[-120px] top-[20%] h-[420px] w-[420px] rounded-full bg-red-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-140px] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
      </div>

      {/* NAVBAR */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 via-blue-500 to-red-500 text-xl font-black shadow-lg shadow-blue-500/30">
            ♪
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Music Manager
            </h1>

            <p className="text-sm text-gray-400">
              Move playlists across platforms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-white/10"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-2xl bg-white px-5 py-2.5 text-sm font-black text-black transition-all duration-300 hover:scale-105 hover:bg-gray-200"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* HERO */}
      <main className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pb-24 pt-10 text-center">

        {/* PLATFORM BADGES */}
        <div className="flex flex-wrap items-center justify-center gap-8 rounded-[40px] border border-white/10 bg-white/5 px-10 py-6 backdrop-blur-2xl">

          {/* Spotify */}
          <div className="flex items-center gap-4 rounded-3xl bg-green-500/10 px-6 py-4 transition-all duration-300 hover:scale-105 hover:bg-green-500/20">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
              alt="Spotify"
              className="h-12 w-12"
            />

            <span className="text-lg font-bold text-green-300">
              Spotify
            </span>
          </div>

          {/* YouTube Music */}
          <div className="flex items-center gap-4 rounded-3xl bg-red-500/10 px-6 py-4 transition-all duration-300 hover:scale-105 hover:bg-red-500/20">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6a/Youtube_Music_icon.svg"
              alt="YouTube Music"
              className="h-12 w-12"
            />

            <span className="text-lg font-bold text-red-300">
              YouTube Music
            </span>
          </div>

          {/* Apple Music */}
          <div className="flex items-center gap-4 rounded-3xl bg-pink-500/10 px-6 py-4 transition-all duration-300 hover:scale-105 hover:bg-pink-500/20">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
              alt="Apple Music"
              className="h-12 w-12 rounded-full bg-white p-2"
            />

            <span className="text-lg font-bold text-pink-300">
              Apple Music
            </span>
          </div>
        </div>

        {/* HEADLINE */}
        <h1 className="mt-10 max-w-6xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-8xl">
          Your Music.
          <br />

          <span className="bg-gradient-to-r from-green-400 via-blue-400 to-red-400 bg-clip-text text-transparent">
            Everywhere You Want.
          </span>
        </h1>

        {/* SUBTEXT */}
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-gray-400 sm:text-xl">
          Seamlessly transfer playlists between Spotify, YouTube Music,
          Apple Music, and more. Keep your favorite songs with you no
          matter where you listen.
        </p>

        {/* CTA */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-500 via-blue-500 to-red-500 px-10 py-5 text-lg font-black shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-blue-500/40"
          >
            <span className="relative z-10">
              Get Started →
            </span>

            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </Link>
        </div>

        {/* FEATURE CARDS */}
        <div className="relative mt-24 grid w-full gap-8 lg:grid-cols-3">

          <div className="group rounded-[36px] border border-white/10 bg-white/5 p-8 text-left backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-green-500/10">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-green-500/10 text-4xl">
              🎵
            </div>

            <h3 className="text-3xl font-black">
              Transfer Instantly
            </h3>

            <p className="mt-5 text-lg leading-relaxed text-gray-400">
              Move playlists between platforms in just a few clicks.
            </p>
          </div>

          <div className="group rounded-[36px] border border-white/10 bg-white/5 p-8 text-left backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-blue-500/10">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/10 text-4xl">
              ⚡
            </div>

            <h3 className="text-3xl font-black">
              Fast & Smooth
            </h3>

            <p className="mt-5 text-lg leading-relaxed text-gray-400">
              Enjoy a sleek experience designed for modern music lovers.
            </p>
          </div>

          <div className="group rounded-[36px] border border-white/10 bg-white/5 p-8 text-left backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-red-500/10">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/10 text-4xl">
              🚀
            </div>

            <h3 className="text-3xl font-black">
              Built For Your Library
            </h3>

            <p className="mt-5 text-lg leading-relaxed text-gray-400">
              Keep your playlists synced with your favorite listening platform.
            </p>
          </div>
        </div>

        {/* MUSIC STRIP */}
        <div className="mt-24 flex flex-wrap items-center justify-center gap-16 rounded-[40px] border border-white/10 bg-white/5 px-16 py-10 backdrop-blur-2xl">

          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
            alt="Spotify"
            className="h-20 w-20 transition-transform duration-300 hover:scale-110"
          />

          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6a/Youtube_Music_icon.svg"
            alt="YouTube Music"
            className="h-20 w-20 transition-transform duration-300 hover:scale-110"
          />

          <img
            src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
            alt="Apple Music"
            className="h-20 w-20 rounded-full bg-white p-3 transition-transform duration-300 hover:scale-110"
          />
        </div>

        {/* FINAL CTA */}
        <div className="mt-28 flex flex-col items-center text-center">
          <h2 className="max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Your Playlists Deserve Freedom.
          </h2>

          <p className="mt-6 max-w-2xl text-lg text-gray-400">
            Stop rebuilding playlists manually. Move your music effortlessly
            across platforms.
          </p>

          <Link
            href="/register"
            className="mt-10 rounded-3xl bg-white px-12 py-5 text-lg font-black text-black transition-all duration-500 hover:scale-105 hover:bg-gray-200"
          >
            Launch App →
          </Link>
        </div>
      </main>
    </div>
  );
}