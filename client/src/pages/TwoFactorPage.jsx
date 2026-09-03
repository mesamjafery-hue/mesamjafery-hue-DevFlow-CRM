import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AuthPages.css';

export default function TwoFactorPage() {
  const [params] = useSearchParams(); const [code, setCode] = useState(''); const { verifyLoginCode, loading, error } = useAuth(); const navigate = useNavigate();
  const submit = async (event) => { event.preventDefault(); try { await verifyLoginCode(params.get('userId'), code); navigate('/dashboard'); } catch { /* hook exposes the error */ } };
  return <div className="auth-container"><div className="auth-card"><div className="auth-header"><h1>DevFlow CRM</h1><p>Two-factor verification</p></div><form onSubmit={submit} className="auth-form"><div className="form-group"><label htmlFor="two-factor-code">Verification code</label><input id="two-factor-code" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={code} onChange={(event) => setCode(event.target.value)} required /></div>{error && <div className="error-message">{error}</div>}<button className="btn-primary" disabled={loading || code.length !== 6}>{loading ? 'Verifying...' : 'Verify code'}</button></form><div className="auth-links"><Link to="/login">Cancel</Link></div></div></div>;
}
