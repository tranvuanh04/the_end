export interface Member {
  _id: string;
  name: string;
  nickname?: string;
  role: string;
  avatar: string;
  message: string;
  quote?: string;
  color: string;
  order: number;
  createdAt: string;
}

export interface Feedback {
  _id: string;
  memberId: string;
  memberName: string;
  content: string;
  emoji?: string;
  createdAt: string;
}
