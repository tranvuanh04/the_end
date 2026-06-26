import { Router, Request, Response } from 'express';
import Feedback from '../models/Feedback';

const router = Router();

// GET all feedbacks
router.get('/', async (_req: Request, res: Response) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

// GET feedbacks by member
router.get('/:memberId', async (req: Request, res: Response) => {
  try {
    const feedbacks = await Feedback.find({ memberId: req.params.memberId }).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

// POST new feedback
router.post('/', async (req: Request, res: Response) => {
  try {
    const { memberId, memberName, content, emoji } = req.body;

    if (!memberId || !memberName || !content) {
      res.status(400).json({ error: 'memberId, memberName, and content are required' });
      return;
    }

    const feedback = new Feedback({ memberId, memberName, content, emoji });
    await feedback.save();
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create feedback' });
  }
});

export default router;
