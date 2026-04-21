"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { usePlayer } from "@/lib/playerContext";

export default function PlaylistPage() {
  const { id } = useParams();
    const playlistId = Array.isArray(id) ? id[0] : id;

  const [songs, setSongs] = useState<any[]>([]);
  const [playlist, setPlaylist] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const { setCurrentSong } = usePlayer();

  useEffect(() => {
    if (id) {
      getSongs();
      getPlaylist();
    }
  }, [id]);

  // 🔥 GET SONGS
  async function getSongs() {
    const { data } = await supabase
      .from("playlist_songs")
      .select(`
        songs (
          id,
          title,
          artist,
          cover_url
        )
      `)
      .eq("playlist_id", id);

    const formatted = data?.map((item: any) => item.songs);
    setSongs(formatted || []);
  }

  // 🔥 GET PLAYLIST INFO
  async function getPlaylist() {
    const { data } = await supabase
      .from("playlists")
      .select("*")
      .eq("id", playlistId)

      .single();

    setPlaylist(data);
    setEditName(data?.name || "");
  }

  // 🔥 UPDATE NAME
  async function updatePlaylist() {
  console.log("UPDATE ID:", playlistId);
  console.log("NEW NAME:", editName);

  const { error } = await supabase
    .from("playlists")
    .update({ name: editName })
    .eq("id", playlistId);

  console.log("UPDATE ERROR:", error);

  getPlaylist();
}

  // 🔥 UPLOAD COVER
  async function uploadCover(e: any) {
  const file = e.target.files[0];
  if (!file) return;

  const fileName = `${Date.now()}-${file.name}`;

  // 🔥 DEBUG UPLOAD
  const { data: uploadData, error } = await supabase.storage
    .from("covers")
    .upload(fileName, file);

  console.log("UPLOAD RESULT:", uploadData);
  console.log("UPLOAD ERROR:", error);

  if (error) return;

  // 🔥 DEBUG URL
  const { data } = supabase.storage
    .from("covers")
    .getPublicUrl(fileName);

  console.log("PUBLIC URL:", data.publicUrl);

  await supabase
    .from("playlists")
    .update({ cover_url: data.publicUrl })
    .eq("id", playlistId)

  getPlaylist();
}

  return (
  <div className="flex min-h-screen bg-black text-white">

    {/* 🔥 SIDEBAR */}
    <Sidebar createPlaylist={() => {}} playlists={[]} />

    {/* 🔥 CONTENT */}
    <div className="flex-1 p-6 ml-[220px]">

      {/* HEADER */}
      <div className="flex items-center gap-6 mb-8">

        {/* COVER */}
        <div className="w-40 h-40 bg-white/10 rounded overflow-hidden">
          {playlist?.cover_url ? (
            <img src={playlist.cover_url} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30">
              No Image
            </div>
          )}
        </div>

        {/* INFO */}
        <div>
          <p className="text-sm text-white/50">Playlist</p>

          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="text-3xl font-bold bg-transparent outline-none"
          />

          <div className="flex gap-2 mt-2">
            <button
              onClick={updatePlaylist}
              className="px-4 py-1 bg-blue-500 rounded text-sm"
            >
              Save
            </button>

            <input type="file" onChange={uploadCover} />
          </div>
        </div>
      </div>

      {/* SONG LIST */}
      {songs.length === 0 ? (
        <p className="text-white/40">Belum ada lagu</p>
      ) : (
        songs.map((song) => (
  <div
    key={song.id}
    onClick={() => setCurrentSong(song)} // 🔥 INI PENTING
    className="flex items-center gap-4 p-3 hover:bg-white/10 rounded cursor-pointer"
  >
            <img src={song.cover_url} className="w-12 h-12 rounded" />

            <div>
              <p>{song.title}</p>
              <p className="text-sm text-white/50">{song.artist}</p>
            </div>
          </div>
        ))
      )}

    </div>
  </div>
);
}