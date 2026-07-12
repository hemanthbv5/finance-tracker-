import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import { useFinanceStore } from '../store/financeStore';
import { getMonthlyTrend, getCategorySpending, formatCurrencyFull } from '../utils/finance';
import { CATEGORY_COLORS } from '../utils/finance';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding: '12px 16px', border: '1px solid var(--border-primary)' }}>
      <div style={{ fontWeight: 700, marginBottom: '6px', fontSize: '13px' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: '13px', color: p.color, display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '2px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          {p.name}: ₹{p.value?.toLocaleString('en-IN')}
        </div>
      ))}
    </div>
  );
};

const PieCustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding: '12px 16px', border: '1px solid var(--border-primary)' }}>
      <div style={{ fontWeight: 700, fontSize: '13px' }}>{payload[0].name}</div>
      <div style={{ fontSize: '13px', color: payload[0].payload.color }}>
        ₹{payload[0].value?.toLocaleString('en-IN')} ({payload[0].payload.percentage}%)
      </div>
    </div>
  );
};

const RANGE_OPTIONS = [
  { label: '3 months', value: 3 },
  { label: '6 months', value: 6 },
  { label: '12 months', value: 12 },
];

const Analytics: React.FC = () => {
  const { incomes, expenses } = useFinanceStore();
  const [range, setRange] = useState(6);

  const trend = getMonthlyTrend(incomes, expenses, range);
  const categorySpending = getCategorySpending(expenses);

  // Savings growth
  const savingsData = trend.map(d => ({
    month: d.month,
    savings: Math.max(0, d.savings),
    cumulative: 0,
  }));
  let cum = 0;
  savingsData.forEach(d => { cum += d.savings; d.cumulative = cum; });

  // Cash flow
  const cashFlow = trend.map(d => ({
    month: d.month,
    net: d.income - d.expense,
  }));

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <div className="page-title">📊 Analytics</div>
          <div className="page-subtitle">Deep dive into your financial data</div>
        </div>
        <div className="tabs" style={{ width: 'auto' }}>
          {RANGE_OPTIONS.map(r => (
            <button key={r.value} className={`tab ${range === r.value ? 'active' : ''}`}
              onClick={() => setRange(r.value)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Income vs Expense Bar */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>Income vs Expenses</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Monthly comparison</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '13px' }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="card">
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>Expense by Category</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>All time breakdown</div>
          {categorySpending.length > 0 ? (
            <div style={{ display: 'flex', gap: '16px' }}>
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={categorySpending} cx="50%" cy="50%" outerRadius={90} dataKey="amount"
                    paddingAngle={2}>
                    {categorySpending.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieCustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '220px' }}>
                {categorySpending.map((cat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: cat.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: '12px', color: 'var(--text-secondary)' }}>{cat.category}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{formatCurrencyFull(cat.amount)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', width: '28px', textAlign: 'right' }}>{cat.percentage}%</div>
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

      {/* Savings Growth + Cash Flow */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>Savings Growth</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Cumulative savings over time</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={savingsData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cumulative" name="Total Savings" stroke="#06b6d4" strokeWidth={2} fill="url(#savingsGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>Monthly Cash Flow</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Net income after expenses</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cashFlow} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="net" name="Net Cash Flow" radius={[4, 4, 0, 0]}>
                {cashFlow.map((entry, i) => (
                  <Cell key={i} fill={entry.net >= 0 ? '#8b5cf6' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend Line */}
      <div className="card">
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>Monthly Savings Trend</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>Income, expenses and net savings per month</div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '13px' }} />
            <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
            <Line type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2} dot={{ fill: '#f43f5e', strokeWidth: 2, r: 4 }} />
            <Line type="monotone" dataKey="savings" name="Savings" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
