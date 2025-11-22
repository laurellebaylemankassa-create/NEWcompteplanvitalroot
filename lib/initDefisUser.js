// Initialisation des 10 mini-défis globaux (application mono-utilisateur)
// Respecte le cahier des charges et la checklist du README
// Aucun doublon, aucune suppression, aucune altération des données existantes

import { supabase } from './supabaseClient'
import { defisReferentiel } from './defisReferentiel'

/**
 * Initialise les 10 mini-défis si non présents
 * ⚠️ Application SANS authentification : défis globaux (pas de user_id)
 * @returns {Promise<{ inserted: number, skipped: number, errors: any[] }>}
 */
export async function initDefisUser() {
  let inserted = 0
  let skipped = 0
  let errors = []

  for (const defi of defisReferentiel) {
    // Vérifier si le défi existe déjà (mono-utilisateur : pas de filtre user_id)
    const { data: existing, error: errorSelect } = await supabase
      .from('defis')
      .select('id')
      .eq('description', defi.description)
      .limit(1)
    if (errorSelect) {
      errors.push(errorSelect)
      continue
    }
    if (existing && existing.length > 0) {
      skipped++
      continue
    }
    // Insérer le défi global (pas de colonne user_id)
    const { error: errorInsert } = await supabase
      .from('defis')
      .insert({
        type: defi.type,
        description: defi.description,
        progress: 0,
        status: 'en attente',
        created_at: new Date().toISOString()
      })
    if (errorInsert) {
      errors.push(errorInsert)
      continue
    }
    inserted++
  }
  return { inserted, skipped, errors }
}
