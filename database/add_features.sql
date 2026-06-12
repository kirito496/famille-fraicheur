-- ============================================================
-- Famille & Fraîcheur – Nouvelles fonctionnalités (migration)
-- ============================================================
-- Idempotent : utilise IF NOT EXISTS / IF EXISTS pour pouvoir
-- être rejoué sans erreur sur une base déjà à jour.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Vérification d'e-mail (table users)
--    email_verified  : indique si l'adresse a été confirmée
--    verification_code : code à usage unique envoyé par e-mail
-- ------------------------------------------------------------
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verified    BOOLEAN      DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS verification_code VARCHAR(64)  DEFAULT NULL;

-- ------------------------------------------------------------
-- 2. Statut en ligne des livreurs (table users)
--    is_online : true quand le livreur est disponible / connecté
-- ------------------------------------------------------------
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- ------------------------------------------------------------
-- 3. Code de transaction et mode de livraison (table orders)
--    transaction_code : référence de paiement mobile money
--    delivery_mode    : 'standard' | 'express' | 'scheduled'
-- ------------------------------------------------------------
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS transaction_code VARCHAR(100) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS delivery_mode    VARCHAR(20)  DEFAULT 'standard';

-- ------------------------------------------------------------
-- 4. Date limite de commande sur les créneaux (table orders)
--    order_deadline : heure limite pour passer commande sur ce créneau
-- ------------------------------------------------------------
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS order_deadline TIMESTAMPTZ DEFAULT NULL;

-- ------------------------------------------------------------
-- 5. Ajout de 'pending_payment' dans la contrainte de statut
--    (table orders)
--    On supprime l'ancienne contrainte et on la recrée avec la
--    nouvelle valeur autorisée.
-- ------------------------------------------------------------
ALTER TABLE orders
    DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
    ADD CONSTRAINT orders_status_check
        CHECK (status IN (
            'pending',
            'pending_payment',
            'confirmed',
            'assigned',
            'in_progress',
            'delivered',
            'cancelled',
            'returned'
        ));
