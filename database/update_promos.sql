-- ============================================================
-- Famille & Fraîcheur – Amélioration des promotions
-- ============================================================

-- 1. Ajouter une colonne image_url à la table special_offers
ALTER TABLE special_offers ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);

-- 2. Créer la table de liaison offre <-> produits (plusieurs produits par offre)
CREATE TABLE IF NOT EXISTS offer_products (
    offer_id   UUID NOT NULL REFERENCES special_offers(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (offer_id, product_id)
);

-- 3. Migrer les offres existantes (un seul produit) vers la nouvelle table
INSERT INTO offer_products (offer_id, product_id)
SELECT id, product_id FROM special_offers
WHERE product_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 4. Supprimer l'ancienne colonne product_id (devenue inutile)
ALTER TABLE special_offers DROP COLUMN IF EXISTS product_id;