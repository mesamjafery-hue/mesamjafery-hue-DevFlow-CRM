import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AuthPages.css';

function AuthShell({ title, children }) {
  return <div className="auth-container"><div className="auth-card"><div className="auth-header"><h1>DevFlow CRM</h1><p>{title}</p></div>{children}</div></div>;
}

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [message, setMessage] = useState('');
  const { verifyEmail, loading, error } = useAuth();
  const navigate = useNavigate();
  const submit = async (event) => {
    event.preventDefault();
    try { await verifyEmail(token); setMessage('Email verified successfully.'); setTimeout(() => navigate('/login'), 1200); } catch { /* error is displayed by the hook */ }
  };
  return <AuthShell title="Verify your email address"><form onSubmit={submit} className="auth-form"><div className="form-group"><label htmlFor="verification-token">Verification token</label><input id="verification-token" value={token} onChange={(event) => setToken(event.target.value)} required /></div>{error && <div className="error-message">{error}</div>}{message && <div className="success-message">{message}</div>}<button className="btn-primary" disabled={loading}>{loading ? 'Verifying...' : 'Verify email'}</button></form><div className="auth-links"><Link to="/login">Back to sign in</Link></div></AuthShell>;
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { forgotPassword, loading, error } = useAuth();
  const submit = async (event) => { event.preventDefault(); try { await forgotPassword(email); setMessage('If the email exists, reset instructions have been issued.'); } catch { /* error is displayed by the hook */ } };
  return <AuthShell title="Reset your password"><form onSubmit={submit} className="auth-form"><div className="form-group"><label htmlFor="reset-email">Email address</label><input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>{error && <div className="error-message">{error}</div>}{message && <div className="success-message">{message}</div>}<button className="btn-primary" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button></form><div className="auth-links"><Link to="/login">Back to sign in</Link></div></AuthShell>;
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const { resetPassword, loading, error } = useAuth();
  const navigate = useNavigate();
  const submit = async (event) => {
    event.preventDefault();
    if (password.length < 8 || password !== confirmPassword) return;
    try { await resetPassword(token, password); setMessage('Password updated.'); setTimeout(() => navigate('/login'), 1200); } catch { /* error is displayed by the hook */ }
  };
  return <AuthShell title="Choose a new password"><form onSubmit={submit} className="auth-form"><div className="form-group"><label htmlFor="reset-token">Reset token</label><input id="reset-token" value={token} onChange={(event) => setToken(event.target.value)} required /></div><div className="form-group"><label htmlFor="new-password">New password</label><input id="new-password" type="password" minLength="8" value={password} onChange={(event) => setPassword(event.target.value)} required /></div><div className="form-group"><label htmlFor="confirm-password">Confirm password</label><input id="confirm-password" type="password" minLength="8" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div>{password && password !== confirmPassword && <div className="error-message">Passwords do not match.</div>}{password && password.length < 8 && <div className="error-message">Password must contain at least 8 characters.</div>}{error && <div className="error-message">{error}</div>}{message && <div className="success-message">{message}</div>}<button className="btn-primary" disabled={loading || password.length < 8 || password !== confirmPassword}>{loading ? 'Updating...' : 'Update password'}</button></form><div className="auth-links"><Link to="/login">Back to sign in</Link></div></AuthShell>;
}
