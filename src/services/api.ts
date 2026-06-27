import axios from 'axios';
import type { Member, Feedback } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Members
export const getMembers = async (): Promise<Member[]> => {
  const { data } = await api.get('/members');
  return data;
};

export const getMember = async (id: string): Promise<Member> => {
  const { data } = await api.get(`/members/${id}`);
  return data;
};

export const createMember = async (member: Omit<Member, '_id' | 'createdAt'>): Promise<Member> => {
  const { data } = await api.post('/members', member);
  return data;
};

export const updateMember = async (id: string, member: Partial<Member>): Promise<Member> => {
  const { data } = await api.put(`/members/${id}`, member);
  return data;
};

export const deleteMember = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.delete(`/members/${id}`);
  return data;
};

// Feedbacks
export const getFeedbacks = async (): Promise<Feedback[]> => {
  const { data } = await api.get('/feedbacks');
  return data;
};

export const getFeedbacksByMember = async (memberId: string): Promise<Feedback[]> => {
  const { data } = await api.get(`/feedbacks/${memberId}`);
  return data;
};

export const createFeedback = async (feedback: {
  memberId: string;
  memberName: string;
  content: string;
  emoji?: string;
}): Promise<Feedback> => {
  const { data } = await api.post('/feedbacks', feedback);
  return data;
};

export const deleteFeedback = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.delete(`/feedbacks/${id}`);
  return data;
};
