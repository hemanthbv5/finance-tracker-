import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank,
  ArrowUpRight, ArrowDownRight, Plus, Eye, Target
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useFinanceStore } from '../store/financeStore';
import { useAuthStore } from '../store/authStore';
import {
  formatCurrencyFull, formatCurrency, formatDate,
  getMonthlyIncome, getMonthlyExpense, getTotalIncome, getTotalExpense,
  getSavingsRate, getMonthlyTrend, getCategorySpending,
  getGoalProgress, getDaysRemaining, generateInsights
} from '../utils/finance';
import { CATEGORY_COLORS } from '../utils/finance';
import TransactionModal from '../components/TransactionModal';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding: '12px 16px', border: '1px solid var(--border-primary)' }}>
      <div style={{ fontWeight: 700, marginBottom: '6px', fontSize: '13px' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: '13px', color: p.color, display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          {p.name}: ₹{p.value?.toLocaleString('en-IN')}
        </div>
      ))}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { incomes, expenses, goals, budgets, profile } = useFinanceStore();
  const [showModal, setShowModal] = useState(false);

  const monthlyIncome = getMonthlyIncome(incomes);
  const monthlyExpense = getMonthlyExpense(expenses);
  const totalIncome = getTotalIncome(incomes);
  const totalExpense = getTotalExpense(expenses);
  const balance = totalIncome - totalExpense;
  const monthlySavings = monthlyIncome - monthlyExpense;
  const savingsRate = getSavingsRate(monthlyIncome, monthlyExpense);

  const trend = getMonthlyTrend(incomes, expenses, 6);
  const categorySpending = getCategorySpending(expenses);
  const insights = generateInsights(incomes, expenses, budgets);

  // Recent transactions (last 8)
  const allTx = [
    ...incomes.map(i => ({ ...i, type: 'income' as const })),
    ...expenses.map(e => ({ ...e, type: 'expense' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  const topGoals = goals.slice(0, 3);

  return (
    <div className="animate-fadeIn">
      {/* Welcome Banner */}
      <div className="card" style={{
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(59,130,246,0.1) 50%, rgba(6,182,212,0.08) 100%)',
        borderColor: 'rgba(139,92,246,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {useAuthStore(s => s.user?.name) || profile.name}! 👋
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Here's your financial overview for today.
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card balance">
          <div className="stat-icon balance"><Wallet size={22} /></div>
          <div className="stat-label">Current Balance</div>
          <div className="stat-value" style={{ color: balance >= 0 ? 'var(--accent-purple-light)' : 'var(--accent-red)' }}>
            {formatCurrency(balance)}
          </div>
          <div className="stat-change positive">
            <Eye size={12} /> {formatCurrencyFull(balance)} total
          </div>
        </div>

        <div className="stat-card income">
          <div className="stat-icon income"><TrendingUp size={22} /></div>
          <div className="stat-label">Monthly Income</div>
          <div className="stat-value">{formatCurrency(monthlyIncome)}</div>
          <div className="stat-change positive">
            <ArrowUpRight size={12} /> {formatCurrencyFull(monthlyIncome)} this month
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-icon expense"><TrendingDown size={22} /></div>
          <div className="stat-label">Monthly Expenses</div>
          <div className="stat-value">{formatCurrency(monthlyExpense)}</div>
          <div className="stat-change negative">
            <ArrowDownRight size={12} /> {formatCurrencyFull(monthlyExpense)} this month
          </div>
        </div>

        <div className="stat-card savings">
          <div className="stat-icon savings"><PiggyBank size={22} /></div>
          <div className="stat-label">Monthly Savings</div>
          <div className="stat-value" style={{ color: monthlySavings >= 0 ? 'var(--accent-cyan)' : 'var(--accent-red)' }}>
            {formatCurrency(Math.abs(monthlySavings))}
          </div>
          <div className={`stat-change ${monthlySavings >= 0 ? 'positive' : 'negative'}`}>
            <Target size={12} /> {savingsRate}% savings rate
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Income vs Expense Trend */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px' }}>Income vs Expenses</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last 6 months trend</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2} fill="url(#expenseGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="card">
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px' }}>Spending by Category</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Current month breakdown</div>
          </div>
          {categorySpending.length > 0 ? (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={categorySpending.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {categorySpending.slice(0, 6).map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {categorySpending.slice(0, 6).map((cat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div className="category-dot" style={{ background: cat.color }} />
                    <div style={{ flex: 1, fontSize: '12px', color: 'var(--text-secondary)' }}>{cat.category}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>
                      {formatCurrency(cat.amount)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', width: '32px', textAlign: 'right' }}>
                      {cat.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-text">No expense data yet</div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Transactions + Goals + Insights */}
      <div className="grid-3">

        {/* Recent Transactions */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px' }}>Recent Transactions</div>
            <a href="/transactions" style={{ fontSize: '12px', color: 'var(--accent-purple-light)', textDecoration: 'none' }}>
              View all
            </a>
          </div>
          {allTx.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💳</div>
              <div className="empty-state-text">No transactions yet</div>
            </div>
          ) : (
            allTx.map((tx) => (
              <div key={tx.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 0', borderBottom: '1px solid var(--border-glass)'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: tx.type === 'income' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
                }}>
                  {tx.type === 'income' ? '💰' : '💸'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tx.category}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDate(tx.date)}</div>
                </div>
                <div style={{
                  fontSize: '14px', fontWeight: 700,
                  color: tx.type === 'income' ? 'var(--accent-green)' : 'var(--accent-red)'
                }}>
                  {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Savings Goals */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px' }}>Savings Goals</div>
            <a href="/goals" style={{ fontSize: '12px', color: 'var(--accent-purple-light)', textDecoration: 'none' }}>
              View all
            </a>
          </div>
          {topGoals.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎯</div>
              <div className="empty-state-text">No goals set yet</div>
            </div>
          ) : (
            topGoals.map((goal) => {
              const progress = getGoalProgress(goal.currentAmount, goal.targetAmount);
              const daysLeft = getDaysRemaining(goal.deadline);
              return (
                <div key={goal.id} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{goal.icon || '🎯'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{goal.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {daysLeft} days left
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{progress}%</div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${progress}%`,
                        background: goal.color || 'var(--accent-purple)',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>₹{goal.currentAmount.toLocaleString('en-IN')}</span>
                    <span>₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Smart Insights */}
        <div className="card">
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>
            💡 Smart Insights
          </div>
          {insights.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-text">Add more transactions to get insights</div>
            </div>
          ) : (
            insights.map((insight, i) => (
              <div key={i} className="insight-card" style={{ marginBottom: '8px' }}>
                {insight}
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && <TransactionModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Dashboard;
