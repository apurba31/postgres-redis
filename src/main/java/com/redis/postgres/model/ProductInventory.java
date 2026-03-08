package com.redis.postgres.model;

import java.io.Serializable;

public class ProductInventory implements Serializable {

	private static final long serialVersionUID = 1L;

	private int stockCount;
	private boolean inStock;

	public ProductInventory() {
	}

	public ProductInventory(int stockCount) {
		this.stockCount = stockCount;
		this.inStock = stockCount > 0;
	}

	public int getStockCount() {
		return stockCount;
	}

	public void setStockCount(int stockCount) {
		this.stockCount = stockCount;
		this.inStock = stockCount > 0;
	}

	public boolean isInStock() {
		return inStock;
	}

	public void setInStock(boolean inStock) {
		this.inStock = inStock;
	}
}
