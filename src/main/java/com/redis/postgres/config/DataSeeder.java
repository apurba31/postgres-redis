package com.redis.postgres.config;

import com.redis.postgres.model.ProductEntity;
import com.redis.postgres.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class DataSeeder {

	private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

	private final ProductRepository productRepository;

	public DataSeeder(ProductRepository productRepository) {
		this.productRepository = productRepository;
	}

	@EventListener(ApplicationReadyEvent.class)
	public void seedIfEmpty() {
		if (productRepository.count() > 0) {
			return;
		}
		List<ProductEntity> entities = new ArrayList<>();

		entities.addAll(createCategory("Electronics", 15,
				"Smartphone", "Laptop", "Tablet", "Monitor", "Keyboard", "Mouse", "Headphones", "Speaker", "Camera", "Smartwatch", "Router", "SSD", "USB Hub", "Webcam", "Microphone"));
		entities.addAll(createCategory("Books", 10,
				"Novel", "Programming Guide", "Cookbook", "History", "Science", "Poetry", "Biography", "Art Book", "Travel Guide", "Children's Book"));
		entities.addAll(createCategory("Clothing", 10,
				"T-Shirt", "Jeans", "Jacket", "Dress", "Sweater", "Shorts", "Coat", "Hoodie", "Skirt", "Blouse"));
		entities.addAll(createCategory("Sports", 8,
				"Running Shoes", "Yoga Mat", "Dumbbells", "Resistance Bands", "Jump Rope", "Water Bottle", "Gym Bag", "Fitness Tracker"));
		entities.addAll(createCategory("Home", 7,
				"Lamp", "Throw Pillow", "Blanket", "Vase", "Picture Frame", "Desk Organizer", "Plant Pot"));

		productRepository.saveAll(entities);
		log.info("Seeded 50 products into Postgres");
	}

	private List<ProductEntity> createCategory(String category, int count, String... nameTemplates) {
		List<ProductEntity> list = new ArrayList<>();
		for (int i = 0; i < count; i++) {
			String name = nameTemplates[i % nameTemplates.length] + " " + (i + 1);
			BigDecimal price = BigDecimal.valueOf(9.99 + (990 * Math.random())).setScale(2, RoundingMode.HALF_UP);
			int stockCount = (int) (Math.random() * 201);
			ProductEntity e = new ProductEntity();
			e.setId(UUID.randomUUID().toString());
			e.setName(name);
			e.setPrice(price);
			e.setCategory(category);
			e.setStockCount(stockCount);
			e.setCreatedAt(LocalDateTime.now());
			e.setUpdatedAt(LocalDateTime.now());
			list.add(e);
		}
		return list;
	}
}
