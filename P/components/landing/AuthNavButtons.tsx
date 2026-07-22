"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function AuthNavButtons() {
  const [active, setActive] = useState<"login" | "register">("register");
  const router = useRouter();

  const handleAction = (e: React.MouseEvent, type: "login" | "register") => {
    e.preventDefault();
    setActive(type);
    // Wait for the slide animation to complete before routing
    setTimeout(() => router.push(`/auth/${type}`), 300);
  };

  return (
    <div className="flex items-center gap-1 bg-white/10 p-1.5 rounded-full border border-white/10 shadow-inner">
      <button
        onClick={(e) => handleAction(e, "login")}
        className={`relative px-5 py-2 text-sm font-bold rounded-full transition-colors ${
          active === "login" ? "text-black" : "text-white hover:text-white/80"
        }`}
      >
        {active === "login" && (
          <motion.div
            layoutId="auth-pill"
            className="absolute inset-0 bg-[#ffd200] rounded-full shadow-lg shadow-[#ffd200]/40"
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
          />
        )}
        <span className="relative z-10">Sign In</span>
      </button>

      <button
        onClick={(e) => handleAction(e, "register")}
        className={`relative px-5 py-2 text-sm font-bold rounded-full transition-colors ${
          active === "register" ? "text-black" : "text-white hover:text-white/80"
        }`}
      >
        {active === "register" && (
          <motion.div
            layoutId="auth-pill"
            className="absolute inset-0 bg-[#ffd200] rounded-full shadow-lg shadow-[#ffd200]/40"
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
          />
        )}
        <span className="relative z-10">Register</span>
      </button>
    </div>
  );
}
