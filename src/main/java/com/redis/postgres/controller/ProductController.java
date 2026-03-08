package com.redis.postgres.controller;

import com.redis.postgres.model.Product;
import com.redis.postgres.model.ProductEntity;
import com.redis.postgres.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@Slf4j
@RequiredArgsConstructor
public class ProductController {

	private final ProductService productService;

	@GetMapping("/{id}")
	public Product getById(@PathVariable String id) {
		return productService.getById(id);
	}

	@GetMapping("/category/{category}")
	public Page<Product> getByCategory(
			@PathVariable String category,
			@RequestParam(defaultValue = "0") int page) {
		return productService.getByCategory(category, page);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public Product create(@RequestBody ProductEntity entity) {
		return productService.createProduct(entity);
	}

	@PutMapping("/{id}")
	public Product update(@PathVariable String id, @RequestBody ProductEntity updates) {
		return productService.updateProduct(id, updates);
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable String id) {
		productService.deleteProduct(id);
	}

	@GetMapping("/ids")
	public List<String> getAllIds() {
		return productService.getAllIds();
	}
}
