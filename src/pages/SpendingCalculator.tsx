import React, { useState } from 'react';
import { Calculator, TrendingDown, Calendar, BarChart2 } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import {
  formatCurrencyFull, getDailyExpense, getWeeklyExpense,
  getMonthlyExpense, getYearlyExpense, getCategorySpending,
  getLargestExpense, formatDate
} from '../utils/finance';
import { CATEGORY_COLORS } from '../utils/finance';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SpendingCalculator: React.FC = () => {
  const { expenses } = useFinanceStore();

  const daily = getDailyExpense(expenses);
  const weekly = getWeeklyExpense(expenses);
  const monthly = getMonthlyExpense(expenses);
  const yearly = getYearlyExpense(expenses);

  const categorySpending = getCategorySpending(expenses);
  const largest = getLargestExpense(expenses);

  const avgDaily = expenses.length > 0
    ? expenses.reduce((s, e) => s + e.amount, 0) / Math.max(1,
      Math.ceil((new Date().getTime() - new Date(Math.min(...expenses.map(e => new Date(e.date).getTime()))).getTime()) / (1000 * 60 * 60 * 24))
    )
    : 0;

  const stats = [
    { label: 'Today', value: daily, icon: '📅', color: '#8b5cf6' },
    { label: 'This Week', value: weekly, icon: '📆', color: '#06b6d4' },
    { label: 'This Month', value: monthly, icon: '🗓️', color: '#f59e0b' },
    { label: 'This Year', value: yearly, icon: '📊', color: '#10b981' },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <div className="page-title">🧮 Spending Calculator</div>
          <div className="page-subtitle">Analyze your spending patterns over time</div>
        </div>
      </div>

      {/* Time-based spending */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {s.label}
            </div>
            <div style={{ fontFamily: 'Outfit', fontSize: '24px', fontWeight: 800, color: s.color }}>
              {formatCurrencyFull(Math.round(s.value))}
            </div>
          </div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📈</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
            Average Daily Spending
          </div>
          <div style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: 'var(--accent-purple-light)' }}>
            {formatCurrencyFull(Math.round(avgDaily))}
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔢</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
            Total Transactions
          </div>
          <div style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
            {expenses.length}
          </div>
        </div>

        {largest && (
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏆</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
              Largest Expense
            </div>
            <div style={{ fontFamily: 'Outfit', fontSize: '24px', fontWeight: 800, color: 'var(--accent-red)' }}>
              {formatCurrencyFull(largest.amount)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {largest.category} · {formatDate(largest.date)}
            </div>
          </div>
        )}
      </div>

      {/* Category breakdown chart */}
      <div className="grid-2">
        <div className="card">
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>Top Spending Categories</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Current month</div>
          {categorySpending.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={categorySpending.slice(0, 8)}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="category" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickLine={false} axisLine={false} width={90} />
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Spent']}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {categorySpending.slice(0, 8).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-text">No spending data for current month</div>
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', marginBottom: '20px' }}>Spending Summary</div>
          {categorySpending.map((cat, i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: cat.color }} />
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{cat.category}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.percentage}%</span>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>{formatCurrencyFull(cat.amount)}</span>
                </div>
              </div>
              <div className="progress-bar" style={{ height: '5px' }}>
                <div className="progress-fill" style={{ width: `${cat.percentage}%`, background: cat.color }} />
              </div>
            </div>
          ))}
          {categorySpending.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📈</div>
              <div className="empty-state-text">Add expenses to see breakdown</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpendingCalculator;
