
"use client"
export default function Home(){
  return (
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={() => {
          window.location.href = "http://127.0.0.1:5000/api/spotify/login";
        }}
        className="bg-green-500 text-white px-6 py-3 rounded-lg"
      >
        Connect Spotify
      </button>
    </div>
  );
}
