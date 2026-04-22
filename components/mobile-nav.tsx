"use client";

import { Home, Search, Library, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const items = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Library, label: "Library", path: "/library" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black/95 backdrop-blur border-t border-white/10 flex justify-around py-2 md:hidden z-50">
      {items.map(({ icon: Icon, label, path }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => router.push(path)}
            className={`flex flex-col items-center gap-1 px-3 py-1 text-xs transition ${
              active ? "text-blue-400" : "text-white/40 hover:text-white"
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        );
      })}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-1 px-3 py-1 text-xs text-white/40 hover:text-red-400 transition"
      >
        <LogOut size={20} />
        <span>Sign out</span>
      </button>
    </div>
  );
}