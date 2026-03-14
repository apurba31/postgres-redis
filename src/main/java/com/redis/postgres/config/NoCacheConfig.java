package com.redis.postgres.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.support.NoOpCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * When profile "no-cache" is active, provides a no-op cache manager so that
 * every @Cacheable call hits the underlying method (Postgres). Use this profile
 * to benchmark "without Redis" and compare with the default (with Redis).
 */
@Configuration
@EnableCaching
@Profile("no-cache")
public class NoCacheConfig {

	@Bean
	public CacheManager cacheManager() {
		return new NoOpCacheManager();
	}
}
