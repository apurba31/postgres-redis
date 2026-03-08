package com.redis.postgres.service;

import com.redis.postgres.config.CacheNames;
import com.redis.postgres.model.Product;
import com.redis.postgres.model.ProductEntity;
import com.redis.postgres.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductService {

	private final ProductRepository productRepository;
	private final ProductMapper productMapper;

	@Cacheable(value = CacheNames.PRODUCTS, key = "#id", unless = "#result == null")
	public Product getById(String id) {
		log.info("DB HIT — loading product {} from Postgres", id);
		return productRepository.findById(id)
				.map(productMapper::toProduct)
				.orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
	}

	@Cacheable(value = CacheNames.PRODUCTS, key = "'cat:' + #category + ':p' + #page")
	public Page<Product> getByCategory(String category, int page) {
		Pageable pageable = PageRequest.of(page, 20);
		return productRepository.findByCategory(category, pageable)
				.map(productMapper::toProduct);
	}

	@CachePut(value = CacheNames.PRODUCTS, key = "#result.id")
	public Product createProduct(ProductEntity entity) {
		if (entity.getId() == null || entity.getId().isBlank()) {
			entity.setId(UUID.randomUUID().toString());
		}
		ProductEntity saved = productRepository.save(entity);
		return productMapper.toProduct(saved);
	}

	@CachePut(value = CacheNames.PRODUCTS, key = "#id")
	public Product updateProduct(String id, ProductEntity updates) {
		ProductEntity existing = productRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
		if (updates.getName() != null) existing.setName(updates.getName());
		if (updates.getPrice() != null) existing.setPrice(updates.getPrice());
		if (updates.getCategory() != null) existing.setCategory(updates.getCategory());
		if (updates.getStockCount() != null) existing.setStockCount(updates.getStockCount());
		existing.setUpdatedAt(java.time.LocalDateTime.now());
		ProductEntity saved = productRepository.save(existing);
		return productMapper.toProduct(saved);
	}

	@Caching(evict = {
			@CacheEvict(value = CacheNames.PRODUCTS, key = "#id"),
			@CacheEvict(value = CacheNames.PRODUCTS, allEntries = true)
	})
	public void deleteProduct(String id) {
		productRepository.deleteById(id);
		log.info("Evicting product {} from cache", id);
	}

	public List<String> getAllIds() {
		return productRepository.findAllIds();
	}
}
