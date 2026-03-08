package com.redis.postgres.service;

import com.redis.postgres.model.Product;
import com.redis.postgres.model.ProductEntity;
import com.redis.postgres.model.ProductInventory;
import com.redis.postgres.model.ProductReview;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class ProductMapper {

	private static final List<ProductReview> FAKE_REVIEWS = List.of(
			new ProductReview("Alice Smith", 5, "Excellent product, highly recommend!"),
			new ProductReview("Bob Jones", 4, "Good quality, fast shipping."),
			new ProductReview("Carol White", 5, "Exactly as described. Will buy again.")
	);

	public Product toProduct(ProductEntity entity) {
		if (entity == null) {
			return null;
		}
		ProductInventory inventory = new ProductInventory(entity.getStockCount() != null ? entity.getStockCount() : 0);
		return Product.builder()
				.id(entity.getId())
				.name(entity.getName())
				.price(entity.getPrice())
				.category(entity.getCategory())
				.stockCount(entity.getStockCount())
				.createdAt(entity.getCreatedAt())
				.updatedAt(entity.getUpdatedAt())
				.reviews(FAKE_REVIEWS)
				.inventory(inventory)
				.attributes(Map.of("source", "postgres", "cached", "false"))
				.build();
	}
}
