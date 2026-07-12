import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import { formatCurrencyFull, formatDate } from '../utils/finance';
import { CATEGORY_COLORS } from '../utils/finance';
import type { Income, IncomeCategory } from '../types';
import IncomeModal from '../components/IncomeModal';

const INCOME_CATEGORIES: IncomeCategory[] = ['Salary', 'Freelance', 'Business', 'Investments', 'Gift', 'Other'];

const IncomePage: React.FC = () => {
  const { incomes, deleteIncome } = useFinanceStore();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const filtered = incomes
    .filter(i => {
      const matchSearch = search === '' ||
        i.source.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase()) ||
        (i.notes || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === '' || i.category === filterCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const total = filtered.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <div className="page-title">💰 Income</div>
          <div className="page-subtitle">Track all your income sources</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingIncome(null); setShowModal(true); }}>
          <Plus size={16} /> Add Income
        </button>
      </div>

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card income">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Total Income</div>
          <div style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800, color: 'var(--accent-green)' }}>
            {formatCurrencyFull(incomes.reduce((s, i) => s + i.amount, 0))}
          </div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Filtered Total</div>
          <div style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800 }}>
            {formatCurrencyFull(total)}
          </div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Transactions</div>
          <div style={{ fontFamily: 'Outfit', fontSize: '28px', fontWeight: 800 }}>
            {filtered.length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrapper" style={{ flex: 1, minWidth: '200px' }}>
            <Search size={16} className="search-icon" />
            <input
              className="form-input search-input"
              placeholder="Search income..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ width: '160px' }}
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {INCOME_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          {(search || filterCategory) && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterCategory(''); }}>
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
                <th>Source</th>
                <th>Date</th>
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
                      <div className="empty-state-icon">💰</div>
                      <div className="empty-state-title">No income records</div>
                      <div className="empty-state-text">Add your first income to get started</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(income => (
                  <tr key={income.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="category-dot" style={{ background: CATEGORY_COLORS[income.category] }} />
                        <span className="badge badge-income">{income.category}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{income.source}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{formatDate(income.date)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {income.notes || '—'}
                    </td>
                    <td>
                      {income.isRecurring ? (
                        <span className="badge badge-purple">🔄 {income.recurrenceFrequency}</span>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>One-time</span>}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '15px' }}>
                        +{formatCurrencyFull(income.amount)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          onClick={() => { setEditingIncome(income); setShowModal(true); }}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon"
                          onClick={() => deleteIncome(income.id)}
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
        <IncomeModal
          income={editingIncome}
          onClose={() => { setShowModal(false); setEditingIncome(null); }}
        />
      )}
    </div>
  );
};

export default IncomePage;
