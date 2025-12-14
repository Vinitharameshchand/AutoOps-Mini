import { Cache } from '../../utils/cache.js';
import { config } from '../../config.js';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // In a real app, internal cache clearing might be different, 
        // but for our simple in-memory cache, we can just expose a method
        // We need to modify utils/cache.js to expose a clear method first

        // For now, since it's in-memory module state, we might need to reload or just rely on a new method
        // Let's assume we'll update cache.js to have a clear() method.

        Cache.clear();
        if (config.system.debug) console.log('🧹 Cache cleared manually');
        res.status(200).json({ message: 'Cache cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
