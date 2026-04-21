"use client";

import { Home, Search, Library, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function MobileNav() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

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
      <button
        onClick={handleLogout}
        className="flex flex-col items-center text-xs text-white/40 hover:text-red-400 transition"
      >
        <LogOut size={20} />
        <span>Sign out</span>
      </button>
    </div>
  );
}