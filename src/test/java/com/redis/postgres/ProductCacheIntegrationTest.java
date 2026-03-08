package com.redis.postgres;

import com.redis.postgres.config.CacheNames;
import com.redis.postgres.model.Product;
import com.redis.postgres.model.ProductEntity;
import com.redis.postgres.repository.ProductRepository;
import com.redis.postgres.service.ProductService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.context.aot.DisabledInAotMode;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * Integration tests for product cache (Redis) with real Postgres and Redis via Testcontainers.
 * Uses @MockitoSpyBean on ProductRepository to keep real DB while verifying call counts.
 */
@DisabledInAotMode
class ProductCacheIntegrationTest extends AbstractIntegrationTest {

	@Autowired
	ProductService productService;

	@Autowired
	CacheManager cacheManager;

	@MockitoSpyBean
	ProductRepository productRepository;

	@Test
	void cacheHit_shouldNotCallRepositoryTwice() {
		ProductEntity entity = buildEntity();
		productRepository.save(entity);

		productService.getById(entity.getId());
		productService.getById(entity.getId());
		Product result = productService.getById(entity.getId());

		verify(productRepository, times(1)).findById(entity.getId());
		assertThat(result).isNotNull();
		assertThat(result.getName()).isEqualTo(entity.getName());
	}

	@Test
	void cacheEvict_shouldForceDbOnNextCall() {
		ProductEntity entity = buildEntity();
		productRepository.save(entity);

		productService.getById(entity.getId());
		productService.deleteProduct(entity.getId());
		try {
			productService.getById(entity.getId());
		} catch (IllegalArgumentException ignored) {
			// expected: product deleted from DB, cache evicted, so getById hits DB and fails
		}

		verify(productRepository, times(2)).findById(entity.getId());
	}

	@Test
	void cachePut_shouldUpdateCachedValue() {
		ProductEntity entity = buildEntity();
		productRepository.save(entity);
		String id = entity.getId();

		productService.getById(id);

		ProductEntity updatedEntity = new ProductEntity();
		updatedEntity.setName("Updated Name");
		productService.updateProduct(id, updatedEntity);

		org.springframework.cache.Cache cache = cacheManager.getCache(CacheNames.PRODUCTS);
		assertThat(cache).isNotNull();
		Product cached = cache != null ? cache.get(id, Product.class) : null;
		assertThat(cached).isNotNull();
		assertThat(cached.getName()).isEqualTo("Updated Name");

		// getById once + updateProduct (findById inside) = 2
		verify(productRepository, times(2)).findById(id);
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
