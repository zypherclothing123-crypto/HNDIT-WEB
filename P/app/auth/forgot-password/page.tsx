"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white relative">
        
        {/* Back Link */}
        <div className="absolute top-8 left-8">
          <Link href="/auth/login" className="text-sm text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2">
            ← Back to login
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Logo / Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#534AB7] to-indigo-400 flex items-center justify-center shadow-lg shadow-[#534AB7]/20">
              <i className="fa-solid fa-key text-white text-lg"></i>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">HNDIT Smart Lab</h1>
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Reset Password</h2>
          <p className="text-sm text-slate-500 mb-8">We&apos;ll send you a recovery link to your email.</p>

          {success ? (
            <div className="text-center space-y-4 bg-emerald-50 border border-emerald-100 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-envelope-circle-check text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Check your email</h3>
              <p className="text-slate-600 text-sm">
                We have sent a password reset link to your email address.
              </p>
              <div className="pt-4">
                <Link
                  href="/auth/login"
                  className="block w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl transition-all shadow-sm"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
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
                  placeholder="name@company.com"
                  className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#534AB7]/20 focus:border-[#534AB7] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#534AB7] hover:bg-[#4a42a3] text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-[#534AB7]/20 disabled:opacity-70 mt-4"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  Remember your password?{" "}
                  <Link href="/auth/login" className="text-[#534AB7] hover:text-indigo-700 font-bold transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          )}
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
            Security
          </p>
          <h2 className="text-5xl font-bold text-white leading-tight mb-6">
            Get back into<br/>your account.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Don't worry if you've forgotten your password. We'll send you a secure link to get you back on track in no time.
          </p>

          <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-2xl max-w-sm">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-lock text-emerald-400"></i>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Secure Recovery</h3>
                <p className="text-slate-400 text-sm">Your data remains protected with encrypted links.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
