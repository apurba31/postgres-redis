# Running benchmarks: Redis vs no cache

This project compares **product read performance** with Redis caching vs hitting Postgres every time.

## Prerequisites

- **Docker** (Postgres + Redis are run via Docker)
- **Java 21** and **Gradle** (e.g. `./gradlew`)

## 1. Start infrastructure

From the project root:

```bash
docker compose up -d
```

Wait until Postgres and Redis are healthy. The app uses:

- Postgres: `localhost:5432` (DB: `redisdemo`, user: `app`)
- Redis: `localhost:6379` (password: `secret123`)

Optional: Redis Commander on http://localhost:8081, pgAdmin on http://localhost:5050.

## 2. Run benchmark **with Redis** (default)

1. Start the app **without** any cache-disabling profile:

   ```bash
   ./gradlew bootRun
   ```

   Or from your IDE: run `PostgresApplication` with no profile.

2. Call the benchmark endpoint (e.g. 100 or 500 iterations):

   ```bash
   curl "http://localhost:8080/api/benchmark/run?iterations=100"
   ```

   Or open in browser:  
   `http://localhost:8080/api/benchmark/run?iterations=100`

3. The JSON result includes:
   - **Cold DB**: `avgDbMs`, `p50DbMs`, `p99DbMs` — Postgres-only reads (cache evicted before each).
   - **Warm cache**: `avgRedisMs`, `p50RedisMs`, `p99RedisMs` — reads served from Redis.
   - **Speedup**: `speedupFactor`, `speedupLabel`, `conclusion` (e.g. “Redis served 100 reads in Xms total vs Postgres Yms — Nx faster at p99”).

So in one run you see **Postgres vs Redis** for the same workload.

## 3. Run benchmark **without Redis** (no cache)

1. Stop the app if it’s still running (Ctrl+C or stop from IDE).

2. Start the app with the **no-cache** profile (cache disabled; every read hits Postgres):

   ```bash
   ./gradlew bootRun --args='--spring.profiles.active=no-cache'
   ```

   Or in IDE: set VM/Program arguments or env:  
   `--spring.profiles.active=no-cache`

   No Redis connection is used; Redis can be stopped if you want.

3. Call the same endpoint:

   ```bash
   curl "http://localhost:8080/api/benchmark/run?iterations=100"
   ```

4. In this mode both “DB” and “Redis” phases hit Postgres (cache is no-op). So:
   - `avgDbMs` and `avgRedisMs` will be similar (both are DB times).
   - Use this run to see **total time and latency when every request hits the database** (no Redis).

## 4. Compare the two runs

| Run              | Profile    | What you get |
|------------------|-----------|--------------|
| With Redis       | default   | Cold Postgres times + warm Redis times + speedup in one response. |
| Without Redis    | `no-cache`| Same endpoint, but both phases hit Postgres; use for “no cache” baseline. |

Compare e.g.:

- **Total time** for the same `iterations`: with Redis (only first phase is DB-heavy) vs without Redis (both phases DB).
- **p99 latency**: from the “with Redis” run, compare `p99DbMs` vs `p99RedisMs` to see cache benefit.

Optional: check cache status (only when running **with** Redis):

```bash
curl http://localhost:8080/api/benchmark/cache-status
```

## 5. Iteration limit

The API caps `iterations` at **500** (e.g. `iterations=501` returns 400). Use 100–500 for a quick comparison.

## Summary

1. `docker compose up -d`
2. **With Redis**: `./gradlew bootRun` → `GET /api/benchmark/run?iterations=100` → inspect DB vs Redis metrics and speedup.
3. **Without Redis**: `./gradlew bootRun --args='--spring.profiles.active=no-cache'` → same URL → inspect DB-only baseline.
4. Compare the two runs to see the impact of Redis caching.
