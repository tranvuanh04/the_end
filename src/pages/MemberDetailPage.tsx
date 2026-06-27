import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useMember } from '../hooks/useMembers';
import { useFeedback } from '../hooks/useFeedback';
import FeedbackForm from '../components/FeedbackForm';
import FeedbackList from '../components/FeedbackList';
import { toDirectAvatarUrl } from '../utils/avatarUrl';
import './MemberDetailPage.css';

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(-2)
    .toUpperCase();
}

// Typewriter hook
function useTypewriter(text: string, speed = 30, startDelay = 800) {
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

// Generate petals for detail page
function generatePetals(count: number) {
  const petalColors = [
    'rgba(236, 72, 153, 0.25)',
    'rgba(244, 63, 94, 0.2)',
    'rgba(251, 113, 133, 0.2)',
    'rgba(168, 85, 247, 0.15)',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${6 + Math.random() * 8}px`,
    color: petalColors[i % petalColors.length],
    duration: `${8 + Math.random() * 6}s`,
    delay: `${Math.random() * 10}s`,
    drift: `${(Math.random() - 0.5) * 120}px`,
    rotation: `${180 + Math.random() * 360}deg`,
  }));
}

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { member, loading: memberLoading } = useMember(id);
  const { feedbacks, loading: fbLoading, sending, sendFeedback } = useFeedback(id);
  const petals = useMemo(() => generatePetals(15), []);

  const messageText = member?.message || '';
  const { displayedText, isComplete } = useTypewriter(messageText, 25, 1200);

  if (memberLoading) {
    return (
      <div className="detail-page page-container">
        <div className="loading-spinner">
          <div className="spinner" />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="detail-page page-container">
        <p className="error-text">Không tìm thấy thành viên này.</p>
        <button className="back-btn" onClick={() => navigate('/members')}>
          ← Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="detail-page" style={{ '--member-color': member.color } as React.CSSProperties}>
      {/* Animated background */}
      <div className="animated-mesh-bg" />
      <div className="detail-bg-gradient" />

      {/* Petal rain */}
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

      {/* Back button */}
      <motion.button
        className="back-btn"
        onClick={() => navigate('/members')}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M13 16L7 10L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Quay lại
      </motion.button>

      {/* Member info section */}
      <motion.section
        className="detail-hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Avatar with orbit icons */}
        <div className="detail-avatar-container">
          {member.avatar ? (
            <img src={toDirectAvatarUrl(member.avatar)} alt={member.name} className="detail-avatar-img" />
          ) : (
            <div className="detail-avatar-initials">
              {getInitials(member.name)}
            </div>
          )}
          <div className="detail-avatar-glow" />

          {/* Orbiting icons */}
          <div className="avatar-orbit">
            <span className="orbit-icon" style={{ '--orbit-delay': '0s' } as React.CSSProperties}>💛</span>
            <span className="orbit-icon" style={{ '--orbit-delay': '-2.5s' } as React.CSSProperties}>✨</span>
            <span className="orbit-icon" style={{ '--orbit-delay': '-5s' } as React.CSSProperties}>🌟</span>
          </div>
        </div>

        {/* Name & Role */}
        <h1 className="detail-name">{member.name}</h1>
        {member.nickname && member.nickname !== member.name && (
          <p className="detail-nickname">"{member.nickname}"</p>
        )}
        <p className="detail-role">{member.role}</p>
      </motion.section>

      {/* Message section — with typewriter */}
      <motion.section
        className="detail-message glass-panel"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="message-icon">💌</div>
        <h2 className="message-heading">Lời muốn nói...</h2>
        <div className="message-divider" />
        <p className="message-text">
          {displayedText}
          {!isComplete && <span className="typewriter-cursor">|</span>}
        </p>

        {member.quote && isComplete && (
          <motion.blockquote
            className="message-quote"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="quote-mark">"</span>
            {member.quote}
          </motion.blockquote>
        )}
      </motion.section>

      {/* Feedback section */}
      <motion.section
        className="detail-feedback-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7 }}
      >
        <FeedbackForm
          memberId={member._id}
          memberName={member.nickname || member.name}
          onSubmit={sendFeedback}
          sending={sending}
        />
      </motion.section>

      {/* Feedback list */}
      <motion.section
        className="detail-feedback-list"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.7 }}
      >
        <FeedbackList feedbacks={feedbacks} loading={fbLoading} />
      </motion.section>
    </div>
  );
}
