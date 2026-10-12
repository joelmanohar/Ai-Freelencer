package com.freelancehub.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RedisRateLimitService {
    private static final Logger logger = LoggerFactory.getLogger(RedisRateLimitService.class);

    private final StringRedisTemplate redisTemplate;

    public RedisRateLimitService(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // Fallback in-memory rate limiter if Redis is offline
    private final ConcurrentHashMap<String, RateTracker> inMemoryLimits = new ConcurrentHashMap<>();

    private static class RateTracker {
        AtomicInteger count = new AtomicInteger(0);
        long expiresAt;

        RateTracker(long ttlSeconds) {
            this.expiresAt = System.currentTimeMillis() + (ttlSeconds * 1000);
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiresAt;
        }
    }

    public boolean isAllowed(String key, int maxRequests, int windowSeconds) {
        if (redisTemplate != null) {
            try {
                String redisKey = "rate_limit:" + key;
                Long current = redisTemplate.opsForValue().increment(redisKey);
                if (current != null && current == 1) {
                    redisTemplate.expire(redisKey, windowSeconds, TimeUnit.SECONDS);
                }
                return current != null && current <= maxRequests;
            } catch (Exception e) {
                logger.warn("Redis unavailable, using local memory rate limiter: {}", e.getMessage());
            }
        }

        // In-memory fallback
        inMemoryLimits.compute(key, (k, tracker) -> {
            if (tracker == null || tracker.isExpired()) {
                RateTracker newTracker = new RateTracker(windowSeconds);
                newTracker.count.incrementAndGet();
                return newTracker;
            }
            tracker.count.incrementAndGet();
            return tracker;
        });

        RateTracker tracker = inMemoryLimits.get(key);
        return tracker != null && tracker.count.get() <= maxRequests;
    }
}
