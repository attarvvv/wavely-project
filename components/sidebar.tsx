"use client";

import { Home, Search, Library, Plus, ListMusic } from "lucide-react";

export default function Sidebar({ createPlaylist, playlists }: any) {
  return (
    <div className="hidden md:flex w-[220px] min-w-[220px] flex-col bg-white/[0.03] border-r border-white/[0.07] px-4 py-5 gap-1 z-10">

      {/* LOGO */}
      <h1 className="text-lg font-medium text-white mb-4 px-2 tracking-tight">
        🎧 <span className="text-blue-400">Wavely</span>
      </h1>

      {/* MENU */}
      {[
        { icon: <Home size={16} />, label: "Home", active: true },
        { icon: <Search size={16} />, label: "Search" },
        { icon: <Library size={16} />, label: "Your Library" },
      ].map((item) => (
        <button
          key={item.label}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
            item.active
              ? "bg-blue-500/15 text-blue-400"
              : "text-white/50 hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}

      {/* PLAYLIST */}
      <div className="flex-1 mt-2">
        <div className="flex justify-between items-center px-3 pt-4 pb-2">
          <p className="text-[10px] tracking-widest uppercase text-white/30">Playlists</p>
          <button
            onClick={createPlaylist}
            className="text-white/30 hover:text-blue-400 transition"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-0.5">
          {playlists?.map((p: any) => (
            <button
              key={p.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/45 hover:text-white/80 hover:bg-white/[0.04] transition text-left"
            >
              <ListMusic size={13} className="text-white/25 flex-shrink-0" />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-white/20 px-3 mt-2">© 2026 Wavely</p>
    </div>
  );
}
