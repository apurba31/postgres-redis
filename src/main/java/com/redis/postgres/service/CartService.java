package com.redis.postgres.service;

import com.redis.postgres.model.CartItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Collections;
import java.util.Map;

@Service
@Slf4j
@Profile("!test & !no-cache")
public class CartService {

	private static final String CART_KEY_PREFIX = "cart:";
	private static final Duration CART_TTL = Duration.ofHours(24);

	private final RedisTemplate<String, Object> redisTemplate;

	public CartService(RedisTemplate<String, Object> redisTemplate) {
		this.redisTemplate = redisTemplate;
	}

	public void addItem(String userId, CartItem item) {
		String key = CART_KEY_PREFIX + userId;
		redisTemplate.opsForHash().put(key, item.getProductId(), item);
		redisTemplate.expire(key, CART_TTL);
		log.info("Added {} x {} to cart:{}", item.getQuantity(), item.getProductName(), userId);
	}

	public void removeItem(String userId, String productId) {
		String key = CART_KEY_PREFIX + userId;
		redisTemplate.opsForHash().delete(key, productId);
		redisTemplate.expire(key, CART_TTL);
	}

	public Map<Object, Object> getCart(String userId) {
		String key = CART_KEY_PREFIX + userId;
		Map<Object, Object> entries = redisTemplate.opsForHash().entries(key);
		return entries != null ? entries : Collections.emptyMap();
	}

	public long getCartSize(String userId) {
		String key = CART_KEY_PREFIX + userId;
		Long size = redisTemplate.opsForHash().size(key);
		return size != null ? size : 0L;
	}

	public void clearCart(String userId) {
		redisTemplate.delete(CART_KEY_PREFIX + userId);
	}

	public BigDecimal getCartTotal(String userId) {
		Map<Object, Object> entries = getCart(userId);
		BigDecimal total = BigDecimal.ZERO;
		for (Object value : entries.values()) {
			if (value instanceof CartItem item) {
				total = total.add(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
			}
		}
		return total;
	}
}
