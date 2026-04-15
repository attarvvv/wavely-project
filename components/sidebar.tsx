"use client";

import { Home, Search, Library } from "lucide-react";

export default function Sidebar({ createPlaylist, playlists }: any) {
  return (
    <div className="hidden md:flex w-[250px] bg-black p-4 flex-col">

      {/* LOGO */}
      <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
        🎧 Wavely
      </h1>

      {/* MENU */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-2 cursor-pointer">
          <Home size={18} /> Home
        </div>

        <div className="flex items-center gap-2 cursor-pointer">
          <Search size={18} /> Search
        </div>

        <div className="flex items-center gap-2 cursor-pointer">
          <Library size={18} /> Your Library
        </div>
      </div>

      {/* PLAYLIST */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm text-gray-400">Playlist</h2>

          <button
            onClick={createPlaylist}
            className="text-gray-400 hover:text-white text-lg"
          >
            +
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {playlists?.map((p: any) => (
            <div
              key={p.id}
              className="text-sm text-gray-400 hover:text-white cursor-pointer"
            >
              {p.name}
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4">© 2026 Wavely</p>
    </div>
  );
}