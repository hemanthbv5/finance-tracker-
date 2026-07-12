import React, { useState, useMemo } from 'react';
import { Search, Download, Printer, Filter, ArrowUpDown } from 'lucide-react';
import { useFinanceStore } from '../store/financeStore';
import { formatCurrencyFull, formatDate } from '../utils/finance';
import { CATEGORY_COLORS } from '../utils/finance';

type SortField = 'date' | 'amount' | 'category';
type SortDir = 'asc' | 'desc';

const Transactions: React.FC = () => {
  const { incomes, expenses } = useFinanceStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const allTx = useMemo(() => [
    ...incomes.map(i => ({
      id: i.id, type: 'income' as const, amount: i.amount, date: i.date,
      category: i.category, notes: i.notes, paymentMethod: undefined,
      source: i.source,
    })),
    ...expenses.map(e => ({
      id: e.id, type: 'expense' as const, amount: e.amount, date: e.date,
      category: e.category, notes: e.notes, paymentMethod: e.paymentMethod,
      source: undefined,
    })),
  ], [incomes, expenses]);

  const filtered = useMemo(() => {
    let result = allTx.filter(tx => {
      const matchType = typeFilter === 'all' || tx.type === typeFilter;
      const matchSearch = search === '' ||
        tx.category.toLowerCase().includes(search.toLowerCase()) ||
        (tx.notes || '').toLowerCase().includes(search.toLowerCase()) ||
        (tx.source || '').toLowerCase().includes(search.toLowerCase()) ||
        (tx.paymentMethod || '').toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortField === 'amount') cmp = a.amount - b.amount;
      else if (sortField === 'category') cmp = a.category.localeCompare(b.category);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [allTx, search, typeFilter, sortField, sortDir]);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const exportCSV = () => {
    const headers = 'Type,Category,Amount,Date,Notes,Payment Method,Source\n';
    const rows = filtered.map(t =>
      `${t.type},${t.category},${t.amount},${t.date},"${t.notes || ''}","${t.paymentMethod || ''}","${t.source || ''}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  const handlePrint = () => window.print();

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <div className="page-title">📋 Transactions</div>
          <div className="page-subtitle">{filtered.length} transactions found</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={exportCSV}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid-3" style={{ marginBottom: '16px' }}>
        <div className="card" style={{ padding: '14px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Filtered Income</div>
          <div style={{ fontFamily: 'Outfit', fontSize: '20px', fontWeight: 800, color: 'var(--accent-green)', marginTop: '4px' }}>
            +{formatCurrencyFull(totalIncome)}
          </div>
        </div>
        <div className="card" style={{ padding: '14px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Filtered Expenses</div>
          <div style={{ fontFamily: 'Outfit', fontSize: '20px', fontWeight: 800, color: 'var(--accent-red)', marginTop: '4px' }}>
            -{formatCurrencyFull(totalExpense)}
          </div>
        </div>
        <div className="card" style={{ padding: '14px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Net</div>
          <div style={{
            fontFamily: 'Outfit', fontSize: '20px', fontWeight: 800, marginTop: '4px',
            color: totalIncome - totalExpense >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
          }}>
            {formatCurrencyFull(Math.abs(totalIncome - totalExpense))}
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
              placeholder="Search transactions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="tabs" style={{ width: 'auto' }}>
            {(['all', 'income', 'expense'] as const).map(t => (
              <button key={t} className={`tab ${typeFilter === t ? 'active' : ''}`}
                onClick={() => setTypeFilter(t)} style={{ textTransform: 'capitalize' }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th onClick={() => toggleSort('category')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Category <ArrowUpDown size={12} />
                  </span>
                </th>
                <th onClick={() => toggleSort('date')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Date <ArrowUpDown size={12} />
                  </span>
                </th>
                <th>Details</th>
                <th onClick={() => toggleSort('amount')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Amount <ArrowUpDown size={12} />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🔍</div>
                      <div className="empty-state-title">No transactions found</div>
                      <div className="empty-state-text">Try adjusting your search or filters</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(tx => (
                  <tr key={tx.id}>
                    <td>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px', fontSize: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: tx.type === 'income' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                      }}>
                        {tx.type === 'income' ? '💰' : '💸'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="category-dot" style={{ background: CATEGORY_COLORS[tx.category] || '#94a3b8' }} />
                        <span style={{ fontWeight: 600 }}>{tx.category}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{formatDate(tx.date)}</td>
                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {tx.source || tx.paymentMethod || '—'}
                      </div>
                      {tx.notes && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tx.notes}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 700, fontSize: '14px',
                        color: tx.type === 'income' ? 'var(--accent-green)' : 'var(--accent-red)'
                      }}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrencyFull(tx.amount)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
