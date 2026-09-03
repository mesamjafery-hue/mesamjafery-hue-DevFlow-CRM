const buckets = new Map();

const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 10, message = 'Too many requests. Please try again later.' } = {}) => {
  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const current = buckets.get(key);
    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (current.count >= max) {
      res.set('Retry-After', String(Math.ceil((current.resetAt - now) / 1000)));
      return res.status(429).json({ success: false, message, code: 'RATE_LIMITED' });
    }
    current.count += 1;
    return next();
  };
};

module.exports = rateLimit;
