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
    'rgba(244, 114, 182, 0.3)',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${8 + Math.random() * 14}px`,
    color: petalColors[i % petalColors.length],
    duration: `${6 + Math.random() * 9}s`,
    delay: `${Math.random() * 12}s`,
    drift: `${(Math.random() - 0.5) * 200}px`,
    rotation: `${180 + Math.random() * 540}deg`,
  }));
}

// Generate floating light orbs
function generateOrbs(count: number) {
  const orbColors = [
    'rgba(236, 72, 153, 0.08)',
    'rgba(168, 85, 247, 0.06)',
    'rgba(244, 63, 94, 0.07)',
    'rgba(251, 113, 133, 0.05)',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${10 + Math.random() * 80}%`,
    top: `${10 + Math.random() * 80}%`,
    size: `${80 + Math.random() * 160}px`,
    color: orbColors[i % orbColors.length],
    duration: `${10 + Math.random() * 10}s`,
    delay: `${Math.random() * 5}s`,
  }));
}

// Generate aurora trails
function generateAuroraTrails(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: `${10 + Math.random() * 80}%`,
    angle: `${-15 + Math.random() * 30}deg`,
    duration: `${6 + Math.random() * 8}s`,
    delay: `${Math.random() * 5}s`,
    opacity: 0.15 + Math.random() * 0.25,
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
  const petals = useMemo(() => generatePetals(35), []);
  const orbs = useMemo(() => generateOrbs(5), []);
  const auroraTrails = useMemo(() => generateAuroraTrails(4), []);

  const introText = 'Có một bức thư dành cho bạn...';
  const { displayedText: introDisplayed, isComplete: introComplete } = useTypewriter(introText, 55, 800);

  const spawnParticles = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newParticles = Array.from({ length: 16 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1500);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (isOpening) return;
    spawnParticles(e);
    const next = clicks + 1;
    setClicks(next);

    if (next >= totalClicks) {
      setIsOpening(true);
      setTimeout(onComplete, 1800);
    }
  };

  const flapAngle = progress * 180;

  return (
    <div className="envelope-page page-container">
      {/* Animated mesh background */}
      <div className="animated-mesh-bg" />
      <div className="envelope-bg-glow" />

      {/* Aurora light trails */}
      <div className="aurora-trails">
        {auroraTrails.map((t) => (
          <div
            key={t.id}
            className="aurora-trail"
            style={{
              top: t.top,
              '--aurora-angle': t.angle,
              '--aurora-duration': t.duration,
              '--aurora-delay': t.delay,
              opacity: t.opacity,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Floating light orbs */}
      <div className="light-orbs">
        {orbs.map((orb) => (
          <div
            key={orb.id}
            className="light-orb"
            style={{
              left: orb.left,
              top: orb.top,
              width: orb.size,
              height: orb.size,
              background: orb.color,
              '--orb-duration': orb.duration,
              '--orb-delay': orb.delay,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* 🌸 Petal Rain — more petals */}
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

      {/* Background ambient sparkles — more */}
      <div className="ambient-particles">
        {Array.from({ length: 55 }, (_, i) => (
          <div
            key={i}
            className="ambient-dot"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${2 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Typewriter intro text */}
      <AnimatePresence>
        {clicks === 0 && (
          <motion.div
            className="envelope-intro"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40, scale: 0.95, filter: 'blur(6px)' }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="envelope-intro-text">
              {introDisplayed}
              {!introComplete && <span className="typewriter-cursor landing-cursor">|</span>}
            </p>
            {introComplete && (
              <motion.p
                className="envelope-hint"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
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
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {Array.from({ length: totalClicks }, (_, i) => (
            <motion.div
              key={i}
              className={`progress-dot ${i < clicks ? 'active' : ''}`}
              animate={i < clicks ? { scale: [1, 1.5, 1] } : {}}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          ))}
        </motion.div>
      )}

      {/* Envelope */}
      <motion.div
        className={`envelope ${isOpening ? 'opening' : ''}`}
        onClick={handleClick}
        whileHover={!isOpening ? { scale: 1.04, y: -10, rotateY: 2 } : {}}
        whileTap={!isOpening ? { scale: 0.96 } : {}}
        animate={isOpening ? {
          scale: 1.2,
          opacity: 0,
          y: -100,
          rotateX: 15,
          filter: 'blur(8px) brightness(1.5)',
        } : {}}
        transition={{ duration: isOpening ? 1.8 : 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
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
            animate={{ y: -(progress * 80) }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
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
              scale: 1 - progress * 0.4,
              opacity: 1 - progress * 0.9,
              rotate: progress * 60,
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
              x: p.x + (Math.random() - 0.5) * 250,
              y: p.y + (Math.random() - 0.5) * 250,
              scale: Math.random() * 2.5 + 0.5,
              opacity: 0,
              rotate: Math.random() * 360,
            }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        ))}
      </motion.div>

      {/* Click count text */}
      <AnimatePresence>
        {clicks > 0 && clicks < totalClicks && (
          <motion.p
            className="click-count"
            key={clicks}
            initial={{ opacity: 0, scale: 0.7, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {totalClicks - clicks} lần nữa...
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
