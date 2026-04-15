"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Spotlight from "@/components/ui/spotlight";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else alert("Login berhasil!");
  };

  return (
    <div className="relative flex h-screen items-center justify-center bg-black text-white overflow-hidden">

      <Spotlight />

      <div className="z-10 w-[350px] space-y-4 rounded-2xl bg-white/10 backdrop-blur-xl p-6 border border-white/20 shadow-xl">
        
        <h1 className="text-2xl font-bold text-center">
          Login
        </h1>

        <Input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="bg-black/40 border-white/20 text-white"
        />

        <Input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          className="bg-black/40 border-white/20 text-white"
        />

        <Button
          onClick={handleLogin}
          className="w-full bg-green-500 hover:bg-green-600"
        >
          Login
        </Button>
      </div>
    </div>
  );
}