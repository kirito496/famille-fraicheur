-- ============================================================
-- Famille & Fraîcheur – Insertion des catégories et 180 produits
-- ============================================================

-- 1. CATÉGORIES
INSERT INTO categories (name, icon) VALUES
('Fruits & Légumes', '🥬'),
('Boucherie & Poisson', '🍗'),
('Crémerie & Laitages', '🥛'),
('Épicerie Sucrée', '🍪'),
('Épicerie Salée', '🧂'),
('Boissons', '🥤'),
('Petit-déjeuner', '🥞'),
('Bébé & Enfant', '👶'),
('Hygiène & Beauté', '🧴'),
('Entretien Ménager', '🧹'),
('Snacking & Apéro', '🍕'),
('Traiteur & À emporter', '📦')
ON CONFLICT (name) DO NOTHING;

-- ==================== Fruits & Légumes ====================
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Tomates fraîches (kg)', 800, 100, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Oignons rouges de Glazoué (kg)', 600, 80, CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Oignons blancs (kg)', 500, 80, CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Piment frais (kg)', 400, 60, CURRENT_DATE + INTERVAL '10 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Piment habanero (kg)', 600, 40, CURRENT_DATE + INTERVAL '10 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Poivrons verts (kg)', 700, 50, CURRENT_DATE + INTERVAL '10 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Poivrons rouges (kg)', 800, 50, CURRENT_DATE + INTERVAL '10 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Laitue verte (pièce)', 300, 60, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Concombres (kg)', 500, 70, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Carottes (kg)', 600, 80, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Chou pommé (pièce)', 500, 50, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Aubergines longues (kg)', 400, 60, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Gombos (kg)', 600, 60, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Haricots verts (kg)', 700, 50, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Citrouille (kg)', 500, 40, CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Brocoli (pièce)', 800, 30, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Courgettes (kg)', 600, 50, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Ananas pain de sucre (pièce)', 700, 60, CURRENT_DATE + INTERVAL '10 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Mangues Amélie (kg)', 500, 80, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Mangues David (kg)', 600, 70, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Oranges (kg)', 800, 80, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Bananes douces (kg)', 400, 100, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Bananes plantain (kg)', 500, 80, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Papayes (kg)', 600, 50, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Pastèques (pièce)', 1500, 30, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Melons (pièce)', 1000, 30, CURRENT_DATE + INTERVAL '10 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Citrons verts (kg)', 400, 60, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Goyaves (kg)', 700, 30, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Noix de coco (pièce)', 500, 40, CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Gingembre frais (kg)', 1200, 40, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Ail frais (kg)', 800, 50, CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Persil frais (botte)', 200, 50, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Coriandre fraîche (botte)', 200, 50, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Basilic frais (botte)', 200, 50, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Menthe fraîche (botte)', 200, 50, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Citronnelle (botte)', 300, 40, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Gboma (feuilles) (kg)', 500, 40, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Adétin/crincrin (kg)', 600, 30, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Amarante (brède) (kg)', 400, 40, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Moringa (kg)', 700, 30, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Patate douce (kg)', 500, 60, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Igname (kg)', 600, 60, CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM categories WHERE name='Fruits & Légumes'), 'Manioc (kg)', 300, 80, CURRENT_DATE + INTERVAL '14 days');

-- ==================== Boucherie & Poisson ====================
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Poulet fermier entier (kg)', 2500, 30, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Poulet fermier découpé (kg)', 2800, 30, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Pintade (pièce)', 4000, 15, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Bœuf à braiser (kg)', 3000, 25, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Bœuf haché (kg)', 3200, 20, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Bœuf à griller (kg)', 3500, 20, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Agneau/mouton (kg)', 4000, 15, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Poisson Tilapia (kg)', 2000, 30, CURRENT_DATE + INTERVAL '3 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Poisson Capitaine (kg)', 3500, 20, CURRENT_DATE + INTERVAL '3 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Poisson fumé (kg)', 3000, 30, CURRENT_DATE + INTERVAL '60 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Crevettes fraîches (kg)', 5000, 15, CURRENT_DATE + INTERVAL '3 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Crevettes séchées (kg)', 6000, 20, CURRENT_DATE + INTERVAL '90 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Escargot/Achatine (kg)', 3500, 15, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Œufs frais (x6)', 800, 100, CURRENT_DATE + INTERVAL '21 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Œufs frais (x12)', 1500, 80, CURRENT_DATE + INTERVAL '21 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Saucisses (paquet)', 1500, 40, CURRENT_DATE + INTERVAL '14 days');

-- ==================== Crémerie & Laitages ====================
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Crémerie & Laitages'), 'Wagashi/fromage Peulh (pièce)', 500, 40, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Crémerie & Laitages'), 'Yaourt nature (pièce)', 300, 80, CURRENT_DATE + INTERVAL '21 days'),
((SELECT id FROM categories WHERE name='Crémerie & Laitages'), 'Yaourt sucré vanille (pièce)', 350, 80, CURRENT_DATE + INTERVAL '21 days'),
((SELECT id FROM categories WHERE name='Crémerie & Laitages'), 'Yaourt à boire (pièce)', 500, 60, CURRENT_DATE + INTERVAL '21 days'),
((SELECT id FROM categories WHERE name='Crémerie & Laitages'), 'Lait frais pasteurisé (L)', 1200, 40, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Crémerie & Laitages'), 'Beurre doux (250g)', 1500, 30, CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM categories WHERE name='Crémerie & Laitages'), 'Beurre salé (250g)', 1600, 30, CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM categories WHERE name='Crémerie & Laitages'), 'Mozzarella locale (pièce)', 2000, 25, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Crémerie & Laitages'), 'Fromage blanc (pot)', 1000, 30, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Crémerie & Laitages'), 'Crème fraîche (pot)', 1500, 25, CURRENT_DATE + INTERVAL '14 days');

-- ==================== Épicerie Sucrée ====================
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Épicerie Sucrée'), 'Sucre blanc cristallisé (kg)', 800, 100, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Sucrée'), 'Sucre roux/cassonade (kg)', 900, 80, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Sucrée'), 'Miel local du Nord (pot 500g)', 2500, 40, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Sucrée'), 'Confiture d''ananas (pot)', 1500, 30, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Épicerie Sucrée'), 'Confiture de mangue (pot)', 1500, 30, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Épicerie Sucrée'), 'Nutella (pot 350g)', 3000, 30, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Sucrée'), 'Biscuits sablés (paquet)', 1000, 50, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Épicerie Sucrée'), 'Madeleines (paquet)', 1200, 40, CURRENT_DATE + INTERVAL '60 days'),
((SELECT id FROM categories WHERE name='Épicerie Sucrée'), 'Chocolat noir (tablette)', 1500, 40, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Sucrée'), 'Bonbons assortis (sachet)', 500, 60, CURRENT_DATE + INTERVAL '180 days');

-- ==================== Épicerie Salée ====================
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Riz blanc local (kg)', 600, 150, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Riz étuvé (kg)', 800, 120, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Spaghettis (paquet 500g)', 700, 100, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Macaronis (paquet 500g)', 700, 80, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Couscous de blé (kg)', 900, 60, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Wassa-wassa/semoule d''igname (kg)', 1200, 50, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Farine de maïs/pâte (kg)', 500, 100, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Farine d''igname/Télibo (kg)', 1000, 60, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Gari/semoule de manioc (kg)', 400, 120, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Haricot rouge/niébé (kg)', 800, 80, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Sorgho (kg)', 600, 50, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Millet (kg)', 500, 50, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Sel fin (kg)', 300, 100, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Poivre noir moulu (pot)', 800, 60, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Concentré de tomate (boîte)', 400, 100, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Mayonnaise (pot)', 1200, 60, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Ketchup (bouteille)', 1000, 60, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Huile d''arachide (L)', 1500, 80, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Huile d''olive (L)', 4000, 40, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Huile de palme (L)', 1000, 60, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Pâte d''arachide/purée (pot)', 1500, 50, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Vinaigre (bouteille)', 800, 60, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Épicerie Salée'), 'Cube d''assaisonnement (carton)', 1500, 100, CURRENT_DATE + INTERVAL '365 days');

-- ==================== Boissons ====================
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Boissons'), 'Coca-Cola 33cl', 400, 150, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Coca-Cola 1.5L', 1000, 100, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Fanta orange 33cl', 400, 120, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Sprite 33cl', 400, 120, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Bière La Béninoise (bouteille)', 600, 100, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Bière Castel (bouteille)', 700, 80, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Bière Beaufort (bouteille)', 800, 60, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Jus d''ananas frais (L)', 1500, 40, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Jus de gingembre (L)', 1500, 40, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Jus de bissap (L)', 1000, 50, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Eau minérale 50cl', 300, 200, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Eau minérale 1.5L', 500, 150, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Thé glacé (canette)', 500, 60, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Tonic (canette)', 500, 50, CURRENT_DATE + INTERVAL '365 days');

-- ==================== Petit-déjeuner ====================
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Petit-déjeuner'), 'Pain baguette frais (pièce)', 200, 100, CURRENT_DATE + INTERVAL '1 day'),
((SELECT id FROM categories WHERE name='Petit-déjeuner'), 'Pain de campagne (pièce)', 500, 60, CURRENT_DATE + INTERVAL '2 days'),
((SELECT id FROM categories WHERE name='Petit-déjeuner'), 'Pain complet (pièce)', 400, 50, CURRENT_DATE + INTERVAL '2 days'),
((SELECT id FROM categories WHERE name='Petit-déjeuner'), 'Café moulu (paquet 250g)', 1500, 40, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Petit-déjeuner'), 'Café soluble (pot)', 2000, 40, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Petit-déjeuner'), 'Thé noir (boîte)', 1200, 40, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Petit-déjeuner'), 'Chicorée (paquet)', 1000, 30, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Petit-déjeuner'), 'Farine de maïs bouillie (kg)', 500, 60, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Petit-déjeuner'), 'Farine de mil (kg)', 600, 50, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Petit-déjeuner'), 'Flocons d''avoine (paquet)', 1500, 40, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Petit-déjeuner'), 'Beurre de cacahuète (pot)', 2000, 40, CURRENT_DATE + INTERVAL '180 days');

-- ==================== Bébé & Enfant ====================
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Bébé & Enfant'), 'Couches bébé T1 (paquet)', 3500, 50, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Bébé & Enfant'), 'Couches bébé T2 (paquet)', 3500, 50, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Bébé & Enfant'), 'Couches bébé T3 (paquet)', 4000, 50, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Bébé & Enfant'), 'Couches bébé T4 (paquet)', 4500, 50, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Bébé & Enfant'), 'Couches bébé T5 (paquet)', 5000, 40, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Bébé & Enfant'), 'Couches bébé T6 (paquet)', 5500, 40, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Bébé & Enfant'), 'Lait 1er âge 0-6 mois (boîte)', 4500, 30, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Bébé & Enfant'), 'Lait 2ème âge 6-12 mois (boîte)', 4000, 30, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Bébé & Enfant'), 'Lait croissance 12 mois+ (boîte)', 4000, 30, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Bébé & Enfant'), 'Petits pots légumes 4-6 mois', 1000, 40, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Bébé & Enfant'), 'Petits pots fruits 4-6 mois', 1000, 40, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Bébé & Enfant'), 'Petits pots viande 8 mois+', 1200, 30, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Bébé & Enfant'), 'Lingettes bébé (paquet)', 1500, 50, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Bébé & Enfant'), 'Biscuits bébé dès 6 mois (boîte)', 2000, 30, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Bébé & Enfant'), 'Biberon 240ml', 2500, 30, CURRENT_DATE + INTERVAL '1095 days'),
((SELECT id FROM categories WHERE name='Bébé & Enfant'), 'Tétine de rechange', 800, 40, CURRENT_DATE + INTERVAL '1095 days');

-- ==================== Hygiène & Beauté ====================
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Hygiène & Beauté'), 'Savon corps au karité (pièce)', 500, 100, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Hygiène & Beauté'), 'Savon antiseptique (pièce)', 600, 80, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Hygiène & Beauté'), 'Shampooing (flacon)', 1500, 60, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Hygiène & Beauté'), 'Après-shampooing (flacon)', 1500, 50, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Hygiène & Beauté'), 'Dentifrice (tube)', 800, 80, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Hygiène & Beauté'), 'Brosse à dents', 400, 100, CURRENT_DATE + INTERVAL '1095 days'),
((SELECT id FROM categories WHERE name='Hygiène & Beauté'), 'Crème hydratante corps (pot)', 2000, 50, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Hygiène & Beauté'), 'Déodorant (stick)', 1500, 60, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Hygiène & Beauté'), 'Gel douche (flacon)', 1200, 60, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Hygiène & Beauté'), 'Cotons démaquillants (paquet)', 1000, 50, CURRENT_DATE + INTERVAL '730 days');

-- ==================== Entretien Ménager ====================
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Entretien Ménager'), 'Savon vaisselle (bouteille)', 800, 80, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Entretien Ménager'), 'Eau de Javel (L)', 700, 80, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Entretien Ménager'), 'Éponges (lot de 3)', 600, 80, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Entretien Ménager'), 'Sac poubelle 50L (rouleau)', 1000, 80, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Entretien Ménager'), 'Lessive poudre (kg)', 1500, 60, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Entretien Ménager'), 'Nettoyant vitres (flacon)', 1200, 50, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Entretien Ménager'), 'Désinfectant sols (flacon)', 1500, 50, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Entretien Ménager'), 'Balai', 2000, 30, CURRENT_DATE + INTERVAL '1095 days'),
((SELECT id FROM categories WHERE name='Entretien Ménager'), 'Pelle à poussière', 1500, 30, CURRENT_DATE + INTERVAL '1095 days');

-- ==================== Snacking & Apéro ====================
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Snacking & Apéro'), 'Chips nature (paquet)', 500, 100, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Snacking & Apéro'), 'Chips paprika (paquet)', 500, 80, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Snacking & Apéro'), 'Cacahuètes grillées (sachet)', 400, 100, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Snacking & Apéro'), 'Cacahuètes salées (sachet)', 400, 100, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Snacking & Apéro'), 'Pistaches (sachet)', 1200, 50, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Snacking & Apéro'), 'Biscuits apéro salés (paquet)', 800, 60, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Snacking & Apéro'), 'Pizza surgelée (pièce)', 2500, 30, CURRENT_DATE + INTERVAL '90 days'),
((SELECT id FROM categories WHERE name='Snacking & Apéro'), 'Quiche lorraine (pièce)', 2000, 25, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Snacking & Apéro'), 'Samoussas (lot de 5)', 1500, 40, CURRENT_DATE + INTERVAL '5 days');

-- ==================== Traiteur & À emporter ====================
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Traiteur & À emporter'), 'Salade composée (barquette)', 1500, 30, CURRENT_DATE + INTERVAL '2 days'),
((SELECT id FROM categories WHERE name='Traiteur & À emporter'), 'Sandwich jambon-beurre', 1200, 40, CURRENT_DATE + INTERVAL '1 day'),
((SELECT id FROM categories WHERE name='Traiteur & À emporter'), 'Sandwich poulet crudités', 1500, 40, CURRENT_DATE + INTERVAL '1 day'),
((SELECT id FROM categories WHERE name='Traiteur & À emporter'), 'Plateau fruits frais', 2000, 20, CURRENT_DATE + INTERVAL '1 day'),
((SELECT id FROM categories WHERE name='Traiteur & À emporter'), 'Jus frais pressé (50cl)', 1000, 40, CURRENT_DATE + INTERVAL '1 day'),
((SELECT id FROM categories WHERE name='Traiteur & À emporter'), 'Grillades poulet (portion)', 2000, 30, CURRENT_DATE + INTERVAL '1 day'),
((SELECT id FROM categories WHERE name='Traiteur & À emporter'), 'Poisson braisé (portion)', 2500, 25, CURRENT_DATE + INTERVAL '1 day'),
((SELECT id FROM categories WHERE name='Traiteur & À emporter'), 'Riz gras à emporter (barquette)', 1000, 40, CURRENT_DATE + INTERVAL '1 day'),
((SELECT id FROM categories WHERE name='Traiteur & À emporter'), 'Pâte + sauce à emporter (barquette)', 1200, 40, CURRENT_DATE + INTERVAL '1 day');