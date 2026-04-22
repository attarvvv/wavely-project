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
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050510] to-black flex items-center justify-center px-4 relative">
      <div className="absolute top-0 left-1/2 w-[400px] h-[400px] -translate-x-1/2 bg-blue-500/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="Wavely" width={72} height={72} className="mb-3" />
          <h1 className="text-2xl font-medium text-white tracking-tight">
            <span className="text-blue-400">Wavely</span>
          </h1>
          <p className="text-sm text-white/40 mt-1">Create your account</p>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Full name</label>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-blue-500/50 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-blue-500/50 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/50">Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-blue-500/50 transition"
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
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl py-2.5 transition mt-1"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/30 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
