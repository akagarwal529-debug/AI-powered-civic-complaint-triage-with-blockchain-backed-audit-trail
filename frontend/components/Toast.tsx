"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; message: string; type: ToastType };

const ToastContext = createContext<{
  show: (message: string, type?: ToastType) => void;
}>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = (message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const styles = {
    success: "border-green-400 bg-green-950/90 text-green-100",
    error: "border-red-400 bg-red-950/90 text-red-100",
    info: "border-blue-400 bg-blue-950/90 text-blue-100",
  };
  const icons = { success: "✓", error: "!", info: "i" };
  const iconBg = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-20 right-4 z-[100] space-y-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`glass-2 border-l-4 ${styles[t.type]} rounded-xl p-4 shadow-2xl animate-slide-in`}
          >
            <div className="flex items-start gap-3">
              <div className={`${iconBg[t.type]} w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                {icons[t.type]}
              </div>
              <span className="text-sm font-medium pt-0.5">{t.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}