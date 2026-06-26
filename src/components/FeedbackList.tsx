import { motion } from 'framer-motion';
import type { Feedback } from '../types';
import './FeedbackList.css';

interface FeedbackListProps {
  feedbacks: Feedback[];
  loading: boolean;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function FeedbackList({ feedbacks, loading }: FeedbackListProps) {
  if (loading) {
    return (
      <div className="feedback-list-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="feedback-list-empty">
        <p>Chưa có lời nhắn nào. Hãy là người đầu tiên! ✨</p>
      </div>
    );
  }

  return (
    <div className="feedback-list">
      <h4 className="feedback-list-title">📬 Những lời nhắn đã gửi</h4>
      <div className="feedback-items">
        {feedbacks.map((fb, i) => (
          <motion.div
            key={fb._id}
            className="feedback-item glass-panel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <div className="feedback-item-header">
              <span className="feedback-author">
                {fb.emoji && <span className="feedback-emoji">{fb.emoji}</span>}
                {fb.memberName}
              </span>
              <span className="feedback-date">{formatDate(fb.createdAt)}</span>
            </div>
            <p className="feedback-content">{fb.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
