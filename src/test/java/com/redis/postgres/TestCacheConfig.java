package com.redis.postgres;

import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Provides an in-memory CacheManager for the "test" profile so that
 * @Cacheable (e.g. in ProductService) has a bean without Redis.
 */
@Configuration
@Profile("test")
public class TestCacheConfig {

	@Bean
	public CacheManager cacheManager() {
		return new ConcurrentMapCacheManager();
	}
}
