# Caching Guide

## Overview

The Fact Checker app implements multi-tier caching to improve performance and reduce API costs:

1. **Backend Redis Cache** - Persistent, shared across instances
2. **Backend In-Memory Cache** - Fast fallback when Redis unavailable
3. **Frontend localStorage Cache** - Client-side caching for instant results

## Backend Caching

### Redis Cache (Optional)

Redis provides persistent caching that survives server restarts and is shared across multiple instances.

**Setup:**
1. Install Redis (or use Docker):
   ```bash
   docker run -d -p 6379:6379 redis:alpine
   ```

2. Enable Redis in `.env`:
   ```env
   REDIS_ENABLED=true
   REDIS_URL=redis://localhost:6379
   ```

**Features:**
- 7-day default TTL
- Automatic fallback to in-memory cache if Redis fails
- Shared across server instances

### In-Memory Cache (Always Active)

When Redis is disabled or unavailable, the backend automatically uses an in-memory cache.

**Features:**
- Fast access (no network overhead)
- Limited to 1000 entries (FIFO eviction)
- Automatic expiration cleanup every 5 minutes
- Lost on server restart

**Configuration:**
```env
REDIS_ENABLED=false  # Uses in-memory cache only
```

### Cache Statistics

View cache statistics via the health endpoint:
```bash
curl http://localhost:5000/health
```

Response includes:
```json
{
  "status": "ok",
  "cache": {
    "hits": 150,
    "misses": 50,
    "sets": 200,
    "redisHits": 100,
    "memoryHits": 50,
    "memoryCacheSize": 25,
    "redisEnabled": true
  }
}
```

## Frontend Caching

### localStorage Cache

The frontend caches completed claim results in the browser's localStorage.

**Features:**
- Instant results for previously checked claims
- 7-day expiration
- Automatic cleanup of expired entries
- Maximum 50 cached entries
- Survives page refreshes

**How it works:**
1. User submits a claim
2. Frontend checks cache first
3. If cached and completed → return instantly
4. Otherwise → make API call
5. Cache completed results automatically

**Cache Management:**

```typescript
import { 
  getCachedClaim, 
  setCachedClaim, 
  clearCache,
  getCacheStats 
} from '@/lib/cache';

// Get cached result
const cached = getCachedClaim<Claim>(claimText);

// Cache a result
setCachedClaim(claimText, claimResult);

// Clear all cache
clearCache();

// Get statistics
const stats = getCacheStats();
// { size: 1024, entries: 5 }
```

## Cache Keys

### Backend Cache Keys
- Format: `claim:{hash}`
- Hash is generated from normalized claim text (lowercase, trimmed)

### Frontend Cache Keys
- Format: `fact_checker_{hash}`
- Hash is generated from normalized claim text

## Cache Invalidation

### Automatic
- Entries expire after 7 days (configurable)
- Expired entries are cleaned up automatically
- Memory cache limits prevent unbounded growth

### Manual

**Backend:**
```typescript
import { deleteCache, clearCache } from './utils/cache';

// Delete specific entry
await deleteCache('claim:abc123');

// Clear all cache
await clearCache();
```

**Frontend:**
```typescript
import { removeCachedClaim, clearCache } from '@/lib/cache';

// Remove specific claim
removeCachedClaim(claimText);

// Clear all cache
clearCache();
```

## Performance Benefits

### Without Caching
- Every claim submission → AI API call (~2-5 seconds)
- API costs: $0.001-0.01 per request
- User waits for AI processing

### With Caching
- Cached claims → Instant response (<50ms)
- API costs: $0 per cached request
- Better user experience

### Example Impact
- 1000 unique claims checked
- 200 duplicate claims (20% repeat rate)
- **Savings:** 200 AI API calls = $0.20-2.00 saved
- **Performance:** 200 instant responses vs 200×3s waits = 10 minutes saved

## Configuration

### Backend Cache TTL

Default: 7 days (604800 seconds)

To change:
```typescript
await setCache(key, value, 86400); // 1 day
```

### Frontend Cache TTL

Default: 7 days

To change:
```typescript
setCachedClaim(claim, result, 86400 * 1000); // 1 day in ms
```

### Memory Cache Limits

**Backend:**
- Maximum 1000 entries
- Automatic FIFO eviction

**Frontend:**
- Maximum 50 entries
- Automatic cleanup of oldest entries

## Monitoring

### Backend Cache Stats
```bash
# Via health endpoint
curl http://localhost:5000/health | jq .cache

# Programmatically
import { getCacheStats } from './utils/cache';
const stats = getCacheStats();
```

### Frontend Cache Stats
```typescript
import { getCacheStats } from '@/lib/cache';
const stats = getCacheStats();
console.log(`Cache: ${stats.entries} entries, ${stats.size} bytes`);
```

## Best Practices

1. **Enable Redis in production** - Better performance and persistence
2. **Monitor cache hit rates** - Aim for >50% hit rate
3. **Adjust TTL based on use case** - Longer for stable content, shorter for dynamic
4. **Clear cache on major updates** - If AI model changes, clear cache
5. **Use cache for identical claims** - Normalize claim text before caching

## Troubleshooting

### Redis Connection Failed
- Check Redis is running: `docker ps | grep redis`
- Verify REDIS_URL is correct
- App automatically falls back to in-memory cache

### Frontend Cache Full
- Cache automatically cleans up oldest entries
- Maximum 50 entries prevents excessive storage
- Clear cache manually if needed: `clearCache()`

### Cache Not Working
- Check cache statistics to see hit/miss rates
- Verify cache keys are consistent
- Ensure TTL hasn't expired
- Check browser localStorage isn't disabled

## Example Usage

### Backend
```typescript
// Check cache before AI call
const cached = await getCache(`claim:${cacheKey}`);
if (cached) {
  return JSON.parse(cached); // Return cached result
}

// Generate AI response
const result = await generateSteelmanArgument(claim);

// Cache the result
await setCache(`claim:${cacheKey}`, JSON.stringify(result));
```

### Frontend
```typescript
// Check cache before API call
const cached = getCachedClaim<Claim>(claimText);
if (cached && cached.processingStatus === 'completed') {
  return cached; // Return instantly
}

// Make API call
const result = await createClaim({ claim: claimText });

// Cache completed results
if (result.processingStatus === 'completed') {
  setCachedClaim(claimText, result);
}
```
