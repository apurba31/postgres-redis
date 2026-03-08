package com.redis.postgres.service;

import com.redis.postgres.config.CacheNames;
import com.redis.postgres.model.BenchmarkResult;
import com.redis.postgres.repository.ProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@Slf4j
@Profile("!test")
public class BenchmarkService {

	private final ProductService productService;
	private final CacheManager cacheManager;
	@SuppressWarnings("unused") // Injected per task; reserved for future benchmark variants
	private final ProductRepository productRepository;

	public BenchmarkService(ProductService productService, CacheManager cacheManager, ProductRepository productRepository) {
		this.productService = productService;
		this.cacheManager = cacheManager;
		this.productRepository = productRepository;
	}

	public BenchmarkResult runBenchmark(int iterations) {
		// STEP 1 — Get a stable product ID to test
		List<String> allIds = productService.getAllIds();
		if (allIds == null || allIds.isEmpty()) {
			throw new IllegalStateException("No product IDs available for benchmark");
		}
		String productId = allIds.getFirst();

		// STEP 2 — Evict that product from cache before DB benchmark
		var cache = cacheManager.getCache(CacheNames.PRODUCTS);
		if (cache != null) {
			cache.evict(productId);
		}

		// STEP 3 — Cold DB reads (iterations times); evict before EACH iteration
		long[] dbNanos = new long[iterations];
		for (int i = 0; i < iterations; i++) {
			if (cache != null) {
				cache.evict(productId);
			}
			long start = System.nanoTime();
			productService.getById(productId);
			dbNanos[i] = System.nanoTime() - start;
		}

		// STEP 4 — Warm cache with exactly 1 call
		if (cache != null) {
			cache.evict(productId);
		}
		productService.getById(productId);

		// STEP 5 — Warm Redis reads (iterations times); DO NOT evict between iterations
		long[] redisNanos = new long[iterations];
		for (int i = 0; i < iterations; i++) {
			long start = System.nanoTime();
			productService.getById(productId);
			redisNanos[i] = System.nanoTime() - start;
		}

		// STEP 6 — Compute statistics
		double avgDbMs = Arrays.stream(dbNanos).average().orElse(0) / 1_000_000.0;
		double avgRedisMs = Arrays.stream(redisNanos).average().orElse(0) / 1_000_000.0;
		double p50DbMs = toMs(percentileNanos(dbNanos, 50));
		double p50RedisMs = toMs(percentileNanos(redisNanos, 50));
		double p99DbMs = toMs(percentileNanos(dbNanos, 99));
		double p99RedisMs = toMs(percentileNanos(redisNanos, 99));

		long totalDbTimeMs = Arrays.stream(dbNanos).sum() / 1_000_000;
		long totalRedisTimeMs = Arrays.stream(redisNanos).sum() / 1_000_000;

		double speedupFactor = avgRedisMs > 0 ? avgDbMs / avgRedisMs : 0;
		String speedupLabel = String.format("%.1fx faster", speedupFactor);

		double p99Speedup = p99RedisMs > 0 ? p99DbMs / p99RedisMs : 0;
		String conclusion = String.format(
				"Redis served %d reads in %.1fms total vs Postgres %.1fms — %.1fx faster at p99",
				iterations, (double) totalRedisTimeMs, (double) totalDbTimeMs, p99Speedup);

		log.info(conclusion);

		return BenchmarkResult.builder()
				.iterations(iterations)
				.testedProductId(productId)
				.avgDbMs(round3(avgDbMs))
				.avgRedisMs(round3(avgRedisMs))
				.p50DbMs(round3(p50DbMs))
				.p50RedisMs(round3(p50RedisMs))
				.p99DbMs(round3(p99DbMs))
				.p99RedisMs(round3(p99RedisMs))
				.speedupFactor(round3(speedupFactor))
				.speedupLabel(speedupLabel)
				.totalDbTimeMs(totalDbTimeMs)
				.totalRedisTimeMs(totalRedisTimeMs)
				.conclusion(conclusion)
				.ranAt(LocalDateTime.now())
				.build();
	}

	private static double toMs(long nanos) {
		return Math.round(nanos / 1_000_000.0 * 1_000.0) / 1_000.0;
	}

	private static double round3(double value) {
		return Math.round(value * 1_000.0) / 1_000.0;
	}

	/**
	 * Returns the pct-th percentile value from the array (sorted copy), in nanoseconds.
	 */
	private static long percentileNanos(long[] arr, int pct) {
		long[] sorted = arr.clone();
		Arrays.sort(sorted);
		int n = sorted.length;
		int index = Math.min(Math.max((int) Math.ceil(pct / 100.0 * n) - 1, 0), n - 1);
		return sorted[index];
	}
}
