import React, { useState } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import { formatCurrencyFull, getCurrentMonth, getBudgetUsed } from '../utils/finance';
import { CATEGORY_COLORS } from '../utils/finance';
import type { Budget, ExpenseCategory } from '../types';
import BudgetModal from '../components/BudgetModal';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food', 'Rent', 'Shopping', 'Transportation', 'Bills',
  'Entertainment', 'Healthcare', 'Education', 'Travel',
  'EMI', 'Insurance', 'Investment', 'Others'
];

const CATEGORY_ICONS: Record<string, string> = {
  Food: '🍔', Rent: '🏠', Shopping: '🛍️', Transportation: '🚗',
  Bills: '⚡', Entertainment: '🎬', Healthcare: '💊', Education: '📚',
  Travel: '✈️', EMI: '💳', Insurance: '🛡️', Investment: '📈', Others: '📦'
};

const BudgetPage: React.FC = () => {
  const { budgets, expenses, deleteBudget } = useFinanceStore();
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const monthBudgets = budgets.filter(b => b.month === selectedMonth);
  const totalBudget = monthBudgets.reduce((s, b) => s + b.limit, 0);
  const totalUsed = monthBudgets.reduce((s, b) =>
    s + getBudgetUsed(expenses, b.category as ExpenseCategory, selectedMonth), 0);
  const totalRemaining = totalBudget - totalUsed;
  const overallPct = totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0;

  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().substring(0, 7);
  });

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <div className="page-title">💼 Budget Planner</div>
          <div className="page-subtitle">Set and track your monthly spending limits</div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: '140px' }}
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            {monthOptions.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => { setEditingBudget(null); setShowModal(true); }}>
            <Plus size={16} /> Add Budget
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Total Budget</div>
          <div style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800 }}>
            {formatCurrencyFull(totalBudget)}
          </div>
        </div>
        <div className="stat-card expense">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Total Used</div>
          <div style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: overallPct > 80 ? 'var(--accent-red)' : 'var(--accent-orange)' }}>
            {formatCurrencyFull(totalUsed)}
          </div>
          <div style={{ marginTop: '8px' }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{
                width: `${Math.min(overallPct, 100)}%`,
                background: overallPct > 80 ? 'linear-gradient(90deg, #f43f5e, #fb923c)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
              }} />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{overallPct}% of total budget used</div>
          </div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Remaining</div>
          <div style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: totalRemaining >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {totalRemaining >= 0 ? formatCurrencyFull(totalRemaining) : `-${formatCurrencyFull(Math.abs(totalRemaining))}`}
          </div>
        </div>
      </div>

      {/* Budget Cards */}
      {monthBudgets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">💼</div>
            <div className="empty-state-title">No budgets set for {selectedMonth}</div>
            <div className="empty-state-text">Create budgets for each spending category to stay on track</div>
            <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowModal(true)}>
              <Plus size={16} /> Create Budget
            </button>
          </div>
        </div>
      ) : (
        <div className="grid-2">
          {monthBudgets.map(budget => {
            const used = getBudgetUsed(expenses, budget.category as ExpenseCategory, selectedMonth);
            const remaining = budget.limit - used;
            const pct = budget.limit > 0 ? Math.round((used / budget.limit) * 100) : 0;
            const isOver = pct > 100;
            const isWarning = pct >= 75 && pct <= 100;
            const catColor = CATEGORY_COLORS[budget.category] || '#8b5cf6';

            let barColor = catColor;
            if (isOver) barColor = '#f43f5e';
            else if (isWarning) barColor = '#f59e0b';

            return (
              <div key={budget.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px', fontSize: '20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${catColor}20`,
                    }}>
                      {CATEGORY_ICONS[budget.category] || '📦'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{budget.category}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {formatCurrencyFull(used)} of {formatCurrencyFull(budget.limit)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isOver ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-red)', fontSize: '12px', fontWeight: 600 }}>
                        <AlertTriangle size={14} /> Over budget
                      </span>
                    ) : pct >= 75 ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-orange)', fontSize: '12px', fontWeight: 600 }}>
                        <AlertTriangle size={14} /> {pct}% used
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-green)', fontSize: '12px', fontWeight: 600 }}>
                        <CheckCircle size={14} /> On track
                      </span>
                    )}
                    <button className="btn btn-secondary btn-icon"
                      onClick={() => { setEditingBudget(budget); setShowModal(true); }}>
                      <Edit2 size={13} />
                    </button>
                    <button className="btn btn-danger btn-icon" onClick={() => deleteBudget(budget.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="progress-bar" style={{ height: '10px', marginBottom: '8px' }}>
                  <div className="progress-fill" style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>{pct}% used</span>
                  <span style={{ color: remaining >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                    {remaining >= 0 ? `${formatCurrencyFull(remaining)} remaining` : `${formatCurrencyFull(Math.abs(remaining))} over`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <BudgetModal
          budget={editingBudget}
          month={selectedMonth}
          onClose={() => { setShowModal(false); setEditingBudget(null); }}
        />
      )}
    </div>
  );
};

export default BudgetPage;
