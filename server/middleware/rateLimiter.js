const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many requests. Try again in 15 minutes.' } });
const reviewLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { success: false, message: '20 review limit per hour reached.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many auth attempts.' } });

module.exports = { globalLimiter, reviewLimiter, authLimiter };
