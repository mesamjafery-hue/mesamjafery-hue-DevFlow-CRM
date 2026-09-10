import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';
import './AuthPages.css';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('password'); // 'password' | 'code'
  const [notice, setNotice] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('oauthError');

  const handleGoogleSignIn = () => {
    window.location.href = `${apiClient.defaults.baseURL}/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice('');
    try {
      const response = await login(email, mode === 'password' ? password : undefined);
      const data = response.data || {};
      if (data?.requiresTwoFactor) {
        const params = new URLSearchParams({ userId: data.userId, email: data.email });
        if (data.devCode) params.set('devCode', data.devCode);
        navigate(`/two-factor?${params.toString()}`);
      } else if (data?.accessToken) {
        navigate('/dashboard');
      } else {
        setNotice(response.message || 'If an account exists for this email, sign in or create an account.');
      }
    } catch {
      // Error is surfaced through the auth hook
    }
  };

  const sendCodeMode = mode === 'code';

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>DevFlow CRM</h1>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {oauthError && <div className="error-message">{oauthError}</div>}
        {notice && <div className="success-message">{notice}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="username"
              required
              disabled={loading}
            />
          </div>

          {sendCodeMode ? (
            <button type="submit" className="btn-primary" disabled={loading || !email}>
              {loading ? 'Sending code...' : 'Send verification code'}
            </button>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading || !email || !password}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </>
          )}
        </form>

        <div className="auth-links" style={{ textAlign: 'center' }}>
          <Link to="/forgot-password">Forgot password?</Link>
          <span> • </span>
          <Link to="/register">Create account</Link>
          <span> • </span>
          {sendCodeMode ? (
            <button type="button" className="link-button" onClick={() => setMode('password')}>
              Use password instead
            </button>
          ) : (
            <button type="button" className="link-button" onClick={() => setMode('code')}>
              Sign in with a code
            </button>
          )}
        </div>

        <div className="divider" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0', color: '#888' }}>
          <span style={{ flex: 1, height: '1px', background: '#ddd' }} /> or <span style={{ flex: 1, height: '1px', background: '#ddd' }} />
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={handleGoogleSignIn}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
