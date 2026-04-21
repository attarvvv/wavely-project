"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);

    // ambil profile dari table
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", data.user?.id)
      .single();

    setAvatar(profile?.avatar_url);
  }

  // 🔥 upload avatar
  async function handleUpload(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    const filePath = `avatars/${user.id}-${Date.now()}`;

    // upload ke storage
    await supabase.storage.from("avatars").upload(filePath, file);

    // ambil public URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // simpan ke database
    await supabase.from("profiles").upsert({
      id: user.id,
      avatar_url: data.publicUrl,
    });

    setAvatar(data.publicUrl);
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">

      <div className="flex flex-col items-center gap-4">

        {/* FOTO */}
        <div className="w-32 h-32 rounded-full overflow-hidden bg-white/10">
          {avatar ? (
            <img src={avatar} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-white/40">
              No Image
            </div>
          )}
        </div>

        {/* EMAIL */}
        <p className="text-white/50">{user?.email}</p>

        {/* UPLOAD */}
        <input type="file" onChange={handleUpload} />

      </div>

    </div>
  );
}