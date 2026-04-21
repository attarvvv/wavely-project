"use client";

import { useEffect, useRef } from "react";

export default function Player({ song }: any) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ❗ HANYA SET SRC kalau beda lagu
  useEffect(() => {
    if (!audioRef.current || !song?.audio_url) return;

    if (audioRef.current.src !== song.audio_url) {
      audioRef.current.src = song.audio_url;
      audioRef.current.play();
    }
  }, [song]);

  if (!song) return null;

  return (
    <div className="fixed bottom-0 left-[220px] right-0 bg-black border-t border-white/10 p-4 flex items-center gap-4 z-50">
      <img src={song.cover_url} className="w-12 h-12 rounded" />

      <div>
        <p>{song.title}</p>
        <p className="text-sm text-white/50">{song.artist}</p>
      </div>

      <audio ref={audioRef} />
    </div>
  );
}