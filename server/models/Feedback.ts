import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  memberId: mongoose.Types.ObjectId;
  memberName: string;
  content: string;
  emoji?: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
    memberName: { type: String, required: true },
    content: { type: String, required: true },
    emoji: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
