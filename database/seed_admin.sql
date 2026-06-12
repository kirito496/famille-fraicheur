-- ============================================================
-- Famille & Fraîcheur – Seed : vérification de l'admin
-- ============================================================
-- Marque l'adresse e-mail de l'administrateur comme vérifiée.
-- Idempotent : UPDATE n'affecte rien si la ligne est déjà à jour.
-- ============================================================

UPDATE users
SET email_verified = TRUE
WHERE email = 'admin@famillefraicheur.bj';
