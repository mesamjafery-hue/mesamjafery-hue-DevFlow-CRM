const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { User, Role } = require('../models');
const { register, login, verifyEmail, forgotPassword, resetPassword } = require('../controllers/authController');
const { generateTokens } = require('../utils/tokenUtils');
const { refreshTokenMiddleware } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');
const { authMiddleware } = require('../middleware/auth');
const { requestCode, verifyCode, verifyLoginCode, resendLoginCode } = require('../controllers/twoFactorController');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', rateLimit({ max: 10, message: 'Too many login attempts. Please try again later.' }), login);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', rateLimit({ max: 5, message: 'Too many password reset requests. Please try again later.' }), forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshTokenMiddleware);
router.post('/2fa/request', authMiddleware, requestCode);
router.post('/2fa/verify', authMiddleware, verifyCode);
router.post('/2fa/login-verify', rateLimit({ max: 10 }), verifyLoginCode);
router.post('/login/resend-code', rateLimit({ max: 5, message: 'Too many code requests. Please try again later.' }), resendLoginCode);

// ── Google OAuth 2.0 ─────────────────────────────────────────────
const isGoogleConfigured = () => !!(config.google.clientId && config.google.clientSecret);

// Step 1: Redirect the user to Google's consent screen
router.get('/google', (req, res) => {
  if (!isGoogleConfigured()) {
    return res.status(500).send('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server/.env');
  }

  // Signed, stateless CSRF state token (valid for 10 minutes)
  const state = jwt.sign({ purpose: 'google-oauth' }, config.jwt.accessSecret, { expiresIn: '10m' });

  const params = new URLSearchParams({
    client_id: config.google.clientId,
    redirect_uri: config.google.callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    state,
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// Step 2: Google redirects back here with an authorization code
router.get('/google/callback', async (req, res) => {
  const clientUrl = config.clientUrl;
  const fail = (message) => res.redirect(`${clientUrl}/login?oauthError=${encodeURIComponent(message)}`);

  try {
    const { code, state, error } = req.query;

    if (error) return fail(error);
    if (!state) return fail('Missing OAuth state');
    if (!code) return fail('No authorization code received');

    // Validate CSRF state token
    try {
      const decoded = jwt.verify(state, config.jwt.accessSecret);
      if (decoded.purpose !== 'google-oauth') return fail('Invalid OAuth state');
    } catch {
      return fail('OAuth state expired. Please try signing in again.');
    }

    // Exchange the authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        redirect_uri: config.google.callbackUrl,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      console.error('Google token exchange failed:', tokenData);
      return fail('Failed to authenticate with Google');
    }

    // Fetch the Google account profile
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileResponse.json();
    if (!profile.email) return fail('Could not read email from Google profile');

    // Find or create the local user (email is verified by Google itself)
    let user = await User.findOne({ where: { email: profile.email.toLowerCase() } });

    if (!user) {
      const role = (await Role.findOne({ where: { name: 'Client' } })) || (await Role.findByPk(2));
      if (!role) return fail('Default role not found. Please register manually.');

      // Random unguessable password — sign-in happens via Google, never by password
      user = await User.create({
        name: profile.name || profile.email.split('@')[0],
        email: profile.email.toLowerCase(),
        passwordHash: require('crypto').randomBytes(32).toString('hex'),
        roleId: role.id,
        emailVerified: true,
        status: 'active',
      });
    } else if (user.status !== 'suspended') {
      user.emailVerified = true;
      user.status = 'active';
      await user.save();
    }

    if (user.status === 'suspended') return fail('This account has been suspended');

    const tokens = generateTokens({ id: user.id, email: user.email, roleId: user.roleId });
    const params = new URLSearchParams({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      name: user.name || '',
      email: user.email,
    });

    res.redirect(`${clientUrl}/oauth/callback?${params.toString()}`);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    fail('Google sign-in failed. Please try again.');
  }
});

module.exports = router;
