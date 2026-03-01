-- Migration : Ajouter colonne nb_jours_saisis
-- Date : 2026-02-14
-- Objectif : Stocker le nombre de jours avec données saisies pour détecter bilans incomplets

ALTER TABLE semaines_validees 
ADD COLUMN IF NOT EXISTS nb_jours_saisis INTEGER DEFAULT 0;

COMMENT ON COLUMN semaines_validees.nb_jours_saisis IS 'Nombre de jours avec au moins un repas saisi (permet de filtrer bilans incomplets < 2 jours)';
