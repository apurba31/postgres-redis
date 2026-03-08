package com.redis.postgres.config;

public enum CacheNames {
	PRODUCTS_VALUE("products"),
	USERS("users"),
	ORDERS("orders");

	/** Use in @Cacheable(value = ...) etc. — must be compile-time constant */
	public static final String PRODUCTS = "products";

	private final String value;

	CacheNames(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}
}
