"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
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

    // Verify admin role in profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setError("Access denied. This account does not have admin privileges.");
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white relative">
        
        {/* Back Link */}
        <div className="absolute top-8 left-8">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded-full transition-all">
            ← Back to home
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Logo / Header */}
          <div className="flex justify-center mb-10">
            <img src="/hnditlogo.png" alt="HNDIT Logo" className="h-28 md:h-32 w-auto object-contain drop-shadow-md" />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Admin Portal</h2>
          <p className="text-sm text-slate-500 mb-8">Sign in to access administration controls.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 border border-red-200 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#005581]/20 focus:border-[#005581] transition-all hover:border-[#72CDF4]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#005581]/20 focus:border-[#005581] transition-all hover:border-[#72CDF4] pr-10"
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
              className="w-full bg-[#005581] hover:bg-[#ffd200] hover:text-slate-900 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md shadow-[#005581]/20 disabled:opacity-70 mt-2"
            >
              {loading ? "Verifying..." : "Sign In as Admin"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Not an admin?{" "}
              <Link href="/auth/login" className="text-[#005581] hover:text-[#ffd200] font-bold transition-colors">
                Student login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Branding Area */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#001824] via-[#003855] to-[#00111a] items-center justify-center p-12">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#72CDF4]/20 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#ffd200]/10 blur-[100px] animate-pulse delay-1000" />
        </div>
        
        <div className="relative z-10 w-full max-w-lg">
          <p className="text-[#ffd200] font-semibold text-sm tracking-wider uppercase mb-4">
            Administration
          </p>
          <h2 className="text-5xl font-bold text-white leading-tight mb-6">
            Manage your<br/>platform securely.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Log in to oversee student progress, manage system settings, and configure the learning environment for the entire organization.
          </p>

          <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#72CDF4]/20 flex items-center justify-center">
                <i className="fa-solid fa-users text-[#72CDF4]"></i>
              </div>
              <div>
                <div className="w-24 h-3 bg-white/40 rounded-full mb-2"></div>
                <div className="w-16 h-2 bg-white/20 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#72CDF4]/20 flex items-center justify-center">
                <i className="fa-solid fa-gear text-[#72CDF4]"></i>
              </div>
              <div>
                <div className="w-32 h-3 bg-white/40 rounded-full mb-2"></div>
                <div className="w-20 h-2 bg-white/20 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
