import { supabase } from './supabaseClient';
import { defisReferentiel } from './defisReferentiel';

/**
 * Met à jour la progression d'un défi et attribue le badge si terminé.
 * @param {object} defi - L'objet défi (doit contenir id, nom, description, progress)
 * @returns {Promise<{success: boolean, error?: string, nouveauStatus?: string, nouvelleProgression?: number}>}
 */
export async function validerEtapeDefi(defi) {
  try {
    const ref = defisReferentiel.find(d => d.description === defi.description || d.nom === defi.nom);
    const max = ref?.duree || 1;
    const nouvelleProgression = Math.min((defi.progress || 0) + 1, max);
    const nouveauStatus = nouvelleProgression >= max ? 'terminé' : 'en cours';
    // Mise à jour du défi
    const { error: updateError } = await supabase
      .from('defis')
      .update({ progress: nouvelleProgression, status: nouveauStatus })
      .eq('id', defi.id);
    if (updateError) {
      return { success: false, error: 'Erreur lors de la progression du défi' };
    }
    // Attribution du badge si terminé
    if (nouvelleProgression >= max) {
      const { data: badgesExistants, error: badgeCheckError } = await supabase
        .from('badges')
        .select('*')
        .eq('nom', defi.nom);
      if (!badgeCheckError && (!badgesExistants || badgesExistants.length === 0)) {
        await supabase
          .from('badges')
          .insert({ nom: defi.nom, description: defi.description, date_obtention: new Date().toISOString() });
      }
    }
    return { success: true, nouveauStatus, nouvelleProgression };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
