package com.redis.postgres.controller;

import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/redis/inspect")
@Profile("!production & !test & !no-cache")
public class RedisInspectorController {

	private final RedisTemplate<String, Object> redisTemplate;

	public RedisInspectorController(RedisTemplate<String, Object> redisTemplate) {
		this.redisTemplate = redisTemplate;
	}

	@GetMapping("/keys")
	public List<String> getKeys(@RequestParam(defaultValue = "*") String pattern) {
		ScanOptions options = ScanOptions.scanOptions().match(pattern).build();
		return redisTemplate.execute((RedisCallback<List<String>>) connection -> {
			List<String> keys = new ArrayList<>();
			try (Cursor<byte[]> cursor = connection.scan(options)) {
				while (cursor.hasNext()) {
					keys.add(new String(cursor.next(), StandardCharsets.UTF_8));
				}
			}
			return keys;
		});
	}

	@GetMapping("/key/{key}/ttl")
	public Long getTtl(@PathVariable String key) {
		Long ttl = redisTemplate.getExpire(key, java.util.concurrent.TimeUnit.SECONDS);
		return ttl != null ? ttl : -1L;
	}

	@GetMapping("/key/{key}/type")
	public String getType(@PathVariable String key) {
		return redisTemplate.type(key).code();
	}

	@GetMapping("/key/{key}/value")
	public Object getValue(@PathVariable String key) {
		Object value = redisTemplate.opsForValue().get(key);
		if (value != null) {
			return value;
		}
		Map<Object, Object> hashEntries = redisTemplate.opsForHash().entries(key);
		if (hashEntries != null && !hashEntries.isEmpty()) {
			return hashEntries;
		}
		return null;
	}

	@DeleteMapping("/key/{key}")
	public Boolean deleteKey(@PathVariable String key) {
		Boolean result = redisTemplate.delete(key);
		return Boolean.TRUE.equals(result);
	}

	@GetMapping("/info")
	public Map<String, Object> getInfo() {
		return redisTemplate.execute((RedisCallback<Map<String, Object>>) connection -> {
			Properties info = connection.info();
			Map<String, Object> map = new HashMap<>();
			if (info != null) {
				String usedMemory = info.getProperty("used_memory");
				if (usedMemory != null) {
					map.put("used_memory", usedMemory);
				}
				String connectedClients = info.getProperty("connected_clients");
				if (connectedClients != null) {
					map.put("connected_clients", connectedClients);
				}
				String keyspace = info.getProperty("db0");
				if (keyspace != null) {
					int keysStart = keyspace.indexOf("keys=");
					if (keysStart >= 0) {
						int keysEnd = keyspace.indexOf(",", keysStart);
						String keysPart = keysEnd >= 0 ? keyspace.substring(keysStart + 5, keysEnd) : keyspace.substring(keysStart + 5);
						map.put("total_keys", keysPart.trim());
					}
				}
			}
			return map;
		});
	}
}
