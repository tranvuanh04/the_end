import mongoose, { Schema, Document } from 'mongoose';

export interface IMember extends Document {
  name: string;
  nickname?: string;
  role: string;
  avatar: string;
  message: string;
  quote?: string;
  color: string;
  order: number;
  createdAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    name: { type: String, required: true },
    nickname: { type: String },
    role: { type: String, required: true },
    avatar: { type: String, default: '' },
    message: { type: String, required: true },
    quote: { type: String },
    color: { type: String, default: '#d4a574' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IMember>('Member', MemberSchema);
