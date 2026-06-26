import { useState, useEffect, useCallback } from 'react';
import type { Feedback } from '../types';
import { getFeedbacksByMember, createFeedback } from '../services/api';

export function useFeedback(memberId: string | undefined) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeedbacks = useCallback(() => {
    if (!memberId) return;
    setLoading(true);
    getFeedbacksByMember(memberId)
      .then(setFeedbacks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [memberId]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const sendFeedback = async (data: {
    memberId: string;
    memberName: string;
    content: string;
    emoji?: string;
  }) => {
    setSending(true);
    setError(null);
    try {
      const newFeedback = await createFeedback(data);
      setFeedbacks((prev) => [newFeedback, ...prev]);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSending(false);
    }
  };

  return { feedbacks, loading, sending, error, sendFeedback, refetch: fetchFeedbacks };
}
