package com.redis.postgres.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BenchmarkResult {

	private int iterations;
	private String testedProductId;
	private double avgDbMs;
	private double avgRedisMs;
	private double p50DbMs;
	private double p50RedisMs;
	private double p99DbMs;
	private double p99RedisMs;
	private double speedupFactor;
	private String speedupLabel;
	private long totalDbTimeMs;
	private long totalRedisTimeMs;
	private String conclusion;
	private LocalDateTime ranAt;
}
