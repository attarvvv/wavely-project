"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { ListMusic } from "lucide-react";

export default function LibraryPage() {
  const router = useRouter();
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
      <Sidebar createPlaylist={() => {}} playlists={playlists} />

      <div className="flex-1 p-8 ml-[220px]">
        <h1 className="text-xl font-semibold mb-6 text-white/80">My Library</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => router.push(`/playlist/${pl.id}`)}
              className="flex flex-col gap-2 cursor-pointer group"
            >
              {/* Cover */}
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-white/[0.06] border border-white/[0.06]">
                {pl.cover_url ? (
                  <img
                    src={pl.cover_url}
                    alt={pl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <ListMusic size={32} />
                  </div>
                )}
              </div>

              {/* Name */}
              <p className="text-sm text-white/70 group-hover:text-white transition truncate px-0.5">
                {pl.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}