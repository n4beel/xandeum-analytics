/**
 * Simple in-memory cache with TTL support
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class Cache {
    private store: Map<string, CacheEntry<any>> = new Map();

    /**
     * Set a value in the cache with TTL in milliseconds
     */
    set<T>(key: string, data: T, ttl: number = 15000): void {
        this.store.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    }

    /**
     * Get a value from the cache, returns null if expired or not found
     */
    get<T>(key: string): T | null {
        const entry = this.store.get(key);

        if (!entry) {
            return null;
        }

        const now = Date.now();
        const age = now - entry.timestamp;

        if (age > entry.ttl) {
            this.store.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Check if a key exists and is not expired
     */
    has(key: string): boolean {
        return this.get(key) !== null;
    }

    /**
     * Delete a specific key
     */
    delete(key: string): void {
        this.store.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.store.clear();
    }

    /**
     * Clean up expired entries
     */
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            const age = now - entry.timestamp;
            if (age > entry.ttl) {
                this.store.delete(key);
            }
        }
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.store.size,
            keys: Array.from(this.store.keys()),
        };
    }
}

// Singleton instance
export const cache = new Cache();

// Cleanup expired entries every minute
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        cache.cleanup();
    }, 60000);
}
