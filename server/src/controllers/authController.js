const Joi = require('joi');
const { User, Role, TwoFactorChallenge } = require('../models');
const { generateTokens } = require('../utils/tokenUtils');
const { sendSuccess, sendError, sendValidationError } = require('../utils/response');
const crypto = require('crypto');

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(100),
  roleId: Joi.number().optional().default(2), // Default to regular user role
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
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

    const { name, email, password, roleId } = value;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendError(res, 'Email already registered', 400);
    }

    // Get default role if not specified
    let role = await Role.findByPk(roleId);
    if (!role) {
      role = await Role.findOne({ where: { name: 'Client' } });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash: password, // Password will be hashed by model hook
      roleId: role.id,
      verificationToken,
      verificationTokenExpires,
    });

    // Generate tokens
    if (user.twoFactorEnabled) {
      const code = String(crypto.randomInt(100000, 1000000));
      await TwoFactorChallenge.destroy({ where: { userId: user.id, consumedAt: null } });
      await TwoFactorChallenge.create({ userId: user.id, codeHash: crypto.createHash('sha256').update(code).digest('hex'), expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
      console.log(`2FA login code for ${user.email}: ${code}`);
      return sendSuccess(res, { requiresTwoFactor: true, userId: user.id }, 'Two-factor verification required');
    }

    // Generate tokens
    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
    });

    // TODO: Send verification email with nodemailer
    console.log(`Verification token for ${email}: ${verificationToken}`);

    sendSuccess(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      ...tokens,
    }, 'Registration successful. Please verify your email.', 201);
  } catch (error) {
    next(error);
  }
};

// Login controller
const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return sendValidationError(res, [{ field: 'input', message: error.details[0].message }]);
    }

    const { email, password } = value;

    // Find user
    const user = await User.findOne({ where: { email }, include: Role });
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Check user status
    if (user.status !== 'active' && user.status !== 'inactive') {
      return sendError(res, 'User account is suspended', 403);
    }

    // Generate tokens
    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
    });

    sendSuccess(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        emailVerified: user.emailVerified,
        role: user.Role?.name,
      },
      ...tokens,
    }, 'Login successful');
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

    // TODO: Send reset email with nodemailer
    console.log(`Reset token for ${email}: ${resetToken}`);

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
