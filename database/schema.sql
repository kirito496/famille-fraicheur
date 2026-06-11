-- ============================================================
-- Famille & Fraîcheur – Schéma de base de données (PostgreSQL)
-- ============================================================

-- Extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Table : utilisateurs (clients, livreurs, administrateurs)
-- ============================================================
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    phone         VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL CHECK (role IN ('admin','delivery','customer')),
    whatsapp      VARCHAR(20),
    rating_avg    DECIMAL(2,1) DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
    total_ratings INTEGER DEFAULT 0,
    is_active     BOOLEAN DEFAULT TRUE,
    reset_token   VARCHAR(255),
    reset_token_expires TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table : adresses de livraison (propres à chaque client)
-- ============================================================
CREATE TABLE addresses (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label      VARCHAR(100) NOT NULL,       -- ex: "Domicile", "Bureau"
    full_address TEXT NOT NULL,
    city       VARCHAR(80) NOT NULL DEFAULT 'Cotonou',
    district   VARCHAR(80),                 -- quartier
    lat        DECIMAL(10,7),
    lng        DECIMAL(10,7),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table : catégories de produits
-- ============================================================
CREATE TABLE categories (
    id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name  VARCHAR(80) UNIQUE NOT NULL,
    icon  VARCHAR(10) DEFAULT '📦'
);

-- ============================================================
-- Table : produits (avec stock et péremption)
-- ============================================================
CREATE TABLE products (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
    name          VARCHAR(150) NOT NULL,
    description   TEXT,
    price         DECIMAL(10,2) NOT NULL CHECK (price > 0),
    stock         INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    expiration    DATE,
    image_url     VARCHAR(255),
    is_available  BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table : commandes
-- ============================================================
CREATE TABLE orders (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id       UUID NOT NULL REFERENCES users(id),
    delivery_person_id UUID REFERENCES users(id),
    address_id        UUID NOT NULL REFERENCES addresses(id),
    status            VARCHAR(30) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','confirmed','assigned','in_progress','delivered','cancelled','returned')),
    payment_method    VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash','mobile_money')),
    payment_phone     VARCHAR(20),              -- numéro mobile money si applicable
    delivery_slot     TSTZRANGE NOT NULL,       -- plage horaire de livraison (ex: '[2025-04-01 10:00, 2025-04-01 12:00)')
    total_amount      DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
    delivery_fee      DECIMAL(10,2) DEFAULT 0,
    rating            INTEGER CHECK (rating >= 1 AND rating <= 5),
    rating_comment    TEXT,
    problem_reported  BOOLEAN DEFAULT FALSE,
    problem_details   TEXT,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table : lignes de commande (produits commandés)
-- ============================================================
CREATE TABLE order_items (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity   INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal   DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- ============================================================
-- Table : messages (chat unifié)
-- ============================================================
CREATE TABLE messages (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    sender_id  UUID NOT NULL REFERENCES users(id),
    content    TEXT NOT NULL,
    is_read    BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table : positions GPS des livreurs (temps réel)
-- ============================================================
CREATE TABLE live_locations (
    user_id    UUID PRIMARY KEY REFERENCES users(id),
    lat        DECIMAL(10,7) NOT NULL,
    lng        DECIMAL(10,7) NOT NULL,
    accuracy   DECIMAL(8,2),
    heading    DECIMAL(5,2),
    speed      DECIMAL(5,2),
    last_update TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Table : favoris (produits aimés par les clients)
-- ============================================================
CREATE TABLE user_favorites (
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, product_id)
);

-- ============================================================
-- Table : codes promotionnels
-- ============================================================
CREATE TABLE promo_codes (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code         VARCHAR(30) UNIQUE NOT NULL,
    discount_pct INTEGER CHECK (discount_pct BETWEEN 1 AND 100),
    discount_amt DECIMAL(10,2) CHECK (discount_amt > 0),
    max_uses     INTEGER DEFAULT 1,
    used_count   INTEGER DEFAULT 0,
    expires_at   TIMESTAMPTZ,
    is_active    BOOLEAN DEFAULT TRUE,
    CHECK (discount_pct IS NOT NULL OR discount_amt IS NOT NULL)
);

-- ============================================================
-- Table : parrainage
-- ============================================================
CREATE TABLE referrals (
    referrer_id UUID NOT NULL REFERENCES users(id),
    referee_id  UUID NOT NULL REFERENCES users(id),
    reward_given BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (referrer_id, referee_id)
);

-- ============================================================
-- Index pour les performances
-- ============================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_delivery ON orders(delivery_person_id);
CREATE INDEX idx_messages_order ON messages(order_id);
CREATE INDEX idx_live_locations_update ON live_locations(last_update);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_available ON products(is_available);

-- ============================================================
-- Données initiales (optionnel – pour le développement)
-- ============================================================

-- Admin par défaut (mot de passe : admin123)
INSERT INTO users (name, email, password_hash, role, phone)
VALUES ('Admin Principal', 'admin@famillefraicheur.bj',
        crypt('admin123', gen_salt('bf')), 'admin', '0000000000');

-- Catégories de base
INSERT INTO categories (name, icon) VALUES
('Fruits', '🍎'),
('Légumes', '🥬'),
('Produits laitiers', '🧀'),
('Viandes & Poissons', '🍗'),
('Épicerie', '🛒');