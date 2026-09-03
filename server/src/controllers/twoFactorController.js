const crypto = require('crypto');
const { TwoFactorChallenge, User } = require('../models');
const { generateTokens } = require('../utils/tokenUtils');
const { sendSuccess, sendError } = require('../utils/response');

const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
exports.requestCode = async (req, res, next) => {
  try {
    const code = String(crypto.randomInt(100000, 1000000));
    await TwoFactorChallenge.destroy({ where: { userId: req.user.id, consumedAt: null } });
    await TwoFactorChallenge.create({ userId: req.user.id, codeHash: hash(code), expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
    console.log(`2FA code for ${req.user.email}: ${code}`);
    return sendSuccess(res, process.env.NODE_ENV === 'development' ? { code } : {}, 'Two-factor code issued');
  } catch (error) { return next(error); }
};
exports.verifyCode = async (req, res, next) => {
  try {
    if (!/^\d{6}$/.test(String(req.body.code || ''))) return sendError(res, 'A six-digit code is required', 400);
    const challenge = await TwoFactorChallenge.findOne({ where: { userId: req.user.id, consumedAt: null }, order: [['createdAt', 'DESC']] });
    if (!challenge || challenge.expiresAt < new Date() || challenge.codeHash !== hash(String(req.body.code))) return sendError(res, 'Invalid or expired two-factor code', 401);
    challenge.consumedAt = new Date(); await challenge.save();
    await User.update({ twoFactorEnabled: true }, { where: { id: req.user.id } });
    return sendSuccess(res, { enabled: true }, 'Two-factor authentication enabled');
  } catch (error) { return next(error); }
};

exports.verifyLoginCode = async (req, res, next) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !/^\d{6}$/.test(String(code || ''))) return sendError(res, 'userId and a six-digit code are required', 400);
    const challenge = await TwoFactorChallenge.findOne({ where: { userId, consumedAt: null }, order: [['createdAt', 'DESC']] });
    const codeHash = hash(String(code));
    if (!challenge || challenge.expiresAt < new Date() || challenge.codeHash !== codeHash) return sendError(res, 'Invalid or expired two-factor code', 401);
    const user = await User.findByPk(userId, { include: 'Role' });
    if (!user || user.status === 'suspended') return sendError(res, 'User account is unavailable', 403);
    challenge.consumedAt = new Date(); await challenge.save();
    return sendSuccess(res, { user: { id: user.id, name: user.name, email: user.email, status: user.status, emailVerified: user.emailVerified, role: user.Role?.name }, ...generateTokens({ id: user.id, email: user.email, roleId: user.roleId }) }, 'Login successful');
  } catch (error) { return next(error); }
};
