"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Music2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/"); // redirect ke main page
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-[#050510] to-black text-white overflow-hidden">

      {/* Glow */}
      <div className="absolute top-0 left-1/2 w-[500px] h-[500px] -translate-x-1/2 bg-blue-500/30 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-400/20 blur-[120px] pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-[340px] rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-7">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <Music2 size={20} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-white/45 mt-0.5">Sign in to your account</p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Fields */}
        <div className="space-y-3 mb-2">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-white/50 mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-white/12 text-white text-sm placeholder:text-white/25 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15 transition disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-white/50 mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-white/12 text-white text-sm placeholder:text-white/25 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15 transition disabled:opacity-50"
            />
          </div>
        </div>

        <div className="text-right mb-5">
          <a href="#" className="text-xs text-blue-300/80 hover:text-blue-300 transition">
            Forgot password?
          </a>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-sm font-semibold shadow-[0_4px_15px_rgba(59,130,246,0.35)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.5)] hover:-translate-y-px active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </button>

        <div className="flex items-center gap-2.5 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <p className="text-center text-xs text-white/40">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-300/85 hover:text-blue-300 transition">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}