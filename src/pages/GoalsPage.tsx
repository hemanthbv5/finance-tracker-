import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Target, Calendar, TrendingUp } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import {
  formatCurrencyFull, getGoalProgress, getDaysRemaining,
  getEstimatedCompletion, getMonthlyIncome, getMonthlyExpense
} from '../utils/finance';
import type { SavingsGoal } from '../types';
import GoalModal from '../components/GoalModal';

const GoalsPage: React.FC = () => {
  const { goals, deleteGoal, incomes, expenses } = useFinanceStore();
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const monthlyIncome = getMonthlyIncome(incomes);
  const monthlyExpense = getMonthlyExpense(expenses);

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <div className="page-title">🎯 Savings Goals</div>
          <div className="page-subtitle">Track progress toward your financial goals</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingGoal(null); setShowModal(true); }}>
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Total Target</div>
          <div style={{ fontFamily: 'Outfit', fontSize: '24px', fontWeight: 800 }}>
            {formatCurrencyFull(totalTarget)}
          </div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Total Saved</div>
          <div style={{ fontFamily: 'Outfit', fontSize: '24px', fontWeight: 800, color: 'var(--accent-green)' }}>
            {formatCurrencyFull(totalSaved)}
          </div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Overall Progress</div>
          <div style={{ fontFamily: 'Outfit', fontSize: '24px', fontWeight: 800, color: 'var(--accent-purple-light)' }}>
            {overallProgress}%
          </div>
          <div className="progress-bar" style={{ marginTop: '8px' }}>
            <div className="progress-fill" style={{ width: `${overallProgress}%`, background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)' }} />
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <div className="empty-state-title">No goals yet</div>
            <div className="empty-state-text">Create your first savings goal to start tracking progress</div>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowModal(true)}>
              <Plus size={16} /> Create Goal
            </button>
          </div>
        </div>
      ) : (
        <div className="grid-3">
          {goals.map(goal => {
            const progress = getGoalProgress(goal.currentAmount, goal.targetAmount);
            const daysLeft = getDaysRemaining(goal.deadline);
            const remaining = goal.targetAmount - goal.currentAmount;
            const estCompletion = getEstimatedCompletion(goal.currentAmount, goal.targetAmount, monthlyIncome, monthlyExpense);
            const isCompleted = progress >= 100;

            return (
              <div key={goal.id} className="goal-card" style={{ borderTop: `3px solid ${goal.color || '#8b5cf6'}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px', fontSize: '22px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${goal.color || '#8b5cf6'}20`,
                    }}>
                      {goal.icon || '🎯'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{goal.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={11} />
                        {isCompleted ? 'Completed! 🎉' : `${daysLeft} days left`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-secondary btn-icon"
                      onClick={() => { setEditingGoal(goal); setShowModal(true); }}>
                      <Edit2 size={13} />
                    </button>
                    <button className="btn btn-danger btn-icon" onClick={() => deleteGoal(goal.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Progress</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: goal.color || 'var(--accent-purple)' }}>{progress}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: '10px' }}>
                    <div className="progress-fill" style={{
                      width: `${progress}%`,
                      background: isCompleted
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : `linear-gradient(90deg, ${goal.color || '#8b5cf6'}, ${goal.color || '#8b5cf6'}aa)`,
                    }} />
                  </div>
                </div>

                {/* Amount details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <div style={{
                    background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px', border: '1px solid var(--border-glass)'
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Saved</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--accent-green)' }}>
                      {formatCurrencyFull(goal.currentAmount)}
                    </div>
                  </div>
                  <div style={{
                    background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px', border: '1px solid var(--border-glass)'
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Target</div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>
                      {formatCurrencyFull(goal.targetAmount)}
                    </div>
                  </div>
                </div>

                {!isCompleted && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Target size={11} />
                      Remaining: <strong style={{ color: 'var(--text-secondary)' }}>{formatCurrencyFull(remaining)}</strong>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingUp size={11} />
                      Est: <strong style={{ color: 'var(--text-secondary)' }}>{estCompletion}</strong>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <GoalModal
          goal={editingGoal}
          onClose={() => { setShowModal(false); setEditingGoal(null); }}
        />
      )}
    </div>
  );
};

export default GoalsPage;
