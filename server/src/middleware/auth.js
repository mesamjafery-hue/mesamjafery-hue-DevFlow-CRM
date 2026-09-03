const { verifyAccessToken, verifyRefreshToken, generateAccessToken } = require('../utils/tokenUtils');
const { sendError, sendSuccess } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401);
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return sendError(res, 'Invalid or expired token', 401);
    }

    req.user = decoded;
    next();
  } catch (error) {
    sendError(res, 'Authentication failed', 401);
  }
};

const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

const refreshTokenMiddleware = (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', 400);
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return sendError(res, 'Invalid refresh token', 401);
    }

    const newAccessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
      roleId: decoded.roleId,
    });

    sendSuccess(res, { accessToken: newAccessToken, refreshToken }, 'Token refreshed', 200);
  } catch (error) {
    sendError(res, 'Token refresh failed', 401);
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  refreshTokenMiddleware,
};
