package com.redis.postgres.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem implements Serializable {

	private static final long serialVersionUID = 1L;

	private String productId;
	private String productName;
	private int quantity;
	private BigDecimal unitPrice;
	private Map<String, String> options; // e.g. color, size
}
