import { useDispatch, useSelector } from 'react-redux';
import { setUser, setTokens, setLoading, setError, logout } from '../store/slices/authSlice';
import authApi from '../api/authApi';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, accessToken, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const register = async (userData) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await authApi.register(userData);
      const { user, accessToken, refreshToken } = response.data;
      if (user) dispatch(setUser(user));
      if (accessToken && refreshToken) dispatch(setTokens({ accessToken, refreshToken }));
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      dispatch(setError(message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const login = async (email, password) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await authApi.login(email, password);
      const { user, accessToken, refreshToken } = response.data || {};
      if (user) dispatch(setUser(user));
      if (accessToken && refreshToken) dispatch(setTokens({ accessToken, refreshToken }));
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      dispatch(setError(message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const verifyEmail = async (token) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await authApi.verifyEmail(token);
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Email verification failed';
      dispatch(setError(message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const forgotPassword = async (email) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await authApi.forgotPassword(email);
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Password reset request failed';
      dispatch(setError(message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const resetPassword = async (token, newPassword) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await authApi.resetPassword(token, newPassword);
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Password reset failed';
      dispatch(setError(message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const verifyLoginCode = async (userId, code) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await authApi.verifyLoginCode(userId, code);
      const { user: verifiedUser, accessToken: verifiedAccessToken, refreshToken: verifiedRefreshToken } = response.data || {};
      dispatch(setUser(verifiedUser));
      dispatch(setTokens({ accessToken: verifiedAccessToken, refreshToken: verifiedRefreshToken }));
      return response;
    } catch (err) {
      dispatch(setError(err.response?.data?.message || 'Two-factor verification failed'));
      throw err;
    } finally { dispatch(setLoading(false)); }
  };

  const resendLoginCode = async (userId) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await authApi.resendLoginCode(userId);
      return response;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to resend verification code';
      dispatch(setError(message));
      throw err;
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword,
    logout: logoutUser,
    verifyLoginCode,
    resendLoginCode,
  };
};
