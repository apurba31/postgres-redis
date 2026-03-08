package com.redis.postgres;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Context load test using the "test" profile (H2 in-memory, no Redis).
 * Use this when Docker is not available. For full integration tests with
 * Postgres and Redis, run {@link PostgresApplicationTests} with Docker.
 */
@SpringBootTest
@ActiveProfiles("test")
class PostgresApplicationTestProfileTests {

	@Test
	void contextLoads() {
	}
}
