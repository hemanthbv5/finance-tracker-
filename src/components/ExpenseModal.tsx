import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import type { Expense } from '../types';

const schema = z.object({
  amount: z.number({ required_error: 'Amount required' }).positive('Must be positive'),
  date: z.string().min(1, 'Date required'),
  category: z.enum(['Food', 'Rent', 'Shopping', 'Transportation', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Travel', 'EMI', 'Insurance', 'Investment', 'Others']),
  paymentMethod: z.enum(['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'UPI', 'Digital Wallet', 'Other']),
  notes: z.string().optional(),
  isRecurring: z.boolean(),
  recurrenceFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'none']).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  expense?: Expense | null;
  onClose: () => void;
}

const ExpenseModal: React.FC<Props> = ({ expense, onClose }) => {
  const { addExpense, updateExpense } = useFinanceStore();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: expense ? {
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      notes: expense.notes || '',
      isRecurring: expense.isRecurring,
      recurrenceFrequency: expense.recurrenceFrequency || 'monthly',
    } : {
      date: new Date().toISOString().split('T')[0],
      category: 'Food',
      paymentMethod: 'UPI',
      isRecurring: false,
      recurrenceFrequency: 'monthly',
    },
  });

  const isRecurring = watch('isRecurring');

  const onSubmit = (data: FormData) => {
    if (expense) {
      updateExpense(expense.id, data);
    } else {
      addExpense(data as Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{expense ? '✏️ Edit Expense' : '➕ Add Expense'}</div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('amount', { valueAsNumber: true })}
                />
                {errors.amount && <div className="form-error">{errors.amount.message}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input className="form-input" type="date" {...register('date')} />
                {errors.date && <div className="form-error">{errors.date.message}</div>}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" {...register('category')}>
                  {['Food', 'Rent', 'Shopping', 'Transportation', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Travel', 'EMI', 'Insurance', 'Investment', 'Others'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method *</label>
                <select className="form-select" {...register('paymentMethod')}>
                  {['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'UPI', 'Digital Wallet', 'Other'].map(m => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" placeholder="Optional notes..." {...register('notes')} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <label className="toggle">
                <input type="checkbox" {...register('isRecurring')} />
                <div className="toggle-slider" />
              </label>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Recurring Expense</span>
            </div>

            {isRecurring && (
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <select className="form-select" {...register('recurrenceFrequency')}>
                  {['daily', 'weekly', 'monthly', 'yearly'].map(f => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {expense ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
