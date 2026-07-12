import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import { formatCurrencyFull, formatDate } from '../utils/finance';
import { CATEGORY_COLORS } from '../utils/finance';
import type { Expense, ExpenseCategory, PaymentMethod } from '../types';
import ExpenseModal from '../components/ExpenseModal';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food', 'Rent', 'Shopping', 'Transportation', 'Bills',
  'Entertainment', 'Healthcare', 'Education', 'Travel',
  'EMI', 'Insurance', 'Investment', 'Others'
];

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'UPI', 'Digital Wallet', 'Other'];

const ExpensePage: React.FC = () => {
  const { expenses, deleteExpense } = useFinanceStore();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const filtered = expenses
    .filter(e => {
      const matchSearch = search === '' ||
        e.category.toLowerCase().includes(search.toLowerCase()) ||
        (e.notes || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === '' || e.category === filterCategory;
      const matchPay = filterPayment === '' || e.paymentMethod === filterPayment;
      return matchSearch && matchCat && matchPay;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const avgAmount = filtered.length > 0 ? total / filtered.length : 0;

  const PAYMENT_ICONS: Record<string, string> = {
    'Cash': '💵', 'Bank Transfer': '🏦', 'Credit Card': '💳',
    'Debit Card': '💳', 'UPI': '📱', 'Digital Wallet': '👛', 'Other': '•'
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <div className="page-title">💸 Expenses</div>
          <div className="page-subtitle">Manage and track all your expenses</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingExpense(null); setShowModal(true); }}>
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card expense">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Total Expenses</div>
          <div style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: 'var(--accent-red)' }}>
            {formatCurrencyFull(expenses.reduce((s, e) => s + e.amount, 0))}
          </div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Average Transaction</div>
          <div style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800 }}>
            {formatCurrencyFull(Math.round(avgAmount))}
          </div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Transactions</div>
          <div style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800 }}>
            {filtered.length}
          </div>
        </div>
      </div>

      {/* Category Quick Filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <button
          className={`chip ${filterCategory === '' ? 'active' : ''}`}
          onClick={() => setFilterCategory('')}
        >
          All
        </button>
        {EXPENSE_CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`chip ${filterCategory === cat ? 'active' : ''}`}
            onClick={() => setFilterCategory(cat === filterCategory ? '' : cat)}
            style={{ borderColor: filterCategory === cat ? CATEGORY_COLORS[cat] : undefined }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: CATEGORY_COLORS[cat], display: 'inline-block' }} />
            {cat}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrapper" style={{ flex: 1, minWidth: '200px' }}>
            <Search size={16} className="search-icon" />
            <input
              className="form-input search-input"
              placeholder="Search expenses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ width: '160px' }}
            value={filterPayment}
            onChange={e => setFilterPayment(e.target.value)}
          >
            <option value="">All Payment Methods</option>
            {PAYMENT_METHODS.map(p => <option key={p}>{p}</option>)}
          </select>
          {(search || filterCategory || filterPayment) && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterCategory(''); setFilterPayment(''); }}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Notes</th>
                <th>Recurring</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon">💸</div>
                      <div className="empty-state-title">No expense records</div>
                      <div className="empty-state-text">Add your first expense to get started</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(expense => (
                  <tr key={expense.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="category-dot" style={{ background: CATEGORY_COLORS[expense.category] }} />
                        <span className="badge badge-expense">{expense.category}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(expense.date)}</td>
                    <td>
                      <span style={{ fontSize: '13px' }}>
                        {PAYMENT_ICONS[expense.paymentMethod] || '•'} {expense.paymentMethod}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {expense.notes || '—'}
                    </td>
                    <td>
                      {expense.isRecurring ? (
                        <span className="badge badge-purple">🔄 {expense.recurrenceFrequency}</span>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>One-time</span>}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--accent-red)', fontSize: '15px' }}>
                        -{formatCurrencyFull(expense.amount)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          onClick={() => { setEditingExpense(expense); setShowModal(true); }}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon"
                          onClick={() => deleteExpense(expense.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ExpenseModal
          expense={editingExpense}
          onClose={() => { setShowModal(false); setEditingExpense(null); }}
        />
      )}
    </div>
  );
};

export default ExpensePage;
