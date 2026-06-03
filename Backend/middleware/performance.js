const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Compress all responses
const compressResponses = compression({
  level: 6, // Trade-off between compression level and CPU usage
  threshold: 10 * 1024, // Only compress responses that are larger than 10KB
});

// Secure HTTP headers
const secureHeaders = helmet({
  contentSecurityPolicy: false, // Disable if it conflicts with frontend CDN loads, configure explicitly otherwise
  crossOriginEmbedderPolicy: false, // Prevent cross-origin issues with images
});

// API Rate limiting to prevent brute force and DDoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

module.exports = {
  compressResponses,
  secureHeaders,
  apiLimiter,
};
