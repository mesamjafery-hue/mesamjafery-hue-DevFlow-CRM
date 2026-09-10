import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setTokens, setUser } from '../store/slices/authSlice';

/**
 * Handles the redirect back from Google OAuth.
 * The server lands here with accessToken, refreshToken, name, and email in the query string.
 */
const OAuthCallbackPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const name = params.get('name') || '';
    const email = params.get('email') || '';

    if (accessToken && refreshToken) {
      dispatch(setTokens({ accessToken, refreshToken }));
      dispatch(setUser({ name, email, emailVerified: true }));
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login?oauthError=Google%20sign-in%20failed', { replace: true });
    }
  }, [dispatch, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>DevFlow CRM</h1>
          <p>Completing Google sign-in...</p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;