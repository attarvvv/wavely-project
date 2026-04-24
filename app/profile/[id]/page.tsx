"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { ListMusic, UserPlus, UserCheck, ArrowLeft } from "lucide-react";

export default function PublicProfilePage() {
  const router = useRouter();
  const { id } = useParams();
  const profileId = Array.isArray(id) ? id[0] : id;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [allPlaylists, setAllPlaylists] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, [profileId]);

  async function loadAll() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return router.push("/login");
    setCurrentUser(userData.user);

    const { data: myPls } = await supabase
      .from("playlists")
      .select("*")
      .eq("user_id", userData.user.id);
    setAllPlaylists(myPls || []);

    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single();
    setProfile(prof);

    const { data: pls } = await supabase
      .from("playlists")
      .select("*")
      .eq("user_id", profileId);
    setPlaylists(pls || []);

    const { data: followData } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", userData.user.id)
      .eq("following_id", profileId)
      .single();
    setIsFollowing(!!followData);

    setLoading(false);
  }

  async function toggleFollow() {
    if (!currentUser) return;
    if (isFollowing) {
      await supabase.from("follows").delete()
        .eq("follower_id", currentUser.id)
        .eq("following_id", profileId);
      await supabase.rpc("decrement_following", { uid: currentUser.id });
      await supabase.rpc("decrement_followers", { uid: profileId });
      setIsFollowing(false);
      setProfile((prev: any) => ({
        ...prev,
        followers_count: Math.max((prev?.followers_count || 1) - 1, 0),
      }));
    } else {
      await supabase.from("follows").insert({
        follower_id: currentUser.id,
        following_id: profileId,
      });
      await supabase.rpc("increment_following", { uid: currentUser.id });
      await supabase.rpc("increment_followers", { uid: profileId });
      setIsFollowing(true);
      setProfile((prev: any) => ({
        ...prev,
        followers_count: (prev?.followers_count || 0) + 1,
      }));
    }
  }

  const isMe = currentUser?.id === profileId;
  const displayName = profile?.full_name || profile?.username || "User";

  if (loading) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar createPlaylist={() => {}} playlists={[]} />
        <div className="flex-1 md:ml-[220px] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar createPlaylist={() => {}} playlists={allPlaylists} />
        <div className="flex-1 md:ml-[220px] flex flex-col items-center justify-center gap-3 text-white/30">
          <p className="text-sm">User not found</p>
          <button onClick={() => router.back()} className="text-xs text-blue-400 hover:text-blue-300 transition">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen text-white bg-black">
      <Sidebar createPlaylist={() => {}} playlists={allPlaylists} />

      <div className="flex-1 md:ml-[220px] relative pb-24 md:pb-0">

        {/* Banner */}
        <div className="h-36 md:h-52 w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-[#07071a] to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,_#3b82f625_0%,_transparent_65%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black to-transparent" />
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition z-10"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        {/* Profile header */}
        <div className="px-4 md:px-10 pb-6 relative">

          {/* Avatar + follow row */}
          <div className="flex items-end justify-between">
            <div className="-mt-12 md:-mt-16">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full ring-4 ring-black overflow-hidden bg-white/10 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl md:text-4xl font-bold text-blue-400">
                    {displayName[0]?.toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {!isMe && (
              <button
                onClick={toggleFollow}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition mb-1 ${
                  isFollowing
                    ? "bg-white/[0.08] text-white/50 hover:bg-red-500/10 hover:text-red-400 border border-white/10"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {isFollowing ? (
                  <><UserCheck size={12} /> Following</>
                ) : (
                  <><UserPlus size={12} /> Follow</>
                )}
              </button>
            )}
          </div>

          {/* Info */}
          <div className="mt-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{displayName}</h1>
            {profile?.username && (
              <p className="text-sm text-white/30 mt-0.5">@{profile.username}</p>
            )}
            {profile?.bio && (
              <p className="text-sm text-white/40 mt-2 max-w-md">{profile.bio}</p>
            )}

            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-base md:text-lg font-semibold text-white">{profile?.followers_count || 0}</p>
                <p className="text-xs text-white/40">Followers</p>
              </div>
              <div>
                <p className="text-base md:text-lg font-semibold text-white">{profile?.following_count || 0}</p>
                <p className="text-xs text-white/40">Following</p>
              </div>
              <div>
                <p className="text-base md:text-lg font-semibold text-white">{playlists.length}</p>
                <p className="text-xs text-white/40">Playlists</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 md:mx-10 h-px bg-white/[0.06] mb-6" />

        {/* Playlists */}
        <div className="px-4 md:px-10 pb-8">
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">
            Playlists
          </h2>
          {playlists.length === 0 ? (
            <p className="text-sm text-white/20">No playlists yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => router.push(`/playlist/${pl.id}`)}
                  className="flex flex-col gap-2 cursor-pointer group"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-white/[0.06] border border-white/[0.06]">
                    {pl.cover_url ? (
                      <img
                        src={pl.cover_url}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <ListMusic size={28} />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-white/70 group-hover:text-white transition truncate">
                    {pl.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}