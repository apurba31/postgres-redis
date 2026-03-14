package com.redis.postgres.controller;

import com.redis.postgres.model.CartItem;
import com.redis.postgres.service.CartService;
import com.redis.postgres.service.ViewTrackingService;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/cart/{userId}")
@Profile("!test & !no-cache")
public class CartController {

	private final CartService cartService;
	private final ViewTrackingService viewTrackingService;

	public CartController(CartService cartService, ViewTrackingService viewTrackingService) {
		this.cartService = cartService;
		this.viewTrackingService = viewTrackingService;
	}

	@PostMapping("/items")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void addItem(@PathVariable String userId, @RequestBody CartItem item) {
		cartService.addItem(userId, item);
	}

	@DeleteMapping("/items/{productId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void removeItem(@PathVariable String userId, @PathVariable String productId) {
		cartService.removeItem(userId, productId);
	}

	@GetMapping
	public Map<Object, Object> getCart(@PathVariable String userId) {
		return cartService.getCart(userId);
	}

	@GetMapping("/total")
	public BigDecimal getCartTotal(@PathVariable String userId) {
		return cartService.getCartTotal(userId);
	}

	@DeleteMapping
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void clearCart(@PathVariable String userId) {
		cartService.clearCart(userId);
	}

	@PostMapping("/view/{productId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void recordView(@PathVariable String userId, @PathVariable String productId) {
		viewTrackingService.recordView(userId, productId);
	}

	@GetMapping("/viewed")
	public Set<Object> getRecentlyViewed(@PathVariable String userId) {
		return viewTrackingService.getRecentlyViewed(userId);
	}
}
