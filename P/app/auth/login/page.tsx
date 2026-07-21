"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Check role to redirect correctly
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white relative">
        
        {/* Back Link */}
        <div className="absolute top-8 left-8">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2">
            ← Back to home
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Logo / Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#534AB7] to-indigo-400 flex items-center justify-center shadow-lg shadow-[#534AB7]/20">
              <i className="fa-solid fa-graduation-cap text-white text-lg"></i>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">HNDIT Smart Lab</h1>
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-sm text-slate-500 mb-8">Enter your email and password to access your account.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 border border-red-200 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]/20 focus:border-[#534AB7] transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-[#534AB7] hover:text-indigo-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]/20 focus:border-[#534AB7] transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#534AB7] hover:bg-[#4a42a3] text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-[#534AB7]/20 disabled:opacity-70 mt-2"
            >
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-3">
            <p className="text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-[#534AB7] hover:text-indigo-700 font-bold transition-colors">
                Register Now
              </Link>
            </p>
            <p className="text-xs text-slate-400">
              <Link href="/auth/admin-login" className="hover:text-slate-600 transition-colors">
                Admin login →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Branding Area */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0f0a1e] via-[#1a1035] to-[#0d0d1a] items-center justify-center p-12">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#534AB7]/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px] animate-pulse delay-1000" />
        </div>
        
        <div className="relative z-10 w-full max-w-lg">
          <p className="text-[#534AB7] font-semibold text-sm tracking-wider uppercase mb-4">
            HNDIT Smart Learning Platform
          </p>
          <h2 className="text-5xl font-bold text-white leading-tight mb-6">
            Effortlessly<br/>manage your study<br/>and practicals.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Log in to access your personalized learning dashboard, manage your assignments, track your progress, and interact with the AI tutor in real-time.
          </p>

          {/* Abstract representation of UI */}
          <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-2xl">
            <div className="flex gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/10 rounded-xl h-24 p-4 flex flex-col justify-end">
                <div className="w-8 h-2 bg-white/20 rounded-full mb-2"></div>
                <div className="w-16 h-4 bg-[#534AB7] rounded-full"></div>
              </div>
              <div className="bg-white/10 rounded-xl h-24 p-4 flex flex-col justify-end">
                <div className="w-12 h-2 bg-white/20 rounded-full mb-2"></div>
                <div className="w-20 h-4 bg-white/40 rounded-full"></div>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl h-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
