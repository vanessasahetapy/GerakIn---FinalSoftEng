// === FILE: src/components/ui/Toast.tsx ===
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

const icons = {
  success: <CheckCircle size={20} className="text-success" />,
  error:   <XCircle    size={20} className="text-danger"  />,
  info:    <Info       size={20} className="text-accent"  />,
};

const borders = {
  success: 'border-l-success',
  error:   'border-l-danger',
  info:    'border-l-accent',
};

export const Toast: React.FC<ToastProps> = ({ type, message, visible, onClose, duration = 3500 }) => {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [visible, duration, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,   scale: 1    }}
          exit={{   opacity: 0, y: -20, scale: 0.95  }}
          transition={{ duration: 0.2 }}
          className={clsx(
            'fixed top-6 right-6 z-[60] flex items-center gap-4 bg-bg-base/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/5 border-l-4 px-6 py-5 min-w-[320px] max-w-md',
            borders[type]
          )}
        >
          <div className="shrink-0">{icons[type]}</div>
          <span className="flex-1 font-inter text-sm font-medium text-white">{message}</span>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Hook ─────────────────────────────────────────────────────────
export const useToast = () => {
  const [toast, setToast] = React.useState<{ type: ToastType; message: string; visible: boolean }>({
    type: 'success', message: '', visible: false,
  });
  const show = (type: ToastType, message: string) => setToast({ type, message, visible: true });
  const hide = () => setToast((t) => ({ ...t, visible: false }));
  return { toast, show, hide };
};
