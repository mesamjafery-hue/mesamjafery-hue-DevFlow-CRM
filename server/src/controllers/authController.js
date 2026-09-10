const Joi = require('joi');
const { User, Role } = require('../models');
const config = require('../config');
const { sendSuccess, sendError, sendValidationError } = require('../utils/response');
const { sendPasswordResetEmail } = require('../utils/mailer');
const { issueLoginCode } = require('../services/loginVerificationService');
const { generateTokens } = require('../utils/tokenUtils');
const crypto = require('crypto');

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(100),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().optional().allow(''),
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const setNewPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().required().min(6),
});

// Register controller
const register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return sendValidationError(res, [{ field: 'input', message: error.details[0].message }]);
    }

    const { name, email, password } = value;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendError(res, 'Email already registered', 400);
    }

    // Assign a non-privileged default role server-side.
    // Never trust client-supplied role ids (prevents privilege escalation).
    const resolveDefaultRole = async () => {
      for (const roleName of ['Sales', 'Client']) {
        const found = await Role.findOne({ where: { name: roleName } });
        if (found) return found;
      }
      const roles = await Role.findAll({ order: [['id', 'ASC']] });
      return roles.find((r) => r.name !== 'Super Admin' && r.name !== 'Admin') || roles[0];
    };
    const role = await resolveDefaultRole();

    // Create the account inactive-verified state: ownership of the email has not
    // been proven yet, so we do not hand out tokens until the emailed code is used.
    const user = await User.create({
      name,
      email,
      passwordHash: password, // Password will be hashed by model hook
      roleId: role.id,
      status: 'active',
      emailVerified: false,
    });

    // Email a one-time sign-in code to the address the user just registered with.
    const codeResult = await issueLoginCode(user);

    const payload = { requiresTwoFactor: true, userId: user.id, email: user.email };
    if (!codeResult.emailDelivered && config.nodeEnv !== 'production') {
      // Dev/testing fallback: never lock yourself out while SMTP is not configured.
      payload.devCode = codeResult.code;
    }

    sendSuccess(
      res,
      payload,
      codeResult.emailDelivered
        ? `We emailed a 6-digit verification code to ${user.email}.`
        : 'Verification code generated.',
      201
    );
  } catch (error) {
    next(error);
  }
};
// Login controller
// Existing accounts sign in directly with their password. When no password is
// supplied, a one-time code is emailed to the address the user signed in with
// instead (passwordless sign-in).
const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return sendValidationError(res, [{ field: 'input', message: error.details[0].message }]);
    }

    const { email, password } = value;

    // Find user
    const user = await User.findOne({ where: { email: email.toLowerCase() }, include: Role });
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Check user status
    if (user.status !== 'active' && user.status !== 'inactive') {
      return sendError(res, 'User account is suspended', 403);
    }

    // Existing account: sign in directly with a password.
    if (password) {
      const isValidPassword = await user.verifyPassword(password);
      if (!isValidPassword) {
        return sendError(res, 'Invalid credentials', 401);
      }

      const tokens = generateTokens({ id: user.id, email: user.email, roleId: user.roleId });
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
          ...tokens,
        },
        'Login successful'
      );
    }

    // Passwordless path: email a one-time code to the account owner.
    const codeResult = await issueLoginCode(user);

    const payload = { requiresTwoFactor: true, userId: user.id, email: user.email };
    if (!codeResult.emailDelivered && config.nodeEnv !== 'production') {
      // Dev/testing fallback: never lock yourself out while SMTP is not configured.
      payload.devCode = codeResult.code;
    }

    sendSuccess(
      res,
      payload,
      codeResult.emailDelivered
        ? `We emailed a 6-digit verification code to ${user.email}.`
        : 'Verification code generated.',
      200
    );
  } catch (error) {
    next(error);
  }
};

// Verify email
const verifyEmail = async (req, res, next) => {
  try {
    const { error, value } = verifyEmailSchema.validate(req.body);
    if (error) {
      return sendValidationError(res, [{ field: 'token', message: 'Token is required' }]);
    }

    const { token } = value;

    const user = await User.findOne({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      return sendError(res, 'Invalid verification token', 400);
    }

    if (user.verificationTokenExpires < new Date()) {
      return sendError(res, 'Verification token has expired', 400);
    }

    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    user.status = 'active';
    await user.save();

    sendSuccess(res, { user: { id: user.id, email: user.email } }, 'Email verified successfully');
  } catch (error) {
    next(error);
  }
};

// Forgot password
const forgotPassword = async (req, res, next) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);
    if (error) {
      return sendValidationError(res, [{ field: 'email', message: 'Valid email is required' }]);
    }

    const { email } = value;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists - security best practice
      return sendSuccess(res, {}, 'If email exists, password reset link has been sent');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send password reset email to the user's actual email address
    try {
      await sendPasswordResetEmail(email, user.name, resetToken);
    } catch (emailError) {
      console.error(`Failed to send reset email to ${email}:`, emailError.message);
    }

    sendSuccess(res, {}, 'If email exists, password reset link has been sent');
  } catch (error) {
    next(error);
  }
};

// Reset password
const resetPassword = async (req, res, next) => {
  try {
    const { error, value } = setNewPasswordSchema.validate(req.body);
    if (error) {
      return sendValidationError(res, [{ field: 'input', message: error.details[0].message }]);
    }

    const { token, password } = value;

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!user) {
      return sendError(res, 'Invalid reset token', 400);
    }

    if (user.resetPasswordExpires < new Date()) {
      return sendError(res, 'Reset token has expired', 400);
    }

    user.passwordHash = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    sendSuccess(res, {}, 'Password reset successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
