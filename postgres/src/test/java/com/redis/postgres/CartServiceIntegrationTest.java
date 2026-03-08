package com.redis.postgres;

import com.redis.postgres.model.CartItem;
import com.redis.postgres.service.CartService;
import com.redis.postgres.service.ViewTrackingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.context.aot.DisabledInAotMode;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for CartService and ViewTrackingService with real Redis via Testcontainers.
 * Cleans up test keys in @BeforeEach for isolation.
 */
@DisabledInAotMode
class CartServiceIntegrationTest extends AbstractIntegrationTest {

	@Autowired
	CartService cartService;

	@Autowired
	ViewTrackingService viewTrackingService;

	@Autowired
	RedisTemplate<String, Object> redisTemplate;

	@BeforeEach
	void clearTestKeys() {
		Set<String> cartKeys = redisTemplate.keys("cart:user-test-*");
		if (cartKeys != null && !cartKeys.isEmpty()) {
			redisTemplate.delete(cartKeys);
		}
		Set<String> viewedKeys = redisTemplate.keys("viewed:viewer-*");
		if (viewedKeys != null && !viewedKeys.isEmpty()) {
			redisTemplate.delete(viewedKeys);
		}
	}

	@Test
	void addItem_shouldStoreInRedisHash() {
		CartItem cartItem = CartItem.builder()
				.productId("prod-1")
				.productName("Widget")
				.quantity(2)
				.unitPrice(new BigDecimal("19.99"))
				.build();

		cartService.addItem("user-test-1", cartItem);

		Map<Object, Object> entries = redisTemplate.opsForHash().entries("cart:user-test-1");
		assertThat(entries).isNotEmpty();
		assertThat(entries).containsKey("prod-1");
	}

	@Test
	void cartTotal_shouldSumAllItems() {
		cartService.addItem("user-test-2", CartItem.builder()
				.productId("p1")
				.productName("A")
				.quantity(1)
				.unitPrice(new BigDecimal("10.00"))
				.build());
		cartService.addItem("user-test-2", CartItem.builder()
				.productId("p2")
				.productName("B")
				.quantity(2)
				.unitPrice(new BigDecimal("5.00"))
				.build());
		cartService.addItem("user-test-2", CartItem.builder()
				.productId("p3")
				.productName("C")
				.quantity(1)
				.unitPrice(new BigDecimal("3.50"))
				.build());

		BigDecimal total = cartService.getCartTotal("user-test-2");

		// 10 + 2*5 + 3.50 = 23.50
		assertThat(total).isEqualByComparingTo(new BigDecimal("23.50"));
	}

	@Test
	void cartExpiry_shouldHaveTTL() {
		cartService.addItem("user-test-3", CartItem.builder()
				.productId("p1")
				.productName("Item")
				.quantity(1)
				.unitPrice(BigDecimal.ONE)
				.build());

		Long ttlHours = redisTemplate.getExpire("cart:user-test-3", TimeUnit.HOURS);

		assertThat(ttlHours).isNotNull();
		assertThat(ttlHours).isBetween(23L, 24L);
	}

	@Test
	void recentlyViewed_shouldKeepOnlyLast10() {
		for (int i = 0; i < 15; i++) {
			viewTrackingService.recordView("viewer-1", "product-" + i);
		}

		Set<Object> recent = viewTrackingService.getRecentlyViewed("viewer-1");

		assertThat(recent).hasSize(10);
	}
}
