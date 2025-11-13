-- Migration pour ajouter la colonne plan_params_valides dans la table ideaux
-- Cette colonne stocke les paramètres FIGÉS du Palier 1 validé

ALTER TABLE public.ideaux 
ADD COLUMN IF NOT EXISTS plan_params_valides jsonb DEFAULT NULL;

-- Commentaire pour documentation
COMMENT ON COLUMN public.ideaux.plan_params_valides IS 
'Paramètres figés du palier validé : {duree, intensite, frequence, joursProposes, palierDuree, dateDebut}';
