package com.redis.postgres.repository;

import com.redis.postgres.model.ProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<ProductEntity, String> {

	List<ProductEntity> findByCategory(String category);

	Page<ProductEntity> findByCategory(String category, Pageable pageable);

	@Query(value = "SELECT id FROM products ORDER BY created_at ASC LIMIT 1", nativeQuery = true)
	String findFirstId();

	@Query("SELECT p.id FROM ProductEntity p")
	List<String> findAllIds();
}
