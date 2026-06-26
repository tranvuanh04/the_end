import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FeedbackForm.css';

interface FeedbackFormProps {
  memberId: string;
  memberName: string;
  onSubmit: (data: { memberId: string; memberName: string; content: string; emoji?: string }) => Promise<boolean>;
  sending: boolean;
}

const emojis = ['❤️', '🙏', '😊', '🥺', '💪', '🌟', '🎉', '👋'];

export default function FeedbackForm({ memberId, memberName, onSubmit, sending }: FeedbackFormProps) {
  const [content, setContent] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const ok = await onSubmit({
      memberId,
      memberName,
      content: content.trim(),
      emoji: selectedEmoji,
    });

    if (ok) {
      setSuccess(true);
      setContent('');
      setSelectedEmoji(undefined);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="feedback-form-container glass-panel">
      <h3 className="feedback-form-title">
        💌 Gửi lời nhắn lại cho mình
      </h3>
      <p className="feedback-form-desc">
        Bạn có điều gì muốn nói không? Mình sẽ rất vui khi đọc được 🥰
      </p>

      <form onSubmit={handleSubmit} className="feedback-form">
        {/* Emoji selector */}
        <div className="emoji-selector">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`emoji-btn ${selectedEmoji === emoji ? 'selected' : ''}`}
              onClick={() => setSelectedEmoji(selectedEmoji === emoji ? undefined : emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <div className="textarea-wrapper">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Viết gì đó cho mình nhé, ${memberName}...`}
            rows={4}
            maxLength={1000}
            className="feedback-textarea"
          />
          <span className="char-count">{content.length}/1000</span>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          className="feedback-submit"
          disabled={!content.trim() || sending}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {sending ? (
            <span className="submit-loading">
              <span className="spinner-small" />
              Đang gửi...
            </span>
          ) : (
            'Gửi lời nhắn 💌'
          )}
        </motion.button>
      </form>

      {/* Success message */}
      <AnimatePresence>
        {success && (
          <motion.div
            className="feedback-success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            ✨ Cảm ơn bạn! Mình đã nhận được lời nhắn rồi!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
