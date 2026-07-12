import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff, TrendingUp, Shield, Target } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login, register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (mode === 'register' && !name.trim()) {
      return setLocalError('Please enter your name');
    }
    if (!email.trim()) return setLocalError('Please enter your email');
    if (password.length < 6) return setLocalError('Password must be at least 6 characters');

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch {
      // error is shown from store
    }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    setLocalError('');
    clearError();
  };

  const displayError = localError || error;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '-200px', left: '-200px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-200px', right: '-200px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>

        {/* Left — Branding Panel */}
        <div style={{
          background: 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 50%, #0f172a 100%)',
          padding: '48px 40px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                boxShadow: '0 4px 20px rgba(139,92,246,0.5)',
              }}>💰</div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontSize: '22px', fontWeight: 800, color: 'white' }}>FinTrack</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Personal Finance</div>
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h1 style={{ fontFamily: 'Outfit', fontSize: '32px', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '16px' }}>
                Take control of your finances
              </h1>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                Track income, manage expenses, set savings goals and gain smart insights — all in one beautiful app.
              </p>
            </div>

            {[
              { icon: TrendingUp, color: '#10b981', text: 'Real-time income & expense tracking' },
              { icon: Target, color: '#8b5cf6', text: 'Savings goals with progress tracking' },
              { icon: Shield, color: '#06b6d4', text: 'Secure MongoDB cloud storage' },
            ].map(({ icon: Icon, color, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>{text}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
            © 2026 FinTrack · Your data is stored securely in MongoDB
          </div>
        </div>

        {/* Right — Auth Form */}
        <div style={{ background: 'var(--bg-card)', padding: '48px 40px' }}>
          {/* Tab Switch */}
          <div className="tabs" style={{ marginBottom: '32px' }}>
            <button className={`tab ${mode === 'login' ? 'active' : ''}`} onClick={() => mode !== 'login' && switchMode()}>
              Sign In
            </button>
            <button className={`tab ${mode === 'register' ? 'active' : ''}`} onClick={() => mode !== 'register' && switchMode()}>
              Create Account
            </button>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontFamily: 'Outfit', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {mode === 'login' ? 'Welcome back! 👋' : 'Get started today 🚀'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {mode === 'login' ? 'Sign in to your FinTrack account' : 'Create your free account in seconds'}
            </div>
          </div>

          {displayError && (
            <div style={{
              padding: '12px 16px', borderRadius: 'var(--radius-md)',
              background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)',
              color: 'var(--accent-red)', fontSize: '14px', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              ⚠️ {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Hemanth"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus={mode === 'login'}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Min. 6 characters' : 'Enter your password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'login' ? '🔐 Sign In' : '🚀 Create Account'
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={switchMode}
              style={{ color: 'var(--accent-purple-light)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
