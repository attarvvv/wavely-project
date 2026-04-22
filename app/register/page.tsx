"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      await supabase.auth.signOut();
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050510] to-black flex flex-col md:flex-row relative overflow-hidden">
      <div className="absolute top-0 left-1/2 w-[600px] h-[600px] -translate-x-1/2 bg-blue-500/10 blur-[140px] pointer-events-none" />

      {/* Kolom Kiri - Logo (hidden di mobile) */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-6 px-12">
        <div className="animate-spin-slow">
          <Image src="/logo.gif" alt="Wavely Logo" width={280} height={280} unoptimized />
        </div>
        <h1 className="text-4xl font-semibold text-blue-400 tracking-tight">Wavely</h1>
        <p className="text-sm text-white/30 uppercase tracking-widest">Your music, your wave</p>
      </div>

      {/* Divider (hidden di mobile) */}
      <div className="hidden md:block w-px bg-white/[0.06] my-16" />

      {/* Kolom Kanan - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 md:px-16 z-10 py-12">

        {/* Logo kecil khusus mobile */}
        <div className="flex flex-col items-center mb-8 md:hidden">
          <Image src="/logo.gif" alt="Wavely Logo" width={80} height={80} unoptimized />
          <h1 className="text-2xl font-semibold text-blue-400 mt-3">Wavely</h1>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <h2 className="text-2xl font-medium text-white mb-1">Create account</h2>
          <p className="text-sm text-white/30 mb-8">Join Wavely and start listening</p>

          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider">Full name</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider">Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition"
              />
            </div>
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl py-3 transition mt-1"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs text-white/25 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}