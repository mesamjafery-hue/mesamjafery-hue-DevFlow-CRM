import apiClient from './apiClient';

export const authApi = {
  // Register a new user
  register: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // Sign in with email + password. Omit `password` to receive a one-time code by email instead.
  login: async (email, password) => {
    const body = { email };
    if (password) body.password = password;
    const response = await apiClient.post('/auth/login', body);
    return response.data;
  },

  // Verify email with token
  verifyEmail: async (token) => {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  // Request password reset
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', { token, password: newPassword });
    return response.data;
  },

  // Refresh access token
  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },
  verifyLoginCode: async (userId, code) => {
    const response = await apiClient.post('/auth/2fa/login-verify', { userId, code });
    return response.data;
  },
  resendLoginCode: async (userId) => {
    const response = await apiClient.post('/auth/login/resend-code', { userId });
    return response.data;
  },
};

export default authApi;
