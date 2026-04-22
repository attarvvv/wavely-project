"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";

export default function LibraryPage() {
  const router = useRouter(); // ✅ DI SINI

  const [playlists, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    getPlaylists();
  }, []);

  async function getPlaylists() {
    const { data: userData } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("playlists")
      .select("*")
      .eq("user_id", userData.user?.id);

    setPlaylists(data || []);
  }

 return (
  <div className="flex min-h-screen text-white bg-black">

    {/* 🔥 SIDEBAR */}
    <Sidebar createPlaylist={() => {}} playlists={playlists} />

    {/* 🔥 CONTENT */}
    <div className="flex-1 p-6 ml-[220px]">
      <h1 className="text-xl mb-4">My Library</h1>

      {playlists.map((pl) => (
        <div
          key={pl.id}
          onClick={() => router.push(`/playlist/${pl.id}`)}
          className="p-3 cursor-pointer hover:bg-white/10 rounded"
        >
          {pl.name}
        </div>
      ))}
    </div>

  </div>
);
}