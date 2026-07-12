import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
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
    enum: ['Food', 'Rent', 'Shopping', 'Transportation', 'Bills', 'Entertainment',
      'Healthcare', 'Education', 'Travel', 'EMI', 'Insurance', 'Investment', 'Others'],
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'UPI', 'Digital Wallet', 'Other'],
  },
  notes: { type: String, default: '', trim: true },
  isRecurring: { type: Boolean, default: false },
  recurrenceFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'none', null],
    default: 'none',
  },
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
