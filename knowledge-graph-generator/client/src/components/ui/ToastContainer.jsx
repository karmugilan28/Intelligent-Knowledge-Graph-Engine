import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Trophy, Download } from 'lucide-react';

const ToastContainer = ({ toasts }) => {
  return (
    <div className="fixed top-20 right-6 z-[60] flex flex-col gap-3 pointer-events-none" role="region" aria-live="polite">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="pointer-events-auto bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-xl rounded-xl p-4 flex items-center gap-3 min-w-[280px]"
          >
            {toast.type === 'achievement' ? (
              <div className="p-1.5 bg-yellow-500/10 rounded-lg shrink-0">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
            ) : toast.type === 'export' ? (
              <div className="p-1.5 bg-[#8b5cf6]/10 rounded-lg shrink-0">
                <Download className="w-5 h-5 text-[#8b5cf6]" />
              </div>
            ) : (
              <div className="p-1.5 bg-[#10b981]/10 rounded-lg shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
              </div>
            )}
            
            <div className="flex-1">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">{toast.title}</h4>
              {toast.message && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{toast.message}</p>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
