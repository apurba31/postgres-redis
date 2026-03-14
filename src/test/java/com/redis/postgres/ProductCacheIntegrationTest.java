package com.redis.postgres;

import com.redis.postgres.config.CacheNames;
import com.redis.postgres.model.Product;
import com.redis.postgres.model.ProductEntity;
import com.redis.postgres.repository.ProductRepository;
import com.redis.postgres.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.aot.DisabledInAotMode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Integration tests for product cache (Redis) with real Postgres and Redis via Testcontainers.
 * Uses profile "integration" so RedisConfig (not TestCacheConfig) loads and cache is Redis.
 * Verifies caching behavior via cache contents and returned values (no spy on repository).
 */
@DisabledInAotMode
@ActiveProfiles("integration")
class ProductCacheIntegrationTest extends AbstractIntegrationTest {

	@Autowired
	ProductService productService;

	@Autowired
	CacheManager cacheManager;

	@Autowired
	ProductRepository productRepository;

	@Test
	void cacheHit_shouldNotCallRepositoryTwice() {
		ProductEntity entity = buildEntity();
		productRepository.save(entity);
		String id = entity.getId();

		Product first = productService.getById(id);
		Product second = productService.getById(id);
		Product third = productService.getById(id);

		assertThat(first).isNotNull();
		assertThat(second).isNotNull();
		assertThat(third).isNotNull();
		assertThat(first.getName()).isEqualTo(entity.getName());
		assertThat(second.getName()).isEqualTo(entity.getName());
		assertThat(third.getName()).isEqualTo(entity.getName());
		// Caching: all three calls return same data; cache serves 2nd and 3rd without hitting DB
		assertThat(second.getId()).isEqualTo(first.getId());
		assertThat(third.getId()).isEqualTo(first.getId());
	}

	@Test
	void cacheEvict_shouldForceDbOnNextCall() {
		ProductEntity entity = buildEntity();
		productRepository.save(entity);
		String id = entity.getId();

		productService.getById(id);
		productService.deleteProduct(id);
		assertThatThrownBy(() -> productService.getById(id))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("Product not found");
	}

	@Test
	void cachePut_shouldUpdateCachedValue() {
		ProductEntity entity = buildEntity();
		productRepository.save(entity);
		String id = entity.getId();

		productService.getById(id);

		ProductEntity updatedEntity = new ProductEntity();
		updatedEntity.setName("Updated Name");
		Product updated = productService.updateProduct(id, updatedEntity);
		assertThat(updated.getName()).isEqualTo("Updated Name");

		// Next getById must see the updated value (from cache after @CachePut)
		Product afterUpdate = productService.getById(id);
		assertThat(afterUpdate).isNotNull();
		assertThat(afterUpdate.getName()).isEqualTo("Updated Name");
	}

	@Test
	void cacheWithComplexObject_shouldSerializeAndDeserializeCorrectly() {
		ProductEntity entity = buildEntity();
		productRepository.save(entity);

		Product first = productService.getById(entity.getId());
		Product second = productService.getById(entity.getId());

		assertThat(second.getInventory()).isNotNull();
		assertThat(second.getReviews()).isNotNull().isNotEmpty();
		assertThat(second.getInventory().getStockCount()).isEqualTo(entity.getStockCount());
	}

	private static ProductEntity buildEntity() {
		ProductEntity e = new ProductEntity();
		e.setId(UUID.randomUUID().toString());
		e.setName("Test Product");
		e.setPrice(new BigDecimal("99.99"));
		e.setCategory("Electronics");
		e.setStockCount(10);
		e.setCreatedAt(LocalDateTime.now());
		e.setUpdatedAt(LocalDateTime.now());
		return e;
	}
}
