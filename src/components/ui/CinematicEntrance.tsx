'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CinematicEntrance({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<'loading' | 'reveal' | 'done'>('loading');

  useEffect(() => {
    // Check if we already showed the entrance this session
    if (sessionStorage.getItem('toh-entered')) {
      setPhase('done');
      return;
    }

    const timer1 = setTimeout(() => setPhase('reveal'), 1200);
    const timer2 = setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem('toh-entered', '1');
    }, 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {phase !== 'done' && (
          <motion.div
            className="fixed inset-0 z-[10000] flex items-center justify-center"
            style={{ backgroundColor: '#1d1d1f' }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: phase === 'loading' ? 1 : 0, y: phase === 'loading' ? 0 : -30 }}
              transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            >
              {/* Minimal leaf icon */}
              <motion.svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                className="mx-auto mb-6"
                initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <path
                  d="M20 4C20 4 8 12 8 24C8 32 13 36 20 36C27 36 32 32 32 24C32 12 20 4 20 4Z"
                  fill="rgba(74, 103, 65, 0.9)"
                />
                <path
                  d="M20 12V32M20 20C16 18 14 16 14 16M20 24C24 22 26 20 26 20"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </motion.svg>
              <motion.p
                className="font-serif text-lg tracking-wider"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Tree of Hope
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'done' ? 1 : phase === 'reveal' ? 1 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {children}
      </motion.div>
    </>
  );
}
