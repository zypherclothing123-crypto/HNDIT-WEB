"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Mount → slide down and scale in
    const enterTimer = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 4s
    const leaveTimer = setTimeout(() => handleDismiss(), 4000);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(leaveTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDismiss() {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 350);
  }

  const isSuccess = toast.type === "success";

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        transform: visible && !leaving ? "translateY(0) scale(1)" : "translateY(-120%) scale(0.9)",
        opacity: visible && !leaving ? 1 : 0,
        transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
      }}
      className={[
        "relative flex items-start gap-3.5 w-auto min-w-[320px] max-w-[calc(100vw-2rem)]",
        "rounded-2xl border shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-4 py-3.5 overflow-hidden",
        "backdrop-blur-xl bg-white", // Solid white background
        isSuccess
          ? "border-emerald-200"
          : "border-red-200",
      ].join(" ")}
    >
      {/* Animated progress bar */}
      <span
        className={[
          "absolute bottom-0 left-0 h-1",
          isSuccess ? "bg-emerald-500" : "bg-red-500",
        ].join(" ")}
        style={{
          animation: visible ? "toast-progress 4s linear forwards" : "none",
        }}
      />

      {/* Icon */}
      <span className={[
        "mt-0.5 shrink-0 rounded-full p-1",
        isSuccess 
          ? "bg-emerald-100 text-emerald-600" 
          : "bg-red-100 text-red-600",
      ].join(" ")}>
        {isSuccess
          ? <CheckCircle2 size={20} strokeWidth={2.5} />
          : <XCircle size={20} strokeWidth={2.5} />}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0 pr-2">
        <p className={[
          "text-[15px] font-bold leading-snug tracking-tight",
          isSuccess ? "text-emerald-800" : "text-red-800"
        ].join(" ")}>{toast.title}</p>
        {toast.message && (
          <p className={[
            "text-[13px] mt-1 leading-snug font-medium",
            isSuccess ? "text-emerald-600" : "text-red-600",
          ].join(" ")}>
            {toast.message}
          </p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className={[
          "shrink-0 mt-0.5 rounded-full p-1.5 transition-colors",
          isSuccess
            ? "text-emerald-500 hover:bg-emerald-100"
            : "text-red-500 hover:bg-red-100",
        ].join(" ")}
      >
        <X size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}

interface ToastPortalProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastPortal({ toasts, onDismiss }: ToastPortalProps) {
  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
      <div
        aria-label="Notifications"
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-3 pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto origin-top">
            <ToastItem toast={t} onDismiss={onDismiss} />
          </div>
        ))}
      </div>
    </>
  );
}
