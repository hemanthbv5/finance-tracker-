import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import type { Income, IncomeCategory, RecurrenceFrequency } from '../types';

const schema = z.object({
  amount: z.number({ required_error: 'Amount required' }).positive('Must be positive'),
  date: z.string().min(1, 'Date required'),
  category: z.enum(['Salary', 'Freelance', 'Business', 'Investments', 'Gift', 'Other']),
  source: z.string().min(1, 'Source required'),
  notes: z.string().optional(),
  isRecurring: z.boolean(),
  recurrenceFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'none']).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  income?: Income | null;
  onClose: () => void;
}

const IncomeModal: React.FC<Props> = ({ income, onClose }) => {
  const { addIncome, updateIncome } = useFinanceStore();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: income ? {
      amount: income.amount,
      date: income.date,
      category: income.category,
      source: income.source,
      notes: income.notes || '',
      isRecurring: income.isRecurring,
      recurrenceFrequency: income.recurrenceFrequency || 'monthly',
    } : {
      date: new Date().toISOString().split('T')[0],
      category: 'Salary',
      isRecurring: false,
      recurrenceFrequency: 'monthly',
    },
  });

  const isRecurring = watch('isRecurring');

  const onSubmit = (data: FormData) => {
    if (income) {
      updateIncome(income.id, data);
    } else {
      addIncome(data as Omit<Income, 'id' | 'createdAt' | 'updatedAt'>);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{income ? '✏️ Edit Income' : '➕ Add Income'}</div>
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
                  {['Salary', 'Freelance', 'Business', 'Investments', 'Gift', 'Other'].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Source *</label>
                <input className="form-input" placeholder="e.g. Tech Corp, Client A" {...register('source')} />
                {errors.source && <div className="form-error">{errors.source.message}</div>}
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
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Recurring Income</span>
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
              {income ? 'Update Income' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeModal;
