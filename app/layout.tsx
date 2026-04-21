"use client";

import "./globals.css";
import { Poppins } from "next/font/google";
import { PlayerProvider, usePlayer } from "@/lib/playerContext";
import Player from "@/components/Player";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.className}>
      <body className="bg-black text-white">

        <PlayerProvider>
          {children}
          <PlayerWrapper />
        </PlayerProvider>

      </body>
    </html>
  );
}

function PlayerWrapper() {
  const { currentSong } = usePlayer();
  return <Player key="global-player" song={currentSong} />;
}