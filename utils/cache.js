/**
 * Simple In-Memory Cache for AutoOps Agents
 * Purpose: Avoid expensive LLM calls for identical repeated metrics.
 */

const cacheStore = new Map();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const Cache = {
    get: (key) => {
        const item = cacheStore.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            cacheStore.delete(key);
            return null;
        }
        return item.value;
    },

    set: (key, value, ttl = DEFAULT_TTL) => {
        cacheStore.set(key, {
            value,
            expiry: Date.now() + ttl
        });

        // Simple cleanup if cache gets too big
        if (cacheStore.size > 100) {
            const firstKey = cacheStore.keys().next().value;
            cacheStore.delete(firstKey);
        }
    },

    generateKey: (prefix, data) => {
        return `${prefix}_${JSON.stringify(data)}`;
    },

    clear: () => {
        cacheStore.clear();
    }
};
