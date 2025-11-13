-- Migration pour ajouter la colonne vitesse à la table seances_reelles
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter la colonne vitesse (type DECIMAL pour vitesse en km/h)
ALTER TABLE public.seances_reelles 
ADD COLUMN IF NOT EXISTS vitesse DECIMAL(5,2) DEFAULT NULL;

-- Commentaire de la colonne pour documentation
COMMENT ON COLUMN public.seances_reelles.vitesse IS 'Vitesse moyenne de la séance en km/h';

-- Vérifier que la colonne a été créée
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'seances_reelles'
  AND column_name = 'vitesse';
