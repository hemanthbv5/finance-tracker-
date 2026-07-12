import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  month: { type: String, required: true }, // "YYYY-MM"
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Rent', 'Shopping', 'Transportation', 'Bills', 'Entertainment',
      'Healthcare', 'Education', 'Travel', 'EMI', 'Insurance', 'Investment', 'Others'],
  },
  limit: { type: Number, required: true, min: [1, 'Limit must be positive'] },
}, { timestamps: true });

// Unique budget per user per month per category
budgetSchema.index({ userId: 1, month: 1, category: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
