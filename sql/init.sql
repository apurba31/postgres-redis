-- Create products table (must exist before INSERT; app uses JPA create-drop when it runs)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price NUMERIC(19, 2) NOT NULL,
  category VARCHAR(255),
  stock_count INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

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