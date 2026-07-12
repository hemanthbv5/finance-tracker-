import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFinanceStore } from '../store/financeStore';

const schema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('income'),
    amount: z.number().positive(),
    date: z.string().min(1),
    category: z.enum(['Salary', 'Freelance', 'Business', 'Investments', 'Gift', 'Other']),
    source: z.string().min(1),
    notes: z.string().optional(),
    isRecurring: z.boolean().default(false),
    recurrenceFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'none']).optional(),
  }),
  z.object({
    type: z.literal('expense'),
    amount: z.number().positive(),
    date: z.string().min(1),
    category: z.enum(['Food', 'Rent', 'Shopping', 'Transportation', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Travel', 'EMI', 'Insurance', 'Investment', 'Others']),
    paymentMethod: z.enum(['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'UPI', 'Digital Wallet', 'Other']),
    notes: z.string().optional(),
    isRecurring: z.boolean().default(false),
    recurrenceFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'none']).optional(),
  }),
]);

interface Props {
  onClose: () => void;
}

const TransactionModal: React.FC<Props> = ({ onClose }) => {
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const { addIncome, addExpense } = useFinanceStore();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      type: txType,
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: txType === 'income' ? 'Salary' : 'Food',
      paymentMethod: 'UPI',
      isRecurring: false,
      recurrenceFrequency: 'monthly',
      source: '',
      notes: '',
    }
  });

  const onSubmit = (data: any) => {
    if (txType === 'income') {
      addIncome({ ...data, type: undefined });
    } else {
      addExpense({ ...data, type: undefined });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div className="modal-title">➕ Quick Add Transaction</div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          {/* Type Toggle */}
          <div className="tabs" style={{ marginBottom: '20px' }}>
            <button
              type="button"
              className={`tab ${txType === 'income' ? 'active' : ''}`}
              onClick={() => setTxType('income')}
              style={{ color: txType === 'income' ? 'var(--accent-green)' : undefined }}
            >
              💰 Income
            </button>
            <button
              type="button"
              className={`tab ${txType === 'expense' ? 'active' : ''}`}
              onClick={() => setTxType('expense')}
              style={{ color: txType === 'expense' ? 'var(--accent-red)' : undefined }}
            >
              💸 Expense
            </button>
          </div>

          <form id="quick-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input className="form-input" type="number" step="0.01" placeholder="0.00"
                  {...register('amount', { required: true, valueAsNumber: true, min: 0.01 })} />
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input className="form-input" type="date" {...register('date', { required: true })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" {...register('category')}>
                {txType === 'income'
                  ? ['Salary', 'Freelance', 'Business', 'Investments', 'Gift', 'Other'].map(c => <option key={c}>{c}</option>)
                  : ['Food', 'Rent', 'Shopping', 'Transportation', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Travel', 'EMI', 'Insurance', 'Investment', 'Others'].map(c => <option key={c}>{c}</option>)
                }
              </select>
            </div>

            {txType === 'income' ? (
              <div className="form-group">
                <label className="form-label">Source *</label>
                <input className="form-input" placeholder="e.g. Tech Corp" {...register('source', { required: txType === 'income' })} />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-select" {...register('paymentMethod')}>
                  {['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'UPI', 'Digital Wallet', 'Other'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Notes</label>
              <input className="form-input" placeholder="Optional notes..." {...register('notes')} />
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="quick-form" className="btn btn-primary">
            Add {txType === 'income' ? 'Income' : 'Expense'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
