import React, { useState, useEffect } from 'react';
import { Sun, Moon, User, Download, Upload, Trash2, Save, Key } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { updateProfile as apiUpdateProfile, changePassword } from '../api/auth';
import { useFinanceStore } from '../store/financeStore';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

interface SettingsProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

const SettingsPage: React.FC<SettingsProps> = ({ isDark, onToggleTheme }) => {
  const { user, updateUser } = useAuthStore();
  const { incomes, expenses, goals, budgets } = useFinanceStore();
  
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [monthlyIncome, setMonthlyIncome] = useState((user?.monthlyIncome || 0).toString());
  const [saved, setSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setCurrency(user.currency);
      setMonthlyIncome(user.monthlyIncome.toString());
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setProfileError('');
    try {
      const sel = CURRENCIES.find(c => c.code === currency);
      const updated = await apiUpdateProfile({
        name,
        currency,
        currencySymbol: sel?.symbol || '₹',
        monthlyIncome: parseFloat(monthlyIncome) || 0,
      });
      updateUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleSavePassword = async () => {
    setPwError('');
    if (newPassword.length < 6) return setPwError('New password must be at least 6 characters');
    try {
      await changePassword(currentPassword, newPassword);
      setPwSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPwSaved(false), 2000);
    } catch (err: any) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const exportData = () => {
    const data = { incomes, expenses, goals, budgets, profile: user, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importData = () => {
    alert('Import functionality is disabled in MongoDB mode to prevent overwriting cloud data.');
  };

  const clearData = () => {
    alert('Clear data functionality disabled. Please delete records individually.');
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <div className="page-title">⚙️ Settings</div>
          <div className="page-subtitle">Customize your FinTrack experience</div>
        </div>
      </div>

      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Profile */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <User size={18} style={{ color: 'var(--accent-purple-light)' }} />
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px' }}>Profile</div>
            </div>
            
            {profileError && <div className="form-error" style={{ marginBottom: '12px' }}>{profileError}</div>}
            
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" />
            </div>
            <div className="form-group">
              <label className="form-label">Email (Read Only)</label>
              <input className="form-input" value={user?.email || ''} readOnly style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select className="form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Income Target</label>
              <input
                className="form-input" type="number" value={monthlyIncome}
                onChange={e => setMonthlyIncome(e.target.value)}
                placeholder="Enter monthly income"
              />
            </div>
            <button className="btn btn-primary" onClick={handleSaveProfile} style={{ width: '100%' }}>
              <Save size={16} />
              {saved ? '✅ Saved!' : 'Save Profile'}
            </button>
          </div>

          {/* Change Password */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Key size={18} style={{ color: 'var(--accent-red)' }} />
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px' }}>Security</div>
            </div>
            
            {pwError && <div className="form-error" style={{ marginBottom: '12px' }}>{pwError}</div>}
            
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                className="form-input" type="password" value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                className="form-input" type="password" value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary" onClick={handleSavePassword} style={{ width: '100%' }}>
              {pwSaved ? '✅ Password Changed' : 'Update Password'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Appearance */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              {isDark ? <Moon size={18} style={{ color: 'var(--accent-purple-light)' }} /> : <Sun size={18} style={{ color: 'var(--accent-orange)' }} />}
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px' }}>Appearance</div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-glass)', marginBottom: '12px'
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Dark Mode</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
                </div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={isDark} onChange={onToggleTheme} />
                <div className="toggle-slider" />
              </label>
            </div>
          </div>

          {/* Data Management */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Download size={18} style={{ color: 'var(--accent-cyan)' }} />
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px' }}>Data Management</div>
            </div>

            <button className="btn btn-secondary" onClick={exportData} style={{ width: '100%', marginBottom: '10px', justifyContent: 'flex-start', gap: '12px' }}>
              <Download size={16} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600 }}>Export Data</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Download all your data as JSON</div>
              </div>
            </button>

            <button className="btn btn-secondary" onClick={importData} style={{ width: '100%', marginBottom: '10px', justifyContent: 'flex-start', gap: '12px', opacity: 0.6 }}>
              <Upload size={16} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600 }}>Import Data</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Disabled in MongoDB mode</div>
              </div>
            </button>
          </div>

          {/* About */}
          <div className="card">
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>
              💰 About FinTrack
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
              FinTrack is a modern personal finance tracker powered by MongoDB, Node.js, and React.
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['React', 'TypeScript', 'Tailwind CSS', 'MongoDB', 'Node.js'].map(t => (
                <span key={t} className="badge badge-purple">{t}</span>
              ))}
            </div>
            <div className="divider" />
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Version 3.0.0 · Full Stack Cloud Edition
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
