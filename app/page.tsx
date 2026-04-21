"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import { Volume2, Volume1, VolumeX, Plus, SkipBack, SkipForward, Play, Pause, Clock,  Mic2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [songs, setSongs] = useState<any[]>([]);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [recentSongs, setRecentSongs] = useState<any[]>([]);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userName, setUserName] = useState("there");

  const router = useRouter();

  useEffect(() => {
  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/login"); // ganti dari /register ke /login
    } else {
      const name =
        session.user.user_metadata?.full_name ||
        session.user.email?.split("@")[0] ||
        "there";
      setUserName(name);
      setLoadingAuth(false);
    }
  }
  checkUser();
}, [router]);

  useEffect(() => { getPlaylists(); }, []);
  useEffect(() => { getSongs(); }, []);

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

  useEffect(() => { setCurrentTime(0); }, [currentSong]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);
  useEffect(() => { if (audioRef.current) audioRef.current.load(); }, [currentSong]);
  useEffect(() => {
    if (audioRef.current && isPlaying) audioRef.current.play();
  }, [currentSong, isPlaying]);

  async function addToPlaylist(playlistId: string) {
    if (!selectedSongId) return;
    const { data: existing } = await supabase
      .from("playlist_songs")
      .select("*")
      .eq("playlist_id", playlistId)
      .eq("song_id", selectedSongId);
    if (existing && existing.length > 0) {
      alert("Lagu sudah ada di playlist!");
      return;
    }
    await supabase.from("playlist_songs").insert([{ playlist_id: playlistId, song_id: selectedSongId }]);
    alert("Masuk playlist!");
    setShowPlaylistModal(false);
  }

  async function createPlaylist() {
  const name = prompt("Nama playlist?");
  if (!name) return;

  const { data: userData } = await supabase.auth.getUser();

  await supabase.from("playlists").insert([
    {
      name,
      user_id: userData.user?.id, // 🔥 WAJIB
    },
  ]);

  getPlaylists();
}

  async function getPlaylists() {
  const { data: userData } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("playlists")
    .select("*")
    .eq("user_id", userData.user?.id); // 🔥 FILTER

  setPlaylists(data || []);
}

  async function getSongs() {
    const { data } = await supabase.from("songs").select("*");
    setSongs(data || []);
  }

  function playSong(song: any) {
    setCurrentSong(song);
    setIsPlaying(true);
    setRecentSongs((prev) => {
      const filtered = prev.filter((s) => s.id !== song.id);
      return [song, ...filtered].slice(0, 5);
    });
  }

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
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    playSong(songs[nextIndex]);
  }

  function playPrevSong() {
    if (!currentSong || songs.length === 0) return;
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSong(songs[prevIndex]);
  }

  function formatTime(time: number) {
    if (!time) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }

  const featuredSong = songs[0] || null;
  const gridSongs = songs.slice(1, 4);
  const allSongs = songs;

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-[#050510] to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen text-white relative bg-gradient-to-b from-black via-[#050510] to-black overflow-x-hidden">
      {/* GLOW */}
      <div className="absolute top-0 left-1/2 w-[500px] h-[500px] -translate-x-1/2 bg-blue-500/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-400/15 blur-[120px] pointer-events-none" />

      <Sidebar createPlaylist={createPlaylist} playlists={playlists} />

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 md:ml-[220px] px-4 md:px-6 pt-6 pb-48 md:pb-36 relative z-10 overflow-x-hidden">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-medium">
            {getGreeting()}, {userName}!
          </h1>
          <p className="text-sm text-white/40 mt-1">What do you want to listen to?</p>
        </div>

        {/* ── BENTO GRID ── */}
        {songs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {/* Featured card */}
            {featuredSong && (
              <div
  onClick={() => playSong(featuredSong)}
  className="sm:col-span-2 flex items-center gap-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 cursor-pointer hover:bg-blue-500/10 hover:border-blue-500/30 transition group"
>
                <img
                  src={featuredSong.cover_url || "https://via.placeholder.com/300"}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-blue-400 mb-1">Now trending</p>
                  <p className="text-lg font-medium truncate">{featuredSong.title}</p>
                  <p className="text-sm text-white/40 truncate">{featuredSong.artist}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 opacity-80 group-hover:opacity-100 transition">
                  <Play size={14} fill="white" className="text-white ml-0.5" />
                </div>
              </div>
            )}

            {/* Stats card */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-2xl font-medium">{songs.length}</p>
                <p className="text-xs text-white/35 mt-1">songs in library</p>
              </div>
              <div className="flex items-end gap-1 h-8">
                {[40, 65, 50, 90, 70, 55, 45].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm ${i === 3 ? "bg-blue-500" : "bg-blue-500/30"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* 3 small song cards */}
            {gridSongs.map((song) => (
              <div
                key={song.id}
                onClick={() => playSong(song)}
                className="group bg-white/[0.04] border border-white/[0.07] rounded-xl p-3 cursor-pointer hover:bg-blue-500/10 hover:border-blue-500/25 hover:-translate-y-0.5 transition relative"
              >
                <img
                  src={song.cover_url || "https://via.placeholder.com/300"}
                  className="w-full aspect-square object-cover rounded-lg mb-2"
                />
                <p className="text-sm font-medium truncate">{song.title}</p>
                <p className="text-xs text-white/40 truncate">{song.artist}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); playSong(song); }}
                  className="absolute bottom-10 right-3 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <Play size={11} fill="white" className="text-white ml-0.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedSongId(song.id); setShowPlaylistModal(true); }}
                  className="absolute top-2 right-2 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── ALL SONGS ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">All songs</p>
            <p className="text-xs text-blue-400/80">{songs.length} tracks</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allSongs.map((song) => (
              <div
                key={song.id}
                onClick={() => playSong(song)}
                className="group bg-[#121212] border border-white/[0.06] rounded-xl p-3 cursor-pointer hover:bg-blue-500/10 hover:border-blue-500/20 hover:-translate-y-0.5 transition relative"
              >
                <div className="relative mb-2">
                  <img
                    src={song.cover_url || "https://via.placeholder.com/300"}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); playSong(song); }}
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
                  >
                    <Play size={11} fill="white" className="text-white ml-0.5" />
                  </button>
                </div>
                <p className="text-sm font-medium truncate">{song.title}</p>
                <p className="text-xs text-white/40 mt-0.5 truncate">{song.artist}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedSongId(song.id); setShowPlaylistModal(true); }}
                  className="absolute top-2 right-2 text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── RECENTLY PLAYED ── */}
        {recentSongs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Recently played</p>
              <Clock size={13} className="text-white/30" />
            </div>
            <div className="flex flex-col gap-1">
              {recentSongs.map((song, i) => (
                <div
                  key={song.id}
                  onClick={() => playSong(song)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-white/[0.05] transition group"
                >
                  <span className="w-5 text-xs text-white/25 text-center">{i + 1}</span>
                  <img
                    src={song.cover_url || "https://via.placeholder.com/300"}
                    className="w-9 h-9 rounded-md object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{song.title}</p>
                    <p className="text-xs text-white/40 truncate">{song.artist}</p>
                  </div>
                  <span className="text-xs text-white/25">{formatTime(duration)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── PLAYER BAR ── */}
      {currentSong && (
  <div className="fixed bottom-[57px] md:bottom-0 left-0 md:left-[220px] right-0 bg-[#080810]/90 backdrop-blur-2xl border-t border-white/[0.08] px-4 py-3 z-40">
    <audio ref={audioRef} src={currentSong.audio_url} onEnded={playNextSong} />

    {/* Mobile layout */}
    <div className="flex md:hidden items-center gap-3">
      <img
        src={currentSong.cover_url || "https://via.placeholder.com/100"}
        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{currentSong.title}</p>
        <p className="text-xs text-white/40 truncate">{currentSong.artist}</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={playPrevSong} className="text-white/50">
          <SkipBack size={18} />
        </button>
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-white flex items-center justify-center"
        >
          {isPlaying
            ? <Pause size={15} className="text-black" fill="black" />
            : <Play size={15} className="text-black ml-0.5" fill="black" />
          }
        </button>
        <button onClick={playNextSong} className="text-white/50">
          <SkipForward size={18} />
        </button>
      </div>
    </div>

    {/* Progress bar mobile */}
    <div className="flex md:hidden items-center gap-2 mt-2">
      <span className="text-[10px] text-white/35 w-7 text-right">{formatTime(currentTime)}</span>
      <div className="relative flex-1 h-1">
        <input
          type="range" min="0" max={duration || 0} value={currentTime}
          onChange={(e) => { if (!audioRef.current) return; audioRef.current.currentTime = Number(e.target.value); }}
          className="w-full h-full opacity-0 absolute inset-0 cursor-pointer z-10"
        />
        <div className="w-full h-full bg-white/15 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }} />
        </div>
      </div>
      <span className="text-[10px] text-white/35 w-7">{formatTime(duration)}</span>
    </div>

    {/* Desktop layout — sama seperti sebelumnya */}
    <div className="hidden md:flex items-center gap-4">
      <div className="flex items-center gap-3 w-[28%] min-w-0">
        <img src={currentSong.cover_url || "https://via.placeholder.com/100"} className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{currentSong.title}</p>
          <p className="text-xs text-white/40 truncate">{currentSong.artist}</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 flex-1">
        <div className="flex items-center gap-4">
          <button onClick={playPrevSong} className="text-white/50 hover:text-white transition"><SkipBack size={18} /></button>
          <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-105 transition">
            {isPlaying ? <Pause size={15} className="text-black" fill="black" /> : <Play size={15} className="text-black ml-0.5" fill="black" />}
          </button>
          <button onClick={playNextSong} className="text-white/50 hover:text-white transition"><SkipForward size={18} /></button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <span className="text-[10px] text-white/35 w-8 text-right">{formatTime(currentTime)}</span>
          <div className="relative flex-1 h-1">
            <input type="range" min="0" max={duration || 0} value={currentTime}
              onChange={(e) => { if (!audioRef.current) return; audioRef.current.currentTime = Number(e.target.value); }}
              className="w-full h-full opacity-0 absolute inset-0 cursor-pointer z-10"
            />
            <div className="w-full h-full bg-white/15 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }} />
            </div>
          </div>
          <span className="text-[10px] text-white/35 w-8">{formatTime(duration)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 w-[28%] justify-end">
        {volume === 0 ? <VolumeX size={15} className="text-white/40" /> : volume < 0.5 ? <Volume1 size={15} className="text-white/40" /> : <Volume2 size={15} className="text-white/40" />}
        <div className="relative w-24 h-1">
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full h-full opacity-0 absolute inset-0 cursor-pointer z-10" />
          <div className="w-full h-full bg-white/15 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500/70 rounded-full" style={{ width: `${volume * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      {/* ── PLAYLIST MODAL ── */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[999]">
          <div className="bg-[#121212] border border-white/[0.08] p-6 rounded-2xl w-[300px]">
            <h2 className="text-base font-medium mb-4">Add to playlist</h2>
            <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => addToPlaylist(pl.id)}
                  className="text-left px-3 py-2.5 rounded-lg text-sm hover:bg-white/[0.07] transition"
                >
                  {pl.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPlaylistModal(false)}
              className="mt-4 text-xs text-white/35 hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      

      <MobileNav />
    </div>
  );
}
