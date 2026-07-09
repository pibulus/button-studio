import { signal } from "@preact/signals";
// import { useEffect } from "preact/hooks";

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
    <div class="fixed top-[max(1rem,env(safe-area-inset-top))] left-4 right-4 sm:left-auto z-50 space-y-2 max-w-[calc(100vw-2rem)] sm:max-w-sm">
      {toasts.value.map((toast) => <ToastItem key={toast.id} toast={toast} />)}
    </div>
  );
}

// Individual Toast Component
function ToastItem({ toast: toastItem }: { toast: ToastMessage }) {
  const bgColor = {
    success: "bg-[var(--pink)]/95 text-black",
    error: "bg-[#C1392B]/95 text-white",
    info: "bg-[var(--ink)]/95 text-white",
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
      px-4 py-3 rounded-2xl border-3 border-white/20
      font-black text-sm tracking-wide
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
