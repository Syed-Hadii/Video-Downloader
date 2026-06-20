// services/cache.js
const cache = new Map();

export const setCache = (key, value, ttlMs = 1000 * 60 * 30) => { // default 30 min
    const expires = Date.now() + ttlMs;
    cache.set(key, { value, expires });
};

export const getCache = (key) => {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
        cache.delete(key);
        return null;
    }
    return entry.value;
};

export const delCache = (key) => cache.delete(key);
