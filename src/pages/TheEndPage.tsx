import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TheEndPage.css';

interface TheEndPageProps {
  onComplete: () => void;
}

// Generate floating hearts
function generateFloatingHearts(count: number) {
  const emojis = ['💖', '💗', '💝', '✨', '🌟', '💫', '🌸', '💕'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: emojis[i % emojis.length],
    left: `${5 + Math.random() * 90}%`,
    size: `${14 + Math.random() * 18}px`,
    duration: 6 + Math.random() * 6,
    delay: Math.random() * 8,
    drift: (Math.random() - 0.5) * 120,
  }));
}

// Typewriter hook for the thank you message
function useTypewriter(text: string, speed = 60, startDelay = 500) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);

    const startTimer = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayedText(text.slice(0, i + 1));
          i++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [text, speed, startDelay]);

  return { displayedText, isComplete };
}

export default function TheEndPage({ onComplete }: TheEndPageProps) {
  const [phase, setPhase] = useState(0);
  // 0: mount, 1: Show main text (typewriter), 2: Show subtitle, 3: particle burst, 4: exit

  const floatingHearts = useMemo(() => generateFloatingHearts(20), []);

  const thankYouText = 'THANK YOU EVERYONE!';
  const { displayedText, isComplete: typewriterDone } = useTypewriter(
    thankYouText,
    65,
    phase >= 1 ? 0 : 99999 // Only start when phase >= 1
  );

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),      // Start typewriter
      setTimeout(() => setPhase(2), 4500),      // Show subtitle text
      setTimeout(() => setPhase(3), 7000),      // Particle burst + hearts
      setTimeout(() => setPhase(4), 9500),      // Start exit
      setTimeout(() => onComplete(), 10500),    // Navigate
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="theend-page page-container">
      {/* Deep background gradient */}
      <div className="theend-deep-bg" />

      {/* Background stars — more and varied */}
      <div className="stars-container">
        {Array.from({ length: 80 }, (_, i) => (
          <div
            key={i}
            className={`star ${i % 5 === 0 ? 'star-large' : ''}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Shooting stars */}
      <div className="shooting-stars">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="shooting-star"
            style={{
              top: `${10 + Math.random() * 40}%`,
              left: `${Math.random() * 60}%`,
              animationDelay: `${i * 3 + Math.random() * 2}s`,
              animationDuration: `${2 + Math.random()}s`,
            }}
          />
        ))}
      </div>

      {/* Floating hearts & emojis */}
      <AnimatePresence>
        {phase >= 2 && (
          <div className="floating-hearts-container">
            {floatingHearts.map((h) => (
              <motion.div
                key={h.id}
                className="floating-heart"
                initial={{ opacity: 0, y: '110vh', x: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: '-10vh',
                  x: h.drift,
                }}
                transition={{
                  duration: h.duration,
                  delay: h.delay * 0.3,
                  ease: 'easeOut',
                }}
                style={{
                  left: h.left,
                  fontSize: h.size,
                }}
              >
                {h.emoji}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Cinematic bars */}
      <motion.div
        className="cinema-bar cinema-bar-top"
        initial={{ height: '0%' }}
        animate={{ height: '10%' }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      <motion.div
        className="cinema-bar cinema-bar-bottom"
        initial={{ height: '0%' }}
        animate={{ height: '10%' }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />

      {/* Main content */}
      {phase >= 1 && (
        <motion.div
          className="theend-text-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 4 ? 0 : 1 }}
          transition={{ duration: phase === 4 ? 0.8 : 1.5 }}
        >
          {/* Thank you text with typewriter */}
          <motion.div
            className="theend-main-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h1 className="theend-title">
              {(phase >= 1 ? displayedText : '').split('').map((char, i) => (
                <span
                  key={i}
                  className="theend-char"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
              {phase >= 1 && !typewriterDone && (
                <span className="typewriter-cursor-end">|</span>
              )}
            </h1>
          </motion.div>

          {/* Decorative divider with glow */}
          <motion.div
            className="theend-divider-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1.5 }}
          >
            <motion.div
              className="theend-divider-star"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              ✦
            </motion.div>
            <motion.div
              className="theend-divider"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '160px', opacity: 1 }}
              transition={{ delay: 2.2, duration: 1.2 }}
            />
            <motion.div
              className="theend-divider-star"
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              ✦
            </motion.div>
          </motion.div>

          {/* Subtitle */}
          {phase >= 2 && (
            <motion.p
              className="theend-subtitle"
              initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            >
              Cảm ơn mọi người rất nhiều 💫
            </motion.p>
          )}

          {/* Additional decorative emoji line */}
          {phase >= 2 && (
            <motion.div
              className="theend-emoji-line"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              {'🌸 💖 🌟 💗 🌸'.split(' ').map((emoji, i) => (
                <motion.span
                  key={i}
                  className="theend-emoji"
                  animate={{
                    y: [0, -8, 0],
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {emoji}
                </motion.span>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Floating particles burst at phase 3 */}
      {phase >= 3 && (
        <div className="burst-particles">
          {Array.from({ length: 60 }, (_, i) => {
            const angle = (i / 60) * Math.PI * 2;
            const distance = 120 + Math.random() * 300;
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
                  duration: 2.5 + Math.random(),
                  ease: 'easeOut',
                  delay: Math.random() * 0.5,
                }}
                style={{
                  width: `${3 + Math.random() * 8}px`,
                  height: `${3 + Math.random() * 8}px`,
                  background: [
                    '#ec4899', '#f472b6', '#a855f7', '#fb7185', '#fbbf24',
                    '#db2777', '#f43f5e', '#d946ef', '#e879f9', '#fda4af',
                  ][i % 10],
                }}
              />
            );
          })}
        </div>
      )}

      {/* Radial light burst at phase 3 */}
      {phase >= 3 && (
        <motion.div
          className="radial-light-burst"
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
      )}

      {/* Timer indicator */}
      <motion.div
        className="timer-bar"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 10.5, ease: 'linear' }}
      />
    </div>
  );
}
