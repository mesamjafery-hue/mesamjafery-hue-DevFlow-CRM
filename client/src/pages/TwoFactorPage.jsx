import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AuthPages.css';

export default function TwoFactorPage() {
  const [params] = useSearchParams();
  const userId = params.get('userId');
  const email = params.get('email') || '';
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState(params.get('devCode') || '');
  const [notice, setNotice] = useState('');
  const { verifyLoginCode, resendLoginCode, loading, error } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    try {
      await verifyLoginCode(userId, code);
      navigate('/dashboard');
    } catch {
      // Error is surfaced through the auth hook
    }
  };

  const handleResend = async () => {
    setNotice('');
    try {
      const response = await resendLoginCode(userId);
      const data = response.data || {};
      if (data.devCode) setDevCode(data.devCode);
      setNotice(data.message || 'A new verification code has been sent.');
    } catch {
      // Error is surfaced through the auth hook
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>DevFlow CRM</h1>
          <p>Verify your sign-in code</p>
        </div>

        {email && (
          <p style={{ textAlign: 'center', color: '#555', fontSize: '14px' }}>
            We sent a 6-digit code to <strong>{email}</strong>.
          </p>
        )}
        {error && <div className="error-message">{error}</div>}
        {notice && <div className="success-message">{notice}</div>}

        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label htmlFor="two-factor-code">Verification code</label>
            <input
              id="two-factor-code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="000000"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading || code.length !== 6}>
            {loading ? 'Verifying...' : 'Verify code'}
          </button>
        </form>

        {devCode && (
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#888' }}>
            Dev mode (SMTP not configured): your code is <code style={{ fontWeight: 'bold' }}>{devCode}</code>
          </p>
        )}

        <div className="auth-links" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button type="button" className="link-button" onClick={handleResend} disabled={loading}>
            Resend code
          </button>
          <Link to="/login">Cancel</Link>
        </div>
      </div>
    </div>
  );
}
