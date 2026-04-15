"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import { Volume2, Volume1, VolumeX, Plus } from "lucide-react";

export default function Home() {
  const [songs, setSongs] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);

  async function addToPlaylist(songId: string) {
  const playlistId = prompt("Masukin ID playlist");

  if (!playlistId) return;

  await supabase.from("playlist_songs").insert([
    {
      playlist_id: playlistId,
      song_id: songId,
    },
  ]);

  alert("Masuk playlist!");
}

async function createPlaylist() {
  const name = prompt("Nama playlist?");
  if (!name) return;

  await supabase.from("playlists").insert([{ name }]);

  getPlaylists(); // 🔥 refresh list
}

async function getPlaylists() {
  const { data } = await supabase.from("playlists").select("*");
  setPlaylists(data || []);
}

useEffect(() => {
  getPlaylists();
}, []);

  useEffect(() => {
    getSongs();
  }, []);

  async function getSongs() {
    const { data } = await supabase.from("songs").select("*");
    setSongs(data || []);
  }

  // 🎧 HANDLE PLAY
  function togglePlay() {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  }

  function playNextSong() {
    if (!currentSong || songs.length === 0) return;

    const currentIndex = songs.findIndex((song) => song.id === currentSong.id);

    const nextIndex = (currentIndex + 1) % songs.length;

    setCurrentSong(songs[nextIndex]);
    setIsPlaying(true);
  }

  function playPrevSong() {
    if (!currentSong || songs.length === 0) return;

    const currentIndex = songs.findIndex((song) => song.id === currentSong.id);

    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;

    setCurrentSong(songs[prevIndex]);
    setIsPlaying(true);
  }

  // 🎧 UPDATE TIME + DURATION
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const setMeta = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setMeta);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setMeta);
    };
  }, [currentSong]);

  // 🎧 FORMAT TIME
  function formatTime(time: number) {
    if (!time) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play();
    }
  }, [currentSong]);

  useEffect(() => {
    setCurrentTime(0);
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
  if (audioRef.current) {
    audioRef.current.load();
  }
}, [currentSong]);

useEffect(() => {
  if (audioRef.current && isPlaying) {
    audioRef.current.play();
  }
}, [currentSong, isPlaying]);



  



  return (
    <div className="flex min-h-screen text-white relative bg-gradient-to-b from-black via-[#050510] to-black">
      {/* 🔵 GLOW */}
      <div className="absolute top-0 left-1/2 w-[500px] h-[500px] -translate-x-1/2 bg-blue-500/30 blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-400/20 blur-[120px]" />

     <Sidebar
  createPlaylist={createPlaylist}
  playlists={playlists}
/>

      {/* CONTENT */}
      <div className="flex-1 p-4 md:p-6 pb-32 relative z-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Good Evening, Attar!</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {songs.map((song) => (
            <div
  key={song.id}
  onClick={() => {
    setCurrentSong(song);
    setIsPlaying(true);
  }}
  className="group bg-[#121212] p-3 rounded-xl hover:bg-[#1f1f1f] transition cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 relative"
>
  {/* COVER */}
  <div className="relative">
    <img
      src={song.cover_url || "https://via.placeholder.com/300"}
      className="w-full h-[160px] object-cover rounded-lg"
    />

    {/* PLAY BUTTON (hover) */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        setCurrentSong(song);
        setIsPlaying(true);
      }}
      className="absolute bottom-2 right-2 bg-blue-500 text-black rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
    >
      ▶
    </button>
  </div>

  {/* TEXT */}
  <h2 className="mt-2 font-semibold truncate">{song.title}</h2>
  <p className="text-sm text-gray-400 truncate">{song.artist}</p>

  {/* ADD PLAYLIST ICON */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      addToPlaylist(song.id);
    }}
    className="absolute top-2 right-2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition"
  >
   <Plus size={16} />
  </button>
</div>
          ))}
        </div>
      </div>

      {/* PLAYER */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 md:left-[250px] right-0 bg-[#0d0d0d]/90 backdrop-blur-xl border-t border-white/10 px-6 py-3 z-50">
          {/* AUDIO */}
          <audio
            ref={audioRef}
            src={currentSong.audio_url}
            onEnded={playNextSong}
          />

          <div className="flex items-center justify-between">
            {/* LEFT (song info) */}
            <div className="flex items-center gap-3 w-[30%]">
              <img
                src={currentSong.cover_url || "https://via.placeholder.com/100"}
                className="w-12 h-12 rounded-md"
              />
              <div>
                <p className="text-sm font-semibold text-white">
                  {currentSong.title}
                </p>
                <p className="text-xs text-gray-400">{currentSong.artist}</p>
              </div>
            </div>

            {/* CENTER (controls) */}
            <div className="flex flex-col items-center w-[40%]">
              {/* BUTTON */}
              <div className="flex items-center gap-4">
                {/* PREV */}
                <button
                  onClick={playPrevSong}
                  className="text-white hover:scale-110 transition"
                >
                  ⏮
                </button>

                {/* PLAY */}
                <button
                  onClick={togglePlay}
                  className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:scale-105 transition"
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>

                {/* NEXT */}
                <button
                  onClick={playNextSong}
                  className="text-white hover:scale-110 transition"
                >
                  ⏭
                </button>
              </div>

              {/* PROGRESS */}
              <div className="flex items-center gap-2 w-full mt-2">
                <span className="text-xs text-gray-400 w-10 text-right">
                  {formatTime(currentTime)}
                </span>

                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => {
                    if (!audioRef.current) return;
                    audioRef.current.currentTime = Number(e.target.value);
                  }}
                  className="w-full h-[3px] appearance-none bg-gray-600 rounded-full accent-white cursor-pointer"
                />

                <span className="text-xs text-gray-400 w-10">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* RIGHT (kosong dulu biar balance) */}
            <div className="flex items-center gap-3 w-[30%] justify-end">

              {/* ICON */}
              {volume === 0 ? (
                <VolumeX size={18} className="text-gray-400" />
              ) : volume < 0.5 ? (
                <Volume1 size={18} className="text-gray-400" />
              ) : (
                <Volume2 size={18} className="text-gray-400" />
              )}

              {/* SLIDER */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-24 h-[3px] appearance-none bg-gray-600 rounded-full cursor-pointer accent-blue-500"
              />
    

              

            </div>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
