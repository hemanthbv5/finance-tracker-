import React from 'react';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import { generateInsights, getMonthlyIncome, getMonthlyExpense, getSavingsRate, formatCurrencyFull } from '../utils/finance';

const InsightsPage: React.FC = () => {
  const { incomes, expenses, budgets, notifications, markNotificationRead } = useFinanceStore();
  const insights = generateInsights(incomes, expenses, budgets);
  const monthlyIncome = getMonthlyIncome(incomes);
  const monthlyExpense = getMonthlyExpense(expenses);
  const savingsRate = getSavingsRate(monthlyIncome, monthlyExpense);
  const unread = notifications.filter(n => !n.read);

  const NOTIF_COLORS: Record<string, string> = {
    budget_exceeded: '#f59e0b',
    goal_achieved: '#10b981',
    bill_due: '#f43f5e',
    savings_milestone: '#8b5cf6',
    info: '#06b6d4',
  };

  const NOTIF_ICONS: Record<string, string> = {
    budget_exceeded: '⚠️',
    goal_achieved: '🎯',
    bill_due: '📅',
    savings_milestone: '🏆',
    info: 'ℹ️',
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <div className="page-title">💡 Insights & Alerts</div>
          <div className="page-subtitle">AI-powered financial analysis and recommendations</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Financial Health Score */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(6,182,212,0.08) 100%)',
          borderColor: 'rgba(139,92,246,0.2)'
        }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '18px', marginBottom: '16px' }}>
            🏥 Financial Health Score
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-glass)" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none"
                  stroke={savingsRate >= 30 ? '#10b981' : savingsRate >= 15 ? '#f59e0b' : '#f43f5e'}
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 40 * Math.min(savingsRate, 100) / 100} ${2 * Math.PI * 40}`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <text x="50" y="50" textAnchor="middle" dy="0.35em"
                  fill="var(--text-primary)" fontSize="18" fontWeight="800" fontFamily="Outfit">
                  {savingsRate}%
                </text>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Outfit',
                color: savingsRate >= 30 ? 'var(--accent-green)' : savingsRate >= 15 ? 'var(--accent-orange)' : 'var(--accent-red)'
              }}>
                {savingsRate >= 30 ? '🌟 Excellent' : savingsRate >= 15 ? '👍 Good' : '⚠️ Needs Work'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Savings rate: {savingsRate}%
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Monthly savings: {formatCurrencyFull(monthlyIncome - monthlyExpense)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Target: ≥ 20% savings rate
              </div>
            </div>
          </div>
        </div>

        {/* Unread Notifications */}
        <div className="card">
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '18px', marginBottom: '16px' }}>
            🔔 Active Alerts ({unread.length})
          </div>
          {unread.length === 0 ? (
            <div className="empty-state" style={{ padding: '16px' }}>
              <div className="empty-state-icon" style={{ fontSize: '32px' }}>✅</div>
              <div className="empty-state-text">All clear! No active alerts.</div>
            </div>
          ) : (
            unread.slice(0, 5).map(n => (
              <div
                key={n.id}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: `${NOTIF_COLORS[n.type]}15`,
                  border: `1px solid ${NOTIF_COLORS[n.type]}30`,
                  marginBottom: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => markNotificationRead(n.id)}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '18px' }}>{NOTIF_ICONS[n.type]}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Smart Insights */}
      <div className="card">
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '18px', marginBottom: '16px' }}>
          🧠 Smart Insights
        </div>
        {insights.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">Not enough data</div>
            <div className="empty-state-text">Add more transactions to unlock AI-powered insights</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {insights.map((insight, i) => (
              <div key={i} className="insight-card" style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
              }}>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '18px', marginBottom: '16px' }}>
          📚 Financial Tips
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {[
            { icon: '🏦', tip: '50-30-20 Rule', desc: 'Spend 50% on needs, 30% on wants, and save 20% of your income.' },
            { icon: '🎯', tip: 'Emergency Fund', desc: 'Build 3-6 months of expenses as an emergency fund before investing.' },
            { icon: '📈', tip: 'Compound Growth', desc: 'Start investing early — even small amounts grow significantly over time.' },
            { icon: '💳', tip: 'Debt Strategy', desc: 'Pay off high-interest debt first (avalanche method) to save money.' },
            { icon: '📊', tip: 'Track Everything', desc: 'Review your budget weekly to spot trends before they become problems.' },
            { icon: '🛡️', tip: 'Insurance First', desc: 'Adequate health and term life insurance protects your financial plan.' },
          ].map((tip, i) => (
            <div key={i} style={{
              background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)', padding: '16px',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{tip.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{tip.tip}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{tip.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
