"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          student_id: studentId
        },
        emailRedirectTo: undefined, // no email confirmation
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Sign out immediately so they must log in manually
    await supabase.auth.signOut();
    router.push("/auth/login?registered=true");
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

        <div className="w-full max-w-md py-12">
          {/* Logo / Header */}
          <div className="flex justify-center mb-10">
            <img src="/hnditlogo.png" alt="HNDIT Logo" className="h-28 md:h-32 w-auto object-contain drop-shadow-md" />
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
          <p className="text-sm text-slate-500 mb-8">Join HNDIT Smart Lab today to manage your studies.</p>

          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 border border-red-200 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#005581]/20 focus:border-[#005581] transition-all hover:border-[#72CDF4]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Registration Number</label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="GAL/IT/2324/F/0046"
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#005581]/20 focus:border-[#005581] transition-all hover:border-[#72CDF4]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
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
                  placeholder="Min. 6 characters"
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#005581]/20 focus:border-[#005581] transition-all hover:border-[#72CDF4] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#005581] hover:bg-[#ffd200] hover:text-slate-900 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-md shadow-[#005581]/20 disabled:opacity-70 mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#005581] hover:text-[#ffd200] font-bold transition-colors">
                Sign in
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
            Start Learning Today
          </p>
          <h2 className="text-5xl font-bold text-white leading-tight mb-6">
            Gain complete<br />control over your<br />education.
          </h2>

          <div className="space-y-6 mt-12">
            {/* Feature 1 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#72CDF4]/20 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-chart-line text-[#72CDF4] text-xl"></i>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Real-Time Tracking</h3>
                <p className="text-slate-400 text-sm">Monitor your assignments, grades, and practical progress instantly.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#72CDF4]/20 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-robot text-[#72CDF4] text-xl"></i>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">AI-Powered Tutor</h3>
                <p className="text-slate-400 text-sm">Get instant help and personalized learning recommendations using AI.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
