"use client";

import { Home, Search, Library } from "lucide-react";

export default function MobileNav() {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-black border-t border-white/10 flex justify-around p-3 md:hidden z-50">
      
      <div className="flex flex-col items-center text-xs">
        <Home size={20} />
        <span>Home</span>
      </div>

      <div className="flex flex-col items-center text-xs">
        <Search size={20} />
        <span>Search</span>
      </div>

      <div className="flex flex-col items-center text-xs">
        <Library size={20} />
        <span>Library</span>
      </div>
    </div>
  );
}