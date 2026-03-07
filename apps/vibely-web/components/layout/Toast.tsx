"use client";

// ============================================================
// apps/web/components/layout/Toast.tsx
// ============================================================
// Global toast notification system.
//
// WHY a global context instead of per-page state?
// Every page currently has its own useState('') + setTimeout
// toast pattern. That's 6+ duplicated implementations. A context
// means one useToast() call anywhere in the tree.
//
// USAGE in any component:
//   const { showToast } = useToast();
//   showToast('Profile updated!');
//   showToast('Failed to save', 'error');
// ============================================================

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      // Auto-dismiss after 3.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </ToastContext.Provider>
  );
}

// ── Toast Container ───────────────────────────────────────────

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const config = {
    success: { bg: "bg-gray-900", icon: "✓", iconColor: "text-emerald-400" },
    error: { bg: "bg-red-600", icon: "✕", iconColor: "text-white" },
    info: { bg: "bg-gray-900", icon: "ℹ", iconColor: "text-blue-400" },
  }[toast.type];

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-white text-sm
        pointer-events-auto cursor-pointer select-none
        transition-all duration-300
        ${config.bg}
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `}
      onClick={() => onDismiss(toast.id)}
    >
      <span className={`font-bold ${config.iconColor}`}>{config.icon}</span>
      <span className="font-medium">{toast.message}</span>
    </div>
  );
}
