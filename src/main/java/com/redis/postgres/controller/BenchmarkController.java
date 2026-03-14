package com.redis.postgres.controller;

import com.redis.postgres.config.CacheNames;
import com.redis.postgres.model.BenchmarkResult;
import com.redis.postgres.service.BenchmarkService;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/benchmark")
@Profile("!test")
public class BenchmarkController {

	private static final int MAX_ITERATIONS = 500;

	private final BenchmarkService benchmarkService;
	private final CacheManager cacheManager;
	private final Optional<RedisTemplate<String, Object>> redisTemplate;

	public BenchmarkController(BenchmarkService benchmarkService, CacheManager cacheManager,
			Optional<RedisTemplate<String, Object>> redisTemplate) {
		this.benchmarkService = benchmarkService;
		this.cacheManager = cacheManager;
		this.redisTemplate = redisTemplate;
	}

	@GetMapping("/run")
	public ResponseEntity<?> runBenchmark(@RequestParam(defaultValue = "100") int iterations) {
		if (iterations > MAX_ITERATIONS) {
			return ResponseEntity.badRequest()
					.body(Map.of("error", "iterations must not exceed " + MAX_ITERATIONS));
		}
		BenchmarkResult result = benchmarkService.runBenchmark(iterations);
		return ResponseEntity.ok(result);
	}

	@GetMapping("/cache-status")
	public Map<String, Map<String, Object>> getCacheStatus() {
		Map<String, Map<String, Object>> status = new HashMap<>();
		boolean isRedis = cacheManager instanceof RedisCacheManager;

		for (CacheNames cacheNameEnum : CacheNames.values()) {
			String cacheName = cacheNameEnum.getValue();
			Map<String, Object> info = new HashMap<>();

			var cache = cacheManager.getCache(cacheName);
			info.put("exists", cache != null);

			if (isRedis && cache != null && redisTemplate.isPresent()) {
				RedisCacheManager rcm = (RedisCacheManager) cacheManager;
				Set<String> keys = redisTemplate.get().keys(cacheName + "::*");
				info.put("keyCount", keys != null ? keys.size() : 0);

				Duration ttl = getTtlForCache(rcm, cacheName);
				info.put("ttlSeconds", ttl != null ? ttl.toSeconds() : null);
				info.put("ttlDisplay", ttl != null ? formatDuration(ttl) : "default/eternal");
			} else {
				info.put("keyCount", null);
				info.put("ttlSeconds", null);
				info.put("ttlDisplay", null);
			}
			status.put(cacheName, info);
		}
		return status;
	}

	private Duration getTtlForCache(RedisCacheManager rcm, String cacheName) {
		Map<String, RedisCacheConfiguration> configs = rcm.getCacheConfigurations();
		if (configs == null) {
			return null;
		}
		RedisCacheConfiguration config = configs.get(cacheName);
		if (config == null) {
			return null;
		}
		try {
			var ttlFn = config.getTtlFunction();
			if (ttlFn != null) {
				return ttlFn.getTimeToLive("dummy", null);
			}
		} catch (Exception ignored) {
			// TtlFunction may throw for some key/value
		}
		return null;
	}

	private static String formatDuration(Duration d) {
		long seconds = d.getSeconds();
		if (seconds >= 3600) {
			return (seconds / 3600) + "h";
		}
		if (seconds >= 60) {
			return (seconds / 60) + "m";
		}
		return seconds + "s";
	}
}
