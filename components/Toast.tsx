import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";

// Toast state management
interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  duration?: number;
}

const toasts = signal<ToastMessage[]>([]);

// Toast API
export const toast = {
  success: (message: string, duration = 3000) => {
    const id = Date.now().toString();
    toasts.value = [...toasts.value, {
      id,
      type: "success",
      message,
      duration,
    }];
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, duration);
  },

  error: (message: string, duration = 4000) => {
    const id = Date.now().toString();
    toasts.value = [...toasts.value, { id, type: "error", message, duration }];
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, duration);
  },

  info: (message: string, duration = 3000) => {
    const id = Date.now().toString();
    toasts.value = [...toasts.value, { id, type: "info", message, duration }];
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, duration);
  },
};

// Toast Container Component
export default function ToastContainer() {
  return (
    <div class="fixed top-4 right-4 z-50 space-y-2">
      {toasts.value.map((toast) => <ToastItem key={toast.id} toast={toast} />)}
    </div>
  );
}

// Individual Toast Component
function ToastItem({ toast: toastItem }: { toast: ToastMessage }) {
  const bgColor = {
    success: "bg-flamingo-purple/90 text-white",
    error: "bg-flamingo-coral/90 text-white",
    info: "bg-flamingo-charcoal/90 text-white",
  };

  const icon = {
    success: "✅",
    error: "❌",
    info: "ℹ️",
  };

  return (
    <div
      class={`
      ${bgColor[toastItem.type]}
      px-4 py-3 rounded-chunky border-3 border-white/20
      font-chunky text-sm tracking-wide
      transform animate-slide-in-right
      backdrop-blur-sm shadow-lg
      flex items-center gap-2
      max-w-sm
    `}
    >
      <span>{icon[toastItem.type]}</span>
      <span>{toastItem.message}</span>
    </div>
  );
}
