import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: { type: Number, required: true, min: [0.01, 'Amount must be positive'] },
  date: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Salary', 'Freelance', 'Business', 'Investments', 'Gift', 'Other'],
  },
  source: { type: String, required: true, trim: true },
  notes: { type: String, default: '', trim: true },
  isRecurring: { type: Boolean, default: false },
  recurrenceFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'none', null],
    default: 'none',
  },
}, { timestamps: true });

export default mongoose.model('Income', incomeSchema);
