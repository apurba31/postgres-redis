package com.redis.postgres.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;

@Service
@Profile("!test")
public class ViewTrackingService {

	private static final String VIEWED_KEY_PREFIX = "viewed:";
	private static final int MAX_RECENT_VIEWS = 10;
	private static final Duration VIEWED_TTL = Duration.ofDays(7);

	private final RedisTemplate<String, Object> redisTemplate;

	public ViewTrackingService(RedisTemplate<String, Object> redisTemplate) {
		this.redisTemplate = redisTemplate;
	}

	public void recordView(String userId, String productId) {
		String key = VIEWED_KEY_PREFIX + userId;
		long score = System.currentTimeMillis();
		redisTemplate.opsForZSet().add(key, productId, score);
		redisTemplate.opsForZSet().removeRange(key, 0, -11);
		redisTemplate.expire(key, VIEWED_TTL);
	}

	public Set<Object> getRecentlyViewed(String userId) {
		String key = VIEWED_KEY_PREFIX + userId;
		Set<Object> result = redisTemplate.opsForZSet().reverseRange(key, 0, 9);
		return result != null ? result : Set.of();
	}

	public long getViewCount(String userId) {
		String key = VIEWED_KEY_PREFIX + userId;
		Long size = redisTemplate.opsForZSet().size(key);
		return size != null ? size : 0L;
	}
}
