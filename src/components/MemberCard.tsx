import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Member } from '../types';
import './MemberCard.css';

interface MemberCardProps {
  member: Member;
  index: number;
  onClick: () => void;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(-2)
    .toUpperCase();
}

export default function MemberCard({ member, index, onClick }: MemberCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D tilt effect — card tilts toward the mouse
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
  }, []);

  return (
    <motion.div
      className="member-card"
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 50, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.08,
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileTap={{ scale: 0.97 }}
      style={{
        '--card-accent': member.color,
        transition: 'transform 0.15s ease-out, border-color 0.35s ease, box-shadow 0.35s ease',
      } as React.CSSProperties}
    >
      {/* Animated gradient border */}
      <div className="card-border-glow" />

      <div className="card-inner">
        {/* Image Area — large, top portion */}
        <div className="card-image-area">
          <div className="card-avatar-wrapper">
            {member.avatar ? (
              <img src={member.avatar} alt={member.name} className="card-avatar-img" />
            ) : (
              <div className="card-avatar-initials">
                {getInitials(member.name)}
              </div>
            )}
          </div>
          <div className="card-image-shimmer" />
        </div>

        {/* Info — below image */}
        <div className="card-info">
          <div className="card-accent-bar" />
          <h3 className="card-name">{member.nickname || member.name}</h3>
          <p className="card-role">{member.role}</p>
        </div>
      </div>

      {/* Hover arrow */}
      <div className="card-arrow">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M7 4L13 10L7 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </motion.div>
  );
}
