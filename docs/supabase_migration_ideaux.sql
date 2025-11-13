-- Migration pour ajouter les colonnes planData et plan_existant à la table ideaux
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter la colonne planData (type jsonb pour stocker les données structurées du plan)
ALTER TABLE public.ideaux 
ADD COLUMN IF NOT EXISTS planData jsonb DEFAULT NULL;

-- Ajouter la colonne plan_existant (booléen pour indiquer si un plan a été généré)
ALTER TABLE public.ideaux 
ADD COLUMN IF NOT EXISTS plan_existant boolean DEFAULT false;

-- Créer un index sur plan_existant pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_ideaux_plan_existant ON public.ideaux(plan_existant);

-- Vérifier que les colonnes ont été créées
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'ideaux'
  AND column_name IN ('planData', 'plan_existant');
