DROP TABLE IF EXISTS
  user_order_history,
  order_items,
  orders,
  product_variants,
  product_images,
  products,
  admins,
  users
CASCADE;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name VARCHAR,
    phone VARCHAR(20),
    address TEXT,
    credit_card_last4 CHAR(4),
    created_at TIMESTAMP DEFAULT now()
);

-- Table: admins
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- Table: products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 0,
    shoe_category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Table: product_images
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- table to track stock per size
CREATE TABLE product_variants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size       VARCHAR(20)    NOT NULL,
  stock_qty  INT NOT NULL DEFAULT 0,
  UNIQUE(product_id, size)
);

-- Table: orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- null allowed for guest
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    order_status VARCHAR NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: order_items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Table: user_order_history
CREATE TABLE user_order_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    order_id UUID NOT NULL,
    status VARCHAR NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

ALTER TABLE order_items
  ADD COLUMN variant_id UUID REFERENCES product_variants(id);

  BEGIN;

-- rename generic address to delivery_address
ALTER TABLE users
  RENAME COLUMN address TO delivery_address;

-- add separate billing_address column
ALTER TABLE users
  ADD COLUMN billing_address TEXT;

-- store encrypted CC number, expiration, and CVC
ALTER TABLE users
  ADD COLUMN encrypted_cc_number    TEXT,
  ADD COLUMN encrypted_cc_expiration TEXT,
  ADD COLUMN encrypted_cc_cvc       TEXT;

COMMIT;