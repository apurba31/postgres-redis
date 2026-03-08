package com.redis.postgres.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product implements Serializable {

	private static final long serialVersionUID = 1L;

	private String id;
	private String name;
	private BigDecimal price;
	private String category;
	private Integer stockCount;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private List<String> tags;
	private Map<String, String> attributes;
	private List<ProductReview> reviews;
	private ProductInventory inventory;
}
