import { Router, Request, Response } from 'express';
import Member from '../models/Member';

const router = Router();

// GET all members
router.get('/', async (_req: Request, res: Response) => {
  try {
    const members = await Member.find().sort({ order: 1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// GET single member
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// POST new member
router.post('/', async (req: Request, res: Response) => {
  try {
    const newMember = new Member(req.body);
    const savedMember = await newMember.save();
    res.status(201).json(savedMember);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// PUT update member
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedMember) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }
    res.json(updatedMember);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// DELETE member
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(req.params.id);
    if (!deletedMember) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }
    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

export default router;
