const { User } = require('../models');
const config = require('../config');
const { generateTokens } = require('../utils/tokenUtils');
const { sendSuccess, sendError } = require('../utils/response');
const { issueLoginCode, consumeLoginCode } = require('../services/loginVerificationService');

// Shape the response the client uses to move to the code-entry screen.
// In development, if the email could not be delivered, the code is returned so
// you are never locked out while SMTP is not configured.
const buildCodeResponse = ({ user, codeResult, statusCode = 200, message }) => {
  const payload = { requiresTwoFactor: true, userId: user.id, email: user.email };
  if (!codeResult.emailDelivered && config.nodeEnv !== 'production') {
    payload.devCode = codeResult.code;
  }
  return { payload, statusCode, message };
};

// Request a code to enable two-factor authentication on the signed-in account.
exports.requestCode = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return sendError(res, 'User not found', 404);

    const codeResult = await issueLoginCode(user);
    const { payload, statusCode, message } = buildCodeResponse({
      user,
      codeResult,
      statusCode: 200,
      message: codeResult.emailDelivered
        ? `We emailed a 6-digit code to ${user.email}.`
        : 'Verification code generated.',
    });

    return sendSuccess(res, payload, message, statusCode);
  } catch (error) {
    return next(error);
  }
};

// Verify the code to turn on two-factor authentication for the signed-in account.
exports.verifyCode = async (req, res, next) => {
  try {
    const result = await consumeLoginCode(req.user.id, req.body.code);
    if (!result.ok) return sendError(res, result.message, result.status);

    await User.update({ twoFactorEnabled: true }, { where: { id: req.user.id } });
    return sendSuccess(res, { enabled: true }, 'Two-factor authentication enabled');
  } catch (error) {
    return next(error);
  }
};

// Verify the emailed sign-in code (public - used right after login/register).
exports.verifyLoginCode = async (req, res, next) => {
  try {
    const { userId, code } = req.body;
    const result = await consumeLoginCode(userId, code);
    if (!result.ok) return sendError(res, result.message, result.status);

    const { user } = result;
    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          status: user.status,
          emailVerified: user.emailVerified,
          role: user.Role?.name,
        },
        ...generateTokens({ id: user.id, email: user.email, roleId: user.roleId }),
      },
      'Login successful'
    );
  } catch (error) {
    return next(error);
  }
};

// Re-send a sign-in code to an account that is mid-login (public, rate-limited).
exports.resendLoginCode = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return sendError(res, 'userId is required', 400);

    const user = await User.findByPk(userId);
    if (!user || user.status === 'suspended') {
      return sendError(res, 'This account is unavailable', 404);
    }

    const codeResult = await issueLoginCode(user);
    const { payload, statusCode, message } = buildCodeResponse({
      user,
      codeResult,
      statusCode: 200,
      message: codeResult.emailDelivered
        ? `We emailed a new 6-digit code to ${user.email}.`
        : 'Verification code generated.',
    });

    return sendSuccess(res, payload, message, statusCode);
  } catch (error) {
    return next(error);
  }
};
