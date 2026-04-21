"use client";

import { createContext, useContext, useState } from "react";

const PlayerContext = createContext<any>(null);

export function PlayerProvider({ children }: any) {
  const [currentSong, setCurrentSong] = useState<any>(null);

  return (
    <PlayerContext.Provider value={{ currentSong, setCurrentSong }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}