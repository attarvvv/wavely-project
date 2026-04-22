"use client";

import { Home, Search, Library, Plus, ListMusic, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Sidebar({ createPlaylist, playlists }: any) {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="hidden md:flex fixed top-0 left-0 h-screen w-[220px] min-w-[220px] flex-col bg-white/[0.03] border-r border-white/[0.07] px-4 py-5 gap-1 z-20">

      {/* LOGO */}
      {/* LOGO */}
<div className="flex items-center justify-center mb-5 px-2">
  <Image src="/logo.png" alt="Wavely" width={72} height={72} unoptimized />
</div>

      {/* MENU */}
      {[
        { icon: <Home size={16} />, label: "Home", path: "/" },
        { icon: <Search size={16} />, label: "Search", path: "/search" },
        { icon: <Library size={16} />, label: "Your Library", path: "/library" },
        { icon: <User size={16} />, label: "Profile", path: "/profile" },
      ].map((item) => (
        <button
          key={item.label}
          onClick={() => router.push(item.path)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:bg-white/[0.06] hover:text-white transition"
        >
          {item.icon}
          {item.label}
        </button>
      ))}

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition"
      >
        <LogOut size={16} />
        Sign out
      </button>

      {/* PLAYLIST */}
      <div className="flex-1 mt-2 overflow-y-auto">
        <div className="flex justify-between items-center px-3 pt-4 pb-2">
          <p className="text-[10px] tracking-widest uppercase text-white/30">Playlists</p>
          <button onClick={createPlaylist} className="text-white/30 hover:text-blue-400 transition">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex flex-col gap-0.5">
          {playlists.map((pl: any) => (
            <div
              key={pl.id}
              onClick={() => router.push(`/playlist/${pl.id}`)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/45 hover:text-white/80 hover:bg-white/[0.04] transition cursor-pointer"
            >
              <ListMusic size={13} className="text-white/25 flex-shrink-0" />
              {pl.name}
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-white/20 px-3 mt-2">© 2026 Wavely</p>
    </div>
  );
}
