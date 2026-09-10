const crypto = require('crypto');
const { TwoFactorChallenge, User } = require('../models');
const { sendLoginCodeEmail } = require('../utils/mailer');

// How long an emailed sign-in code stays valid.
const CODE_TTL_MS = 10 * 60 * 1000;
const CODE_LENGTH_PATTERN = /^\d{6}$/;

const hashCode = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

// Cryptographically strong 6-digit code (100000 - 999999).
const generateCode = () => String(crypto.randomInt(100000, 1000000));

/**
 * Create a fresh sign-in code for a user, invalidate any previous unused code,
 * and email it to the address the user signed up with.
 * @param {{ id: number, email: string, name?: string }} user
 * @returns {Promise<{ emailDelivered: boolean, emailError: string|null, code: string }>}
 */
const issueLoginCode = async (user) => {
  const code = generateCode();

  // Only one active challenge per user.
  await TwoFactorChallenge.destroy({ where: { userId: user.id, consumedAt: null } });
  await TwoFactorChallenge.create({
    userId: user.id,
    codeHash: hashCode(code),
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  });

  let emailDelivered = false;
  let emailError = null;
  try {
    await sendLoginCodeEmail(user.email, user.name, code);
    emailDelivered = true;
  } catch (error) {
    emailError = error.message;
    console.error(`Failed to send sign-in code to ${user.email}: ${error.message}`);
  }

  return { emailDelivered, emailError, code };
};

/**
 * Validate and consume a sign-in code, returning the authenticated user when valid.
 * @param {number|string} userId
 * @param {string} code
 * @returns {Promise<{ ok: true, user: object } | { ok: false, status: number, message: string }>}
 */
const consumeLoginCode = async (userId, code) => {
  if (!userId || !CODE_LENGTH_PATTERN.test(String(code || ''))) {
    return { ok: false, status: 400, message: 'A six-digit verification code is required' };
  }

  const challenge = await TwoFactorChallenge.findOne({
    where: { userId, consumedAt: null },
    order: [['createdAt', 'DESC']],
  });

  if (!challenge || challenge.expiresAt < new Date() || challenge.codeHash !== hashCode(code)) {
    return { ok: false, status: 401, message: 'Invalid or expired verification code' };
  }

  challenge.consumedAt = new Date();
  await challenge.save();

  const user = await User.findByPk(userId, { include: 'Role' });
  if (!user || user.status === 'suspended') {
    return { ok: false, status: 403, message: 'This account is unavailable' };
  }

  // Consuming the emailed code proves the user controls that inbox.
  if (!user.emailVerified) {
    user.emailVerified = true;
    await user.save();
  }

  return { ok: true, user };
};

module.exports = { issueLoginCode, consumeLoginCode, hashCode, generateCode, CODE_TTL_MS };
