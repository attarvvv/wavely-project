"use client";

import { Home, Search, Library, Plus, ListMusic, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar({ createPlaylist, playlists }: any) {
  const router = useRouter();
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
  getProfile();
}, []);

async function getProfile() {
  const { data: userData } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userData.user?.id)
    .single();

  setAvatar(data?.avatar_url);
}

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="hidden md:flex fixed top-0 left-0 h-screen w-[220px] min-w-[220px] flex-col bg-white/[0.03] border-r border-white/[0.07] px-4 py-5 gap-1 z-20">

      {/* LOGO */}
      <h1 className="text-lg font-medium text-white mb-4 px-2 tracking-tight">
        🎧 <span className="text-blue-400">Wavely</span>
      </h1>

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
    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:bg-white/[0.06] hover:text-white"
  >
    {item.icon}
    {item.label}
  </button>
))}

      {/* LOGOUT — di bawah menu */}
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
          {playlists.map((pl:any) => (
          <div
            key={pl.id}
            onClick={() => router.push(`/playlist/${pl.id}`)} // 🔥 DI SINI
            className="cursor-pointer p-2 hover:bg-white/10 rounded"
          >
            {pl.name}
          </div>
        ))}
        </div>
      </div>
      
      

      <p className="text-[10px] text-white/20 px-3 mt-2">© 2026 Wavely</p>
    </div>
  );
}