import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './TheEndPage.css';

interface TheEndPageProps {
  onComplete: () => void;
}

export default function TheEndPage({ onComplete }: TheEndPageProps) {
  const [phase, setPhase] = useState(0); // 0: mount, 1: The End, 2: See You Again, 3: particles, 4: exit

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),     // Show "The End"
      setTimeout(() => setPhase(2), 3000),     // Show "See You Again"
      setTimeout(() => setPhase(3), 5000),     // Particle burst
      setTimeout(() => setPhase(4), 7500),     // Start exit
      setTimeout(() => onComplete(), 8000),    // Navigate
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="theend-page page-container">
      {/* Background stars */}
      <div className="stars-container">
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Cinematic bars */}
      <motion.div
        className="cinema-bar cinema-bar-top"
        initial={{ height: '0%' }}
        animate={{ height: '12%' }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <motion.div
        className="cinema-bar cinema-bar-bottom"
        initial={{ height: '0%' }}
        animate={{ height: '12%' }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />

      {/* "The End" text */}
      {phase >= 1 && (
        <motion.div
          className="theend-text-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 4 ? 0 : 1 }}
          transition={{ duration: phase === 4 ? 0.5 : 1.5 }}
        >
          <motion.h1
            className="theend-title"
            initial={{ opacity: 0, scale: 0.8, letterSpacing: '0.5em' }}
            animate={{
              opacity: 1,
              scale: 1,
              letterSpacing: '0.2em',
            }}
            transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {'The End'.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.6 }}
                className="theend-char"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.h1>

          {/* Decorative line */}
          <motion.div
            className="theend-divider"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '120px', opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
          />

          {/* "See You Again" */}
          {phase >= 2 && (
            <motion.p
              className="theend-subtitle"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              See You Again
            </motion.p>
          )}
        </motion.div>
      )}

      {/* Floating particles burst at phase 3 */}
      {phase >= 3 && (
        <div className="burst-particles">
          {Array.from({ length: 40 }, (_, i) => {
            const angle = (i / 40) * Math.PI * 2;
            const distance = 150 + Math.random() * 250;
            return (
              <motion.div
                key={i}
                className="burst-particle"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{
                  duration: 2 + Math.random(),
                  ease: 'easeOut',
                  delay: Math.random() * 0.3,
                }}
                style={{
                  width: `${4 + Math.random() * 6}px`,
                  height: `${4 + Math.random() * 6}px`,
                  background: ['#d4a574', '#e8a0bf', '#7eb8da', '#a8e6cf', '#ffd3b6'][i % 5],
                }}
              />
            );
          })}
        </div>
      )}

      {/* Timer indicator */}
      <motion.div
        className="timer-bar"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 8, ease: 'linear' }}
      />
    </div>
  );
}
