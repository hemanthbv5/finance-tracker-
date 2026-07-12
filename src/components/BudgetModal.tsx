import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import type { Budget, ExpenseCategory } from '../types';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food', 'Rent', 'Shopping', 'Transportation', 'Bills',
  'Entertainment', 'Healthcare', 'Education', 'Travel',
  'EMI', 'Insurance', 'Investment', 'Others'
];

const schema = z.object({
  category: z.enum(['Food', 'Rent', 'Shopping', 'Transportation', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Travel', 'EMI', 'Insurance', 'Investment', 'Others']),
  limit: z.number({ required_error: 'Limit required' }).positive('Must be positive'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  budget?: Budget | null;
  month: string;
  onClose: () => void;
}

const BudgetModal: React.FC<Props> = ({ budget, month, onClose }) => {
  const { addBudget, updateBudget } = useFinanceStore();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: budget ? {
      category: budget.category,
      limit: budget.limit,
    } : {
      category: 'Food',
    },
  });

  const onSubmit = (data: FormData) => {
    if (budget) {
      updateBudget(budget.id, { ...data, month });
    } else {
      addBudget({ ...data, month });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <div className="modal-title">{budget ? '✏️ Edit Budget' : '💼 Add Budget'}</div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            <div style={{
              padding: '12px',
              background: 'rgba(139,92,246,0.1)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(139,92,246,0.2)',
              marginBottom: '16px',
              fontSize: '13px',
              color: 'var(--text-secondary)'
            }}>
              📅 Setting budget for: <strong>{month}</strong>
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" {...register('category')}>
                {EXPENSE_CATEGORIES.map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Limit (₹) *</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                placeholder="e.g. 5000"
                {...register('limit', { valueAsNumber: true })}
              />
              {errors.limit && <div className="form-error">{errors.limit.message}</div>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {budget ? 'Update Budget' : 'Add Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
