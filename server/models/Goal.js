import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: { type: String, required: true, trim: true },
  targetAmount: { type: Number, required: true, min: [1, 'Target must be positive'] },
  currentAmount: { type: Number, default: 0, min: [0, 'Cannot be negative'] },
  deadline: { type: String, required: true },
  icon: { type: String, default: '🎯' },
  color: { type: String, default: '#8b5cf6' },
}, { timestamps: true });

export default mongoose.model('Goal', goalSchema);
