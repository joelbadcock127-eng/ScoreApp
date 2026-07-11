'use client';

import { useEffect, useState } from 'react';

// Animated modal: backdrop fades and the card slides up on open;
// on close it slides down and fades away quickly before unmounting.
export default function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Double rAF so the entering styles paint before transitioning in.
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else if (mounted) {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 180);
      return () => clearTimeout(t);
    }
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 transition-opacity ${
        visible ? 'opacity-100 duration-300' : 'opacity-0 duration-150'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-8 shadow-card transition-all md:p-10 ${
          visible
            ? 'translate-y-0 opacity-100 duration-300 ease-out'
            : 'translate-y-10 opacity-0 duration-150 ease-in'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
