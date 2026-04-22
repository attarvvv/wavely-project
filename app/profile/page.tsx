"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { ListMusic, Edit2, Share2, Link2, X, Copy, Check, Camera } from "lucide-react";
import QRCode from "qrcode";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [allPlaylists, setAllPlaylists] = useState<any[]>([]);
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/profile/${user?.id}`
    : "";

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return router.push("/login");
    setUser(userData.user);

    let { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    if (!prof) {
      const { data: newProf } = await supabase
        .from("profiles")
        .insert({
          id: userData.user.id,
          username: userData.user.user_metadata?.full_name || "User",
          full_name: userData.user.user_metadata?.full_name || "User",
          bio: "",
        })
        .select()
        .single();
      prof = newProf;
    }

    setProfile(prof);
    setEditName(prof?.full_name || prof?.username || "");
    setEditBio(prof?.bio || "");

    const { data: pls } = await supabase
      .from("playlists")
      .select("*")
      .eq("user_id", userData.user.id);
    setPlaylists(pls || []);
    setAllPlaylists(pls || []);
  }

  async function generateQR(url: string) {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: { dark: "#ffffff", light: "#0a0a1a" },
    });
    setQrDataUrl(dataUrl);
  }

  function handleOpenShare() {
    setShowShare(true);
    generateQR(profileUrl);
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSaveProfile() {
    await supabase
      .from("profiles")
      .update({ full_name: editName, bio: editBio })
      .eq("id", user.id);
    setShowEdit(false);
    loadAll();
  }

  async function handleAvatarUpload(e: any) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    const fileName = `avatar-${user.id}-${Date.now()}`;
    const { error } = await supabase.storage
      .from("covers")
      .upload(fileName, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("covers").getPublicUrl(fileName);
      await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user.id);
      loadAll();
    }
    setUploadingAvatar(false);
  }

  const followers = profile?.followers_count || 0;
  const following = profile?.following_count || 0;
  const displayName = profile?.full_name || profile?.username || "User";

  return (
    <div className="flex min-h-screen text-white bg-black">
      <Sidebar createPlaylist={() => {}} playlists={allPlaylists} />

      <div className="flex-1 ml-[220px] relative">

        {/* Banner */}
        <div className="h-52 w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-[#07071a] to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,_#3b82f625_0%,_transparent_65%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* Profile header */}
        <div className="px-10 pb-8 relative">

          {/* Avatar */}
          <div className="absolute -top-16 left-10">
            <div className="relative w-32 h-32 rounded-full ring-4 ring-black overflow-hidden bg-white/10 group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-blue-400">
                  {displayName[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                {uploadingAvatar
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Camera size={20} className="text-white" />
                }
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition"
            >
              <Edit2 size={12} /> Edit
            </button>
            <button
              onClick={handleOpenShare}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs border border-white/20 text-white/60 hover:text-white hover:border-blue-400/60 transition"
            >
              <Share2 size={12} /> Share
            </button>
          </div>

          {/* Name, bio, stats */}
          <div className="mt-10">
            <h1 className="text-3xl font-bold text-white">{displayName}</h1>
            {profile?.bio && (
              <p className="text-sm text-white/40 mt-1 max-w-md">{profile.bio}</p>
            )}

            <div className="flex gap-8 mt-5">
              <div>
                <p className="text-lg font-semibold text-white">{followers}</p>
                <p className="text-xs text-white/40">Followers</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{following}</p>
                <p className="text-xs text-white/40">Following</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{playlists.length}</p>
                <p className="text-xs text-white/40">Playlists</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-10 h-px bg-white/[0.06] mb-8" />

        {/* Playlists */}
        <div className="px-10 pb-20">
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-5">
            Playlists
          </h2>
          {playlists.length === 0 ? (
            <p className="text-sm text-white/20">No playlists yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
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

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-[#0d0d1a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-xs relative">
            <button
              onClick={() => setShowShare(false)}
              className="absolute top-4 right-4 text-white/30 hover:text-white transition"
            >
              <X size={16} />
            </button>

            <h3 className="text-sm font-semibold text-white mb-1">Share Profile</h3>
            <p className="text-xs text-white/30 mb-5">Let others find you on Wavely</p>

            {/* QR Code */}
            <div className="flex justify-center mb-5">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="rounded-xl w-[160px] h-[160px]" />
              ) : (
                <div className="w-[160px] h-[160px] rounded-xl bg-white/[0.05] flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Link row */}
            <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 mb-3">
              <Link2 size={13} className="text-white/30 flex-shrink-0" />
              <p className="text-xs text-white/40 truncate flex-1">{profileUrl}</p>
              <button
                onClick={handleCopyLink}
                className="text-white/30 hover:text-blue-400 transition flex-shrink-0"
              >
                {copied
                  ? <Check size={13} className="text-green-400" />
                  : <Copy size={13} />
                }
              </button>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition"
            >
              {copied ? "✓ Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-[#0d0d1a] border border-white/[0.08] rounded-2xl p-6 w-full max-w-xs relative">
            <button
              onClick={() => setShowEdit(false)}
              className="absolute top-4 right-4 text-white/30 hover:text-white transition"
            >
              <X size={16} />
            </button>

            <h3 className="text-sm font-semibold text-white mb-5">Edit Profile</h3>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider">Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  placeholder="Write something about yourself..."
                  className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 transition resize-none"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}