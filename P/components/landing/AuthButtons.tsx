"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, ShieldCheck, X } from "lucide-react";

export function AuthButtons() {
  const [isOpen, setIsOpen] = useState(false);
  const [actionType, setActionType] = useState<"login" | "register" | null>(null);
  const router = useRouter();

  const handleOpen = (type: "login" | "register") => {
    setActionType(type);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setActionType(null);
  };

  const handleRoleSelect = (role: "student" | "admin") => {
    handleClose();
    if (role === "student") {
      router.push(actionType === "login" ? "/sign-in" : "/sign-up");
    } else {
      router.push(actionType === "login" ? "/admin-login" : "/admin-register");
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleOpen("login")}
          className="text-sm font-semibold text-primary border border-primary/30 hover:bg-primary/5 px-5 py-2 rounded-full transition-all duration-300"
        >
          Sign In
        </button>
        <button
          onClick={() => handleOpen("register")}
          className="text-sm font-semibold bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 px-5 py-2 rounded-full transition-all duration-300"
        >
          Register
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="bg-primary/5 p-6 text-center border-b border-border">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {actionType === "login" ? "Welcome Back" : "Create an Account"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Please select your role to continue.
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <button
                onClick={() => handleRoleSelect("student")}
                className="w-full group flex items-center gap-4 p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <User size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-foreground">Student</h4>
                  <p className="text-xs text-muted-foreground">
                    Access courses, quizzes, and the AI Tutor.
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect("admin")}
                className="w-full group flex items-center gap-4 p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-foreground">Administrator</h4>
                  <p className="text-xs text-muted-foreground">
                    Manage students, content, and analytics.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
