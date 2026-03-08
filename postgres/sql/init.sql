-- Seed 1000 products for meaningful benchmark data
INSERT INTO products (id, name, price, category, stock_count, created_at)
SELECT
  gen_random_uuid(),
  'Product ' || i,
  (random() * 1000)::numeric(10,2),
  (ARRAY['Electronics','Books','Clothing','Sports','Home'])[ceil(random()*5)::int],
  (random() * 100)::int,
  NOW()
FROM generate_series(1, 1000) i;