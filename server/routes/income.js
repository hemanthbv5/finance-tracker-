import express from 'express';
import Income from '../models/Income.js';
import protect from '../middleware/auth.js';

const router = express.Router();
router.use(protect); // all routes require auth

// GET /api/income — get all income for current user
router.get('/', async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/income — add income
router.post('/', async (req, res) => {
  try {
    const income = await Income.create({ ...req.body, userId: req.user._id });
    res.status(201).json(income);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/income/:id — update income
router.put('/:id', async (req, res) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, userId: req.user._id });
    if (!income) return res.status(404).json({ message: 'Income not found' });
    Object.assign(income, req.body);
    await income.save();
    res.json(income);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/income/:id — delete income
router.delete('/:id', async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!income) return res.status(404).json({ message: 'Income not found' });
    res.json({ message: 'Income deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
