"use client";

import { SignInButton, SignUpButton, SignedOut } from "@clerk/nextjs";

export function LandingAuthModal() {
  return (
    <div className="landing-glass-card w-full max-w-md mx-auto p-8 flex flex-col gap-6 items-center justify-center text-center">
      <h3 className="text-2xl font-bold text-heading">Ready to start?</h3>
      <p className="text-muted-foreground text-sm">Join the Smart Lab today to enhance your learning experience.</p>
      
      <SignedOut>
        <div className="flex flex-col w-full gap-4">
          <SignInButton mode="modal">
            <button className="landing-btn-primary w-full py-3 text-lg font-semibold shadow-lg shadow-[#005581]/30 transition-transform hover:scale-[1.02]">
              Sign In
            </button>
          </SignInButton>
          
          <SignUpButton mode="modal">
            <button className="landing-btn-secondary w-full py-3 text-lg font-semibold transition-transform hover:scale-[1.02]">
              Create Free Account
            </button>
          </SignUpButton>
        </div>
      </SignedOut>
      
      <p className="text-xs text-muted-foreground pt-4">
        By signing up you agree to our{" "}
        <span className="text-[#005581] dark:text-[#72CDF4] font-medium cursor-pointer hover:underline">Terms of Service</span>
      </p>
    </div>
  );
}
