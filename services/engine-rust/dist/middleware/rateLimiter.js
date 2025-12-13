import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
export const rateLimiterMiddleware = (req, res, next) => {
    if (req.path === '/health') {
        return next();
    }
    const key = `${req.ip}:${req.path}`;
    const current = cache.get(key) || 0;
    if (current >= 100) {
        return res.status(429).json({ error: 'Too many requests' });
    }
    cache.set(key, current + 1);
    next();
};
