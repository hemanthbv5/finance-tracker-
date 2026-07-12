import express from 'express';
import protect from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();
router.use(protect);

// GET /api/profile
router.get('/', async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    currency: req.user.currency,
    currencySymbol: req.user.currencySymbol,
    monthlyIncome: req.user.monthlyIncome,
  });
});

// PUT /api/profile
router.put('/', async (req, res) => {
  try {
    const allowed = ['name', 'currency', 'currencySymbol', 'monthlyIncome'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });
    await req.user.save();
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      currency: req.user.currency,
      currencySymbol: req.user.currencySymbol,
      monthlyIncome: req.user.monthlyIncome,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/profile/password — change password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password required' });
    }
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
