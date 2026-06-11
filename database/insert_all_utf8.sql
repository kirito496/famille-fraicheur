-- Insertion des 12 catégories
INSERT INTO categories (name, icon) VALUES
('Fruits & Legumes', '🥬'),
('Boucherie & Poisson', '🍗'),
('Cremerie & Laitages', '🥛'),
('Epicerie Sucree', '🍪'),
('Epicerie Salee', '🧂'),
('Boissons', '🥤'),
('Petit-dejeuner', '🥞'),
('Bebe & Enfant', '👶'),
('Hygiene & Beaute', '🧴'),
('Entretien Menager', '🧹'),
('Snacking & Apero', '🍕'),
('Traiteur & A emporter', '📦');

-- Produits (les mêmes que précédemment, sans accents)
-- Catégorie Fruits & Legumes
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Tomates fraiches (kg)', 800, 100, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Oignons rouges de Glazoue (kg)', 600, 80, CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Oignons blancs (kg)', 500, 80, CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Piment frais (kg)', 400, 60, CURRENT_DATE + INTERVAL '10 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Piment habanero (kg)', 600, 40, CURRENT_DATE + INTERVAL '10 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Poivrons verts (kg)', 700, 50, CURRENT_DATE + INTERVAL '10 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Poivrons rouges (kg)', 800, 50, CURRENT_DATE + INTERVAL '10 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Laitue verte (piece)', 300, 60, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Concombres (kg)', 500, 70, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Carottes (kg)', 600, 80, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Chou pomme (piece)', 500, 50, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Aubergines longues (kg)', 400, 60, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Gombos (kg)', 600, 60, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Haricots verts (kg)', 700, 50, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Citrouille (kg)', 500, 40, CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Brocoli (piece)', 800, 30, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Courgettes (kg)', 600, 50, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Ananas pain de sucre (piece)', 700, 60, CURRENT_DATE + INTERVAL '10 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Mangues Amelie (kg)', 500, 80, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Mangues David (kg)', 600, 70, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Oranges (kg)', 800, 80, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Bananes douces (kg)', 400, 100, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Bananes plantain (kg)', 500, 80, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Papayes (kg)', 600, 50, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Pasteques (piece)', 1500, 30, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Melons (piece)', 1000, 30, CURRENT_DATE + INTERVAL '10 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Citrons verts (kg)', 400, 60, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Goyaves (kg)', 700, 30, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Noix de coco (piece)', 500, 40, CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Gingembre frais (kg)', 1200, 40, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Ail frais (kg)', 800, 50, CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Persil frais (botte)', 200, 50, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Coriandre fraiche (botte)', 200, 50, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Basilic frais (botte)', 200, 50, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Menthe fraiche (botte)', 200, 50, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Citronnelle (botte)', 300, 40, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Gboma (feuilles) (kg)', 500, 40, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Adetin/crincrin (kg)', 600, 30, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Amarante (brede) (kg)', 400, 40, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Moringa (kg)', 700, 30, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Patate douce (kg)', 500, 60, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Igname (kg)', 600, 60, CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM categories WHERE name='Fruits & Legumes'), 'Manioc (kg)', 300, 80, CURRENT_DATE + INTERVAL '14 days');

-- Boucherie & Poisson
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Poulet fermier entier (kg)', 2500, 30, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Poulet fermier decoupe (kg)', 2800, 30, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Pintade (piece)', 4000, 15, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Boeuf a braiser (kg)', 3000, 25, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Boeuf hache (kg)', 3200, 20, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Boeuf a griller (kg)', 3500, 20, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Agneau/mouton (kg)', 4000, 15, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Poisson Tilapia (kg)', 2000, 30, CURRENT_DATE + INTERVAL '3 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Poisson Capitaine (kg)', 3500, 20, CURRENT_DATE + INTERVAL '3 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Poisson fume (kg)', 3000, 30, CURRENT_DATE + INTERVAL '60 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Crevettes fraiches (kg)', 5000, 15, CURRENT_DATE + INTERVAL '3 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Crevettes sechees (kg)', 6000, 20, CURRENT_DATE + INTERVAL '90 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Escargot/Achatine (kg)', 3500, 15, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Oeufs frais (x6)', 800, 100, CURRENT_DATE + INTERVAL '21 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Oeufs frais (x12)', 1500, 80, CURRENT_DATE + INTERVAL '21 days'),
((SELECT id FROM categories WHERE name='Boucherie & Poisson'), 'Saucisses (paquet)', 1500, 40, CURRENT_DATE + INTERVAL '14 days');

-- Cremerie & Laitages
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Cremerie & Laitages'), 'Wagashi/fromage Peulh (piece)', 500, 40, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Cremerie & Laitages'), 'Yaourt nature (piece)', 300, 80, CURRENT_DATE + INTERVAL '21 days'),
((SELECT id FROM categories WHERE name='Cremerie & Laitages'), 'Yaourt sucre vanille (piece)', 350, 80, CURRENT_DATE + INTERVAL '21 days'),
((SELECT id FROM categories WHERE name='Cremerie & Laitages'), 'Yaourt a boire (piece)', 500, 60, CURRENT_DATE + INTERVAL '21 days'),
((SELECT id FROM categories WHERE name='Cremerie & Laitages'), 'Lait frais pasteurise (L)', 1200, 40, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Cremerie & Laitages'), 'Beurre doux (250g)', 1500, 30, CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM categories WHERE name='Cremerie & Laitages'), 'Beurre sale (250g)', 1600, 30, CURRENT_DATE + INTERVAL '30 days'),
((SELECT id FROM categories WHERE name='Cremerie & Laitages'), 'Mozzarella locale (piece)', 2000, 25, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Cremerie & Laitages'), 'Fromage blanc (pot)', 1000, 30, CURRENT_DATE + INTERVAL '14 days'),
((SELECT id FROM categories WHERE name='Cremerie & Laitages'), 'Creme fraiche (pot)', 1500, 25, CURRENT_DATE + INTERVAL '14 days');

-- Epicerie Sucree
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Epicerie Sucree'), 'Sucre blanc cristallise (kg)', 800, 100, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Sucree'), 'Sucre roux/cassonade (kg)', 900, 80, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Sucree'), 'Miel local du Nord (pot 500g)', 2500, 40, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Sucree'), 'Confiture d''ananas (pot)', 1500, 30, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Epicerie Sucree'), 'Confiture de mangue (pot)', 1500, 30, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Epicerie Sucree'), 'Nutella (pot 350g)', 3000, 30, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Sucree'), 'Biscuits sables (paquet)', 1000, 50, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Epicerie Sucree'), 'Madeleines (paquet)', 1200, 40, CURRENT_DATE + INTERVAL '60 days'),
((SELECT id FROM categories WHERE name='Epicerie Sucree'), 'Chocolat noir (tablette)', 1500, 40, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Sucree'), 'Bonbons assortis (sachet)', 500, 60, CURRENT_DATE + INTERVAL '180 days');

-- Epicerie Salee
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Riz blanc local (kg)', 600, 150, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Riz etuve (kg)', 800, 120, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Spaghettis (paquet 500g)', 700, 100, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Macaronis (paquet 500g)', 700, 80, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Couscous de ble (kg)', 900, 60, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Wassa-wassa/semoule d''igname (kg)', 1200, 50, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Farine de mais/pate (kg)', 500, 100, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Farine d''igname/Telibo (kg)', 1000, 60, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Gari/semoule de manioc (kg)', 400, 120, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Haricot rouge/niebe (kg)', 800, 80, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Sorgho (kg)', 600, 50, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Millet (kg)', 500, 50, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Sel fin (kg)', 300, 100, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Poivre noir moulu (pot)', 800, 60, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Concentre de tomate (boite)', 400, 100, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Mayonnaise (pot)', 1200, 60, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Ketchup (bouteille)', 1000, 60, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Huile d''arachide (L)', 1500, 80, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Huile d''olive (L)', 4000, 40, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Huile de palme (L)', 1000, 60, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Pate d''arachide/puree (pot)', 1500, 50, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Vinaigre (bouteille)', 800, 60, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Epicerie Salee'), 'Cube d''assaisonnement (carton)', 1500, 100, CURRENT_DATE + INTERVAL '365 days');

-- Boissons
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Boissons'), 'Coca-Cola 33cl', 400, 150, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Coca-Cola 1.5L', 1000, 100, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Fanta orange 33cl', 400, 120, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Sprite 33cl', 400, 120, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Biere La Beninoise (bouteille)', 600, 100, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Biere Castel (bouteille)', 700, 80, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Biere Beaufort (bouteille)', 800, 60, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Jus d''ananas frais (L)', 1500, 40, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Jus de gingembre (L)', 1500, 40, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Jus de bissap (L)', 1000, 50, CURRENT_DATE + INTERVAL '7 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Eau minerale 50cl', 300, 200, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Eau minerale 1.5L', 500, 150, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'The glace (canette)', 500, 60, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Boissons'), 'Tonic (canette)', 500, 50, CURRENT_DATE + INTERVAL '365 days');

-- Petit-dejeuner
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Petit-dejeuner'), 'Pain baguette frais (piece)', 200, 100, CURRENT_DATE + INTERVAL '1 day'),
((SELECT id FROM categories WHERE name='Petit-dejeuner'), 'Pain de campagne (piece)', 500, 60, CURRENT_DATE + INTERVAL '2 days'),
((SELECT id FROM categories WHERE name='Petit-dejeuner'), 'Pain complet (piece)', 400, 50, CURRENT_DATE + INTERVAL '2 days'),
((SELECT id FROM categories WHERE name='Petit-dejeuner'), 'Cafe moulu (paquet 250g)', 1500, 40, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Petit-dejeuner'), 'Cafe soluble (pot)', 2000, 40, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Petit-dejeuner'), 'The noir (boite)', 1200, 40, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Petit-dejeuner'), 'Chicoree (paquet)', 1000, 30, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Petit-dejeuner'), 'Farine de mais bouillie (kg)', 500, 60, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Petit-dejeuner'), 'Farine de mil (kg)', 600, 50, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Petit-dejeuner'), 'Flocons d''avoine (paquet)', 1500, 40, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Petit-dejeuner'), 'Beurre de cacahuete (pot)', 2000, 40, CURRENT_DATE + INTERVAL '180 days');

-- Bebe & Enfant
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Bebe & Enfant'), 'Couches bebe T1 (paquet)', 3500, 50, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Bebe & Enfant'), 'Couches bebe T2 (paquet)', 3500, 50, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Bebe & Enfant'), 'Couches bebe T3 (paquet)', 4000, 50, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Bebe & Enfant'), 'Couches bebe T4 (paquet)', 4500, 50, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Bebe & Enfant'), 'Couches bebe T5 (paquet)', 5000, 40, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Bebe & Enfant'), 'Couches bebe T6 (paquet)', 5500, 40, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Bebe & Enfant'), 'Lait 1er age 0-6 mois (boite)', 4500, 30, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Bebe & Enfant'), 'Lait 2eme age 6-12 mois (boite)', 4000, 30, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Bebe & Enfant'), 'Lait croissance 12 mois+ (boite)', 4000, 30, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Bebe & Enfant'), 'Petits pots legumes 4-6 mois', 1000, 40, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Bebe & Enfant'), 'Petits pots fruits 4-6 mois', 1000, 40, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Bebe & Enfant'), 'Petits pots viande 8 mois+', 1200, 30, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Bebe & Enfant'), 'Lingettes bebe (paquet)', 1500, 50, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Bebe & Enfant'), 'Biscuits bebe des 6 mois (boite)', 2000, 30, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Bebe & Enfant'), 'Biberon 240ml', 2500, 30, CURRENT_DATE + INTERVAL '1095 days'),
((SELECT id FROM categories WHERE name='Bebe & Enfant'), 'Tetine de rechange', 800, 40, CURRENT_DATE + INTERVAL '1095 days');

-- Hygiene & Beaute
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Hygiene & Beaute'), 'Savon corps au karite (piece)', 500, 100, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Hygiene & Beaute'), 'Savon antiseptique (piece)', 600, 80, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Hygiene & Beaute'), 'Shampooing (flacon)', 1500, 60, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Hygiene & Beaute'), 'Apres-shampooing (flacon)', 1500, 50, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Hygiene & Beaute'), 'Dentifrice (tube)', 800, 80, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Hygiene & Beaute'), 'Brosse a dents', 400, 100, CURRENT_DATE + INTERVAL '1095 days'),
((SELECT id FROM categories WHERE name='Hygiene & Beaute'), 'Creme hydratante corps (pot)', 2000, 50, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Hygiene & Beaute'), 'Deodorant (stick)', 1500, 60, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Hygiene & Beaute'), 'Gel douche (flacon)', 1200, 60, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Hygiene & Beaute'), 'Cotons demaquillants (paquet)', 1000, 50, CURRENT_DATE + INTERVAL '730 days');

-- Entretien Menager
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Entretien Menager'), 'Savon vaisselle (bouteille)', 800, 80, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Entretien Menager'), 'Eau de Javel (L)', 700, 80, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Entretien Menager'), 'Eponges (lot de 3)', 600, 80, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Entretien Menager'), 'Sac poubelle 50L (rouleau)', 1000, 80, CURRENT_DATE + INTERVAL '730 days'),
((SELECT id FROM categories WHERE name='Entretien Menager'), 'Lessive poudre (kg)', 1500, 60, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Entretien Menager'), 'Nettoyant vitres (flacon)', 1200, 50, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Entretien Menager'), 'Desinfectant sols (flacon)', 1500, 50, CURRENT_DATE + INTERVAL '365 days'),
((SELECT id FROM categories WHERE name='Entretien Menager'), 'Balai', 2000, 30, CURRENT_DATE + INTERVAL '1095 days'),
((SELECT id FROM categories WHERE name='Entretien Menager'), 'Pelle a poussiere', 1500, 30, CURRENT_DATE + INTERVAL '1095 days');

-- Snacking & Apero
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Snacking & Apero'), 'Chips nature (paquet)', 500, 100, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Snacking & Apero'), 'Chips paprika (paquet)', 500, 80, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Snacking & Apero'), 'Cacahuetes grillees (sachet)', 400, 100, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Snacking & Apero'), 'Cacahuetes salees (sachet)', 400, 100, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Snacking & Apero'), 'Pistaches (sachet)', 1200, 50, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Snacking & Apero'), 'Biscuits apero sales (paquet)', 800, 60, CURRENT_DATE + INTERVAL '180 days'),
((SELECT id FROM categories WHERE name='Snacking & Apero'), 'Pizza surgelee (piece)', 2500, 30, CURRENT_DATE + INTERVAL '90 days'),
((SELECT id FROM categories WHERE name='Snacking & Apero'), 'Quiche lorraine (piece)', 2000, 25, CURRENT_DATE + INTERVAL '5 days'),
((SELECT id FROM categories WHERE name='Snacking & Apero'), 'Samoussas (lot de 5)', 1500, 40, CURRENT_DATE + INTERVAL '5 days');

-- Traiteur & A emporter
INSERT INTO products (category_id, name, price, stock, expiration) VALUES
((SELECT id FROM categories WHERE name='Traiteur & A emporter'), 'Salade composee (barquette)', 1500, 30, CURRENT_DATE + INTERVAL '2 days'),
((SELECT id FROM categories WHERE name='Traiteur & A emporter'), 'Sandwich jambon-beurre', 1200, 40, CURRENT_DATE + INTERVAL '1 day'),
((SELECT id FROM categories WHERE name='Traiteur & A emporter'), 'Sandwich poulet crudites', 1500, 40, CURRENT_DATE + INTERVAL '1 day'),
((SELECT id FROM categories WHERE name='Traiteur & A emporter'), 'Plateau fruits frais', 2000, 20, CURRENT_DATE + INTERVAL '1 day'),
((SELECT id FROM categories WHERE name='Traiteur & A emporter'), 'Jus frais presse (50cl)', 1000, 40, CURRENT_DATE + INTERVAL '1 day'),
((SELECT id FROM categories WHERE name='Traiteur & A emporter'), 'Grillades poulet (portion)', 2000, 30, CURRENT_DATE + INTERVAL '1 day'),
((SELECT id FROM categories WHERE name='Traiteur & A emporter'), 'Poisson braise (portion)', 2500, 25, CURRENT_DATE + INTERVAL '1 day'),
((SELECT id FROM categories WHERE name='Traiteur & A emporter'), 'Riz gras a emporter (barquette)', 1000, 40, CURRENT_DATE + INTERVAL '1 day'),
((SELECT id FROM categories WHERE name='Traiteur & A emporter'), 'Pate + sauce a emporter (barquette)', 1200, 40, CURRENT_DATE + INTERVAL '1 day');