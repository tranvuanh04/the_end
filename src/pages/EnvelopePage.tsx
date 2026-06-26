import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './EnvelopePage.css';

interface EnvelopePageProps {
  onComplete: () => void;
}

// Generate petals for the landing page
function generatePetals(count: number) {
  const petalColors = [
    'rgba(236, 72, 153, 0.35)',
    'rgba(244, 63, 94, 0.3)',
    'rgba(251, 113, 133, 0.3)',
    'rgba(219, 39, 119, 0.25)',
    'rgba(168, 85, 247, 0.2)',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${8 + Math.random() * 12}px`,
    color: petalColors[i % petalColors.length],
    duration: `${7 + Math.random() * 8}s`,
    delay: `${Math.random() * 10}s`,
    drift: `${(Math.random() - 0.5) * 180}px`,
    rotation: `${180 + Math.random() * 360}deg`,
  }));
}

// Typewriter for intro text
function useTypewriter(text: string, speed = 50, startDelay = 500) {
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

export default function EnvelopePage({ onComplete }: EnvelopePageProps) {
  const [clicks, setClicks] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isOpening, setIsOpening] = useState(false);
  const totalClicks = 6;
  const progress = Math.min(clicks / totalClicks, 1);
  const petals = useMemo(() => generatePetals(30), []);

  const introText = 'Có một bức thư dành cho bạn...';
  const { displayedText: introDisplayed, isComplete: introComplete } = useTypewriter(introText, 60, 800);

  const spawnParticles = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1200);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (isOpening) return;
    spawnParticles(e);
    const next = clicks + 1;
    setClicks(next);

    if (next >= totalClicks) {
      setIsOpening(true);
      setTimeout(onComplete, 1500);
    }
  };

  const flapAngle = progress * 180;

  return (
    <div className="envelope-page page-container">
      {/* Animated mesh background */}
      <div className="animated-mesh-bg" />
      <div className="envelope-bg-glow" />

      {/* 🌸 Petal Rain */}
      <div className="petal-container">
        {petals.map((p) => (
          <div
            key={p.id}
            className="petal"
            style={{
              left: p.left,
              '--petal-size': p.size,
              '--petal-color': p.color,
              '--petal-duration': p.duration,
              '--petal-delay': p.delay,
              '--petal-drift': p.drift,
              '--petal-rotation': p.rotation,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Background ambient sparkles */}
      <div className="ambient-particles">
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className="ambient-dot"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Typewriter intro text */}
      <AnimatePresence>
        {clicks === 0 && (
          <motion.div
            className="envelope-intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
          >
            <p className="envelope-intro-text">
              {introDisplayed}
              {!introComplete && <span className="typewriter-cursor landing-cursor">|</span>}
            </p>
            {introComplete && (
              <motion.p
                className="envelope-hint"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                ✨ Nhấn vào bức thư để mở ✨
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      {clicks > 0 && clicks < totalClicks && (
        <motion.div
          className="progress-dots"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {Array.from({ length: totalClicks }, (_, i) => (
            <motion.div
              key={i}
              className={`progress-dot ${i < clicks ? 'active' : ''}`}
              animate={i < clicks ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.3 }}
            />
          ))}
        </motion.div>
      )}

      {/* Envelope */}
      <motion.div
        className={`envelope ${isOpening ? 'opening' : ''}`}
        onClick={handleClick}
        whileHover={!isOpening ? { scale: 1.03, y: -8 } : {}}
        whileTap={!isOpening ? { scale: 0.97 } : {}}
        animate={isOpening ? {
          scale: 1.15,
          opacity: 0,
          y: -80,
          rotateX: 10,
        } : {}}
        transition={{ duration: isOpening ? 1.5 : 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Envelope glow aura */}
        <div className="envelope-aura" />

        {/* Envelope body */}
        <div className="envelope-body">
          <div className="envelope-pattern" />
          <div className="envelope-inner-shadow" />

          {/* Letter peeking out */}
          <motion.div
            className="letter-peek"
            animate={{ y: -(progress * 70) }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="letter-line" />
            <div className="letter-line short" />
            <div className="letter-line" />
            <div className="letter-heart">💌</div>
          </motion.div>

          {/* Seal */}
          <motion.div
            className="envelope-seal"
            animate={{
              scale: 1 - progress * 0.3,
              opacity: 1 - progress * 0.8,
              rotate: progress * 45,
            }}
          >
            <span>❤️</span>
          </motion.div>
        </div>

        {/* Envelope flap */}
        <div
          className="envelope-flap"
          style={{
            transform: `rotateX(${flapAngle}deg)`,
          }}
        />

        {/* Click particles — more and prettier */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="click-particle"
            initial={{ x: p.x, y: p.y, scale: 0, opacity: 1 }}
            animate={{
              x: p.x + (Math.random() - 0.5) * 200,
              y: p.y + (Math.random() - 0.5) * 200,
              scale: Math.random() * 2 + 0.5,
              opacity: 0,
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        ))}
      </motion.div>

      {/* Click count text */}
      <AnimatePresence>
        {clicks > 0 && clicks < totalClicks && (
          <motion.p
            className="click-count"
            key={clicks}
            initial={{ opacity: 0, scale: 0.8, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -5 }}
          >
            {totalClicks - clicks} lần nữa...
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
