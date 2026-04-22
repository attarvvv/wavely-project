"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { Search, Music2, Mic2, Users, UserPlus, UserCheck, Play } from "lucide-react";
import { usePlayer } from "@/lib/playerContext";

type Tab = "songs" | "artists" | "users";

export default function SearchPage() {
  const router = useRouter();
  const { setCurrentSong } = usePlayer();

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("songs");
  const [songs, setSongs] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allPlaylists, setAllPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (query.trim().length > 0) {
      const timeout = setTimeout(() => doSearch(), 300);
      return () => clearTimeout(timeout);
    } else {
      setSongs([]);
      setArtists([]);
      setUsers([]);
    }
  }, [query]);

  async function loadUser() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return router.push("/login");
    setCurrentUser(userData.user);

    const { data: pls } = await supabase
      .from("playlists")
      .select("*")
      .eq("user_id", userData.user.id);
    setAllPlaylists(pls || []);

    // load who I'm following
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userData.user.id);
    setFollowing(new Set(follows?.map((f: any) => f.following_id) || []));
  }

  async function doSearch() {
    if (!query.trim()) return;
    setLoading(true);

    const q = query.trim();

    const [songsRes, artistsRes, usersRes] = await Promise.all([
      supabase
        .from("songs")
        .select("*")
        .ilike("title", `%${q}%`)
        .limit(20),
      supabase
        .from("songs")
        .select("artist, cover_url")
        .ilike("artist", `%${q}%`)
        .limit(20),
      supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
        .limit(20),
    ]);

    setSongs(songsRes.data || []);

    // deduplicate artists
    const seen = new Set();
    const uniqueArtists = (artistsRes.data || []).filter((a: any) => {
      if (seen.has(a.artist)) return false;
      seen.add(a.artist);
      return true;
    });
    setArtists(uniqueArtists);
    setUsers(usersRes.data || []);
    setLoading(false);
  }

  async function toggleFollow(targetId: string) {
    if (!currentUser) return;
    const isFollowing = following.has(targetId);

    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUser.id)
        .eq("following_id", targetId);

      // decrement counts
      await supabase.rpc("decrement_following", { uid: currentUser.id });
      await supabase.rpc("decrement_followers", { uid: targetId });

      setFollowing((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: currentUser.id, following_id: targetId });

      // increment counts
      await supabase.rpc("increment_following", { uid: currentUser.id });
      await supabase.rpc("increment_followers", { uid: targetId });

      setFollowing((prev) => new Set(prev).add(targetId));
    }
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "songs", label: "Songs", icon: Music2 },
    { key: "artists", label: "Artists", icon: Mic2 },
    { key: "users", label: "People", icon: Users },
  ];

  const isEmpty =
    (tab === "songs" && songs.length === 0) ||
    (tab === "artists" && artists.length === 0) ||
    (tab === "users" && users.length === 0);

  return (
    <div className="flex min-h-screen text-white bg-black">
      <Sidebar createPlaylist={() => {}} playlists={allPlaylists} />

      <div className="flex-1 md:ml-[220px] px-4 md:px-10 py-6 md:py-8 pb-24 md:pb-8">

        {/* Search bar */}
        <div className="relative mb-8 max-w-xl">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            autoFocus
            type="text"
            placeholder="Search songs, artists, or people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-blue-500/40 focus:bg-white/[0.07] transition"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
                tab === key
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-white/40 hover:text-white/70 border border-transparent"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Results */}
        {query.trim() === "" ? (
          <div className="flex flex-col items-center justify-center mt-24 gap-3 text-white/20">
            <Search size={40} strokeWidth={1} />
            <p className="text-sm">Search for music, artists, or people</p>
          </div>
        ) : isEmpty && !loading ? (
          <div className="flex flex-col items-center justify-center mt-24 gap-3 text-white/20">
            <p className="text-sm">No results for "{query}"</p>
          </div>
        ) : (
          <>
            {/* SONGS */}
            {tab === "songs" && (
              <div className="flex flex-col gap-1">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => setCurrentSong(song)}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.05] cursor-pointer group transition"
                  >
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-white/[0.06] flex-shrink-0">
                      {song.cover_url ? (
                        <img src={song.cover_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <Music2 size={16} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <Play size={14} className="text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{song.title}</p>
                      <p className="text-xs text-white/40 truncate">{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ARTISTS */}
            {tab === "artists" && (
              <div className="flex flex-col gap-1">
                {artists.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.05] transition"
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-white/[0.06] flex-shrink-0 flex items-center justify-center">
                      {a.cover_url ? (
                        <img src={a.cover_url} className="w-full h-full object-cover" />
                      ) : (
                        <Mic2 size={16} className="text-white/20" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-white">{a.artist}</p>
                      <p className="text-xs text-white/40">Artist</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* USERS */}
            {tab === "users" && (
              <div className="flex flex-col gap-1">
                {users.map((u) => {
                  const isMe = u.id === currentUser?.id;
                  const isFollowing = following.has(u.id);
                  return (
                    <div
                      key={u.id}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.05] transition"
                    >
                      {/* Avatar */}
                      <div
                        onClick={() => router.push(`/profile/${u.id}`)}
                        className="w-11 h-11 rounded-full overflow-hidden bg-white/[0.06] flex-shrink-0 flex items-center justify-center cursor-pointer"
                      >
                        {u.avatar_url ? (
                          <img src={u.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-blue-400">
                            {(u.full_name || u.username || "?")[0].toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => router.push(`/profile/${u.id}`)}
                      >
                        <p className="text-sm text-white truncate">
                          {u.full_name || u.username || "User"}
                        </p>
                        {u.username && (
                          <p className="text-xs text-white/40 truncate">@{u.username}</p>
                        )}
                      </div>

                      {/* Follow button */}
                      {!isMe && (
                        <button
                          onClick={() => toggleFollow(u.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition flex-shrink-0 ${
                            isFollowing
                              ? "bg-white/[0.08] text-white/50 hover:bg-red-500/10 hover:text-red-400 border border-white/10"
                              : "bg-blue-500 hover:bg-blue-600 text-white"
                          }`}
                        >
                          {isFollowing ? (
                            <><UserCheck size={11} /> Following</>
                          ) : (
                            <><UserPlus size={11} /> Follow</>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}