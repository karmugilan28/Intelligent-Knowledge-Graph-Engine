import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, conceptName }) => {
  const modalRef = useRef(null);
  const cancelBtnRef = useRef(null);
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      
      if (e.key === 'Enter') {
        onConfirm();
        return;
      }

      // Tab trapping
      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    if (isOpen) {
      // Focus cancel by default
      setTimeout(() => {
        if (cancelBtnRef.current) cancelBtnRef.current.focus();
      }, 50);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-2xl p-6"
          >
            <button 
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
              
              <div>
                <h2 id="modal-title" className="text-xl font-black text-[var(--text-primary)] mb-2">Undo Completion?</h2>
                <p id="modal-desc" className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  You already completed <strong className="text-[var(--text-primary)]">{conceptName}</strong>. Removing completion may affect your milestone progress and overall roadmap score.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-4">
                <button
                  ref={cancelBtnRef}
                  onClick={onClose}
                  aria-label="Cancel and keep completed"
                  className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-primary)] transition-colors border border-[var(--border-primary)] focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
                >
                  Cancel
                </button>
                <button
                  ref={confirmBtnRef}
                  onClick={onConfirm}
                  aria-label="Confirm undo completion"
                  className="flex-1 px-5 py-2.5 rounded-xl font-bold text-sm bg-orange-500 text-white hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] shadow-sm"
                >
                  Undo Completion
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
