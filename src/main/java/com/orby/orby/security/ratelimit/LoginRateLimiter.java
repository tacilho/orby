package com.orby.orby.security.ratelimit;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory rate limiter for login attempts.
 * Blocks an email after MAX_ATTEMPTS failed attempts within the WINDOW.
 * For production, replace with Redis/Bucket4j for distributed environments.
 */
@Component
public class LoginRateLimiter {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_SECONDS = 900; // 15 minutes

    private final ConcurrentHashMap<String, AttemptRecord> attempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String email) {
        String key = email.toLowerCase().trim();
        AttemptRecord record = attempts.get(key);
        if (record == null) return false;

        // If the window has expired, clear the record
        if (Instant.now().getEpochSecond() - record.windowStart > WINDOW_SECONDS) {
            attempts.remove(key);
            return false;
        }
        return record.count >= MAX_ATTEMPTS;
    }

    public void recordFailedAttempt(String email) {
        String key = email.toLowerCase().trim();
        attempts.compute(key, (k, record) -> {
            long now = Instant.now().getEpochSecond();
            if (record == null || (now - record.windowStart > WINDOW_SECONDS)) {
                return new AttemptRecord(1, now);
            }
            record.count++;
            return record;
        });
    }

    public void recordSuccess(String email) {
        attempts.remove(email.toLowerCase().trim());
    }

    public long getRemainingLockSeconds(String email) {
        String key = email.toLowerCase().trim();
        AttemptRecord record = attempts.get(key);
        if (record == null) return 0;
        long elapsed = Instant.now().getEpochSecond() - record.windowStart;
        long remaining = WINDOW_SECONDS - elapsed;
        return Math.max(0, remaining);
    }

    private static class AttemptRecord {
        int count;
        long windowStart;

        AttemptRecord(int count, long windowStart) {
            this.count = count;
            this.windowStart = windowStart;
        }
    }
}
