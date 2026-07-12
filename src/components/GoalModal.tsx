import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import type { SavingsGoal } from '../types';

const GOAL_ICONS = ['🎯', '💻', '🏖️', '🚗', '🏠', '📱', '🎓', '💍', '✈️', '🎸', '💎', '🌍', '🛡️', '📈'];
const GOAL_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#3b82f6'];

const schema = z.object({
  name: z.string().min(1, 'Goal name required'),
  targetAmount: z.number({ required_error: 'Target amount required' }).positive('Must be positive'),
  currentAmount: z.number().min(0, 'Cannot be negative').default(0),
  deadline: z.string().min(1, 'Deadline required'),
  icon: z.string().optional(),
  color: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  goal?: SavingsGoal | null;
  onClose: () => void;
}

const GoalModal: React.FC<Props> = ({ goal, onClose }) => {
  const { addGoal, updateGoal } = useFinanceStore();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: goal ? {
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      deadline: goal.deadline,
      icon: goal.icon || '🎯',
      color: goal.color || '#8b5cf6',
    } : {
      currentAmount: 0,
      icon: '🎯',
      color: '#8b5cf6',
    },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  const onSubmit = (data: FormData) => {
    if (goal) {
      updateGoal(goal.id, data);
    } else {
      addGoal(data as Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{goal ? '✏️ Edit Goal' : '🎯 New Savings Goal'}</div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Goal Name *</label>
              <input className="form-input" placeholder="e.g. Emergency Fund, MacBook, Vacation" {...register('name')} />
              {errors.name && <div className="form-error">{errors.name.message}</div>}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Target Amount (₹) *</label>
                <input className="form-input" type="number" step="0.01" placeholder="100000" {...register('targetAmount', { valueAsNumber: true })} />
                {errors.targetAmount && <div className="form-error">{errors.targetAmount.message}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Already Saved (₹)</label>
                <input className="form-input" type="number" step="0.01" placeholder="0" {...register('currentAmount', { valueAsNumber: true })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Deadline *</label>
              <input className="form-input" type="date" {...register('deadline')} />
              {errors.deadline && <div className="form-error">{errors.deadline.message}</div>}
            </div>

            {/* Icon Picker */}
            <div className="form-group">
              <label className="form-label">Icon</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {GOAL_ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setValue('icon', icon)}
                    style={{
                      width: '40px', height: '40px', borderRadius: '10px', fontSize: '20px',
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: selectedIcon === icon ? 'rgba(139,92,246,0.2)' : 'var(--bg-glass)',
                      border: selectedIcon === icon ? '2px solid #8b5cf6' : '2px solid var(--border-glass)',
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {GOAL_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue('color', color)}
                    style={{
                      width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
                      background: color,
                      border: selectedColor === color ? '3px solid white' : '3px solid transparent',
                      boxShadow: selectedColor === color ? `0 0 0 2px ${color}` : 'none',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {goal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;
