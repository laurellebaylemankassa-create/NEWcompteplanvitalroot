-- Migration : Ajout colonne objectif_perso pour sauvegarder l'objectif personnalisé utilisateur
-- Date : 2026-02-15
-- Description : Permet de sauvegarder l'objectif défini par l'utilisateur pour une semaine donnée

ALTER TABLE semaines_validees
ADD COLUMN IF NOT EXISTS objectif_perso TEXT;

-- Commentaire
COMMENT ON COLUMN semaines_validees.objectif_perso IS 'Objectif personnalisé défini par l''utilisateur pour cette semaine (ex: "Continuer les bonnes choses et rectifier les écarts")';
