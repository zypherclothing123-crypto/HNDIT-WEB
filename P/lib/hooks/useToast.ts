"use client";

import { useCallback, useState } from "react";
import type { Toast, ToastType } from "@/components/ui/ToastNotification";

let counter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast-${++counter}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message?: string) => push("success", title, message),
    [push]
  );

  const error = useCallback(
    (title: string, message?: string) => push("error", title, message),
    [push]
  );

  return { toasts, dismiss, success, error };
}
