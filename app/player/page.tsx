"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase"

export default function PlayerPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const song = {
    title: "Let It Be",
    artist: "The Beatles",
    audio_url: "/songs/letitbe.mp3",
  };

  const lyrics = [
    { time: 0, text: "When I find myself in times of trouble" },
    { time: 5, text: "Mother Mary comes to me" },
    { time: 10, text: "Speaking words of wisdom, let it be" },
  ];

  // 🎧 track waktu
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const update = () => setCurrentTime(audio.currentTime);
    audio.addEventListener("timeupdate", update);

    return () => audio.removeEventListener("timeupdate", update);
  }, []);

  // ▶️ play / pause
  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  }

  // 🔊 volume
  function handleVolume(v: number) {
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  }

  // 🎯 lyrics aktif
  const activeIndex = lyrics.findIndex((line, i) => {
    const next = lyrics[i + 1];
    return currentTime >= line.time && (!next || currentTime < next.time);
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">

      {/* AUDIO */}
      <audio ref={audioRef} src={song.audio_url} />

      {/* INFO */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">{song.title}</h1>
        <p className="text-white/50">{song.artist}</p>
      </div>

      {/* CONTROLS */}
      <div className="flex gap-4 items-center">
        <button onClick={togglePlay} className="bg-white text-black px-4 py-2 rounded">
          {isPlaying ? "Pause" : "Play"}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => handleVolume(parseFloat(e.target.value))}
        />
      </div>

      {/* LYRICS */}
      <div className="h-[300px] overflow-y-auto text-center">
        {lyrics.map((line, i) => (
          <p
            key={i}
            className={`text-lg transition ${
              i === activeIndex
                ? "text-white font-bold scale-110"
                : "text-white/30"
            }`}
          >
            {line.text}
          </p>
        ))}
      </div>

      {/* ADD TO PLAYLIST */}
      <button
        onClick={async () => {
          const playlist_id = prompt("Masukin ID playlist:");
          if (!playlist_id) return;

          await supabase.from("playlist_songs").insert([
            {
              playlist_id,
              song_id: 1, // nanti ganti dinamis
            },
          ]);

          alert("Ditambahkan ke playlist!");
        }}
        className="bg-blue-500 px-4 py-2 rounded"
      >
        Add to Playlist
      </button>

    </div>
  );
}