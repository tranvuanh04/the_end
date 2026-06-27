import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMembers } from '../hooks/useMembers';
import MemberCard from '../components/MemberCard';
import './MembersPage.css';

// Generate petals once
function generatePetals(count: number) {
  const petalColors = [
    'rgba(236, 72, 153, 0.35)',
    'rgba(244, 63, 94, 0.3)',
    'rgba(251, 113, 133, 0.3)',
    'rgba(168, 85, 247, 0.2)',
    'rgba(236, 72, 153, 0.25)',
    'rgba(219, 39, 119, 0.3)',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${8 + Math.random() * 10}px`,
    color: petalColors[i % petalColors.length],
    duration: `${7 + Math.random() * 8}s`,
    delay: `${Math.random() * 12}s`,
    drift: `${(Math.random() - 0.5) * 160}px`,
    rotation: `${180 + Math.random() * 360}deg`,
  }));
}

export default function MembersPage() {
  const { members, loading, error } = useMembers();
  const navigate = useNavigate();
  const petals = useMemo(() => generatePetals(25), []);

  if (loading) {
    return (
      <div className="members-page page-container">
        <div className="loading-spinner">
          <div className="spinner" />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="members-page page-container">
        <p className="error-text">Đã xảy ra lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className="members-page">
      {/* Animated mesh gradient background */}
      <div className="animated-mesh-bg" />

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

      {/* Header */}
      <motion.header
        className="members-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="members-title">Những Người Đồng Hành</h1>
        <p className="members-subtitle">
          Cảm ơn các bạn đã đồng hành cùng mình trong suốt hành trình vừa qua.
          Nhấn vào card để đọc lời nhắn dành riêng cho bạn 💛
        </p>
        <div className="members-title-divider" />
      </motion.header>

      {/* Card Grid */}
      <div className="members-grid">
        {members.map((member, index) => (
          <MemberCard
            key={member._id}
            member={member}
            index={index}
            onClick={() => navigate(`/member/${member._id}`)}
          />
        ))}
      </div>

      {/* Footer */}
      <motion.footer
        className="members-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <p>Made with ❤️ as a farewell gift</p>
      </motion.footer>
    </div>
  );
}
