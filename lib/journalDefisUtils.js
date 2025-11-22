// Fonctions utilitaires pour le suivi quotidien des défis personnalisés
// Architecture mono-utilisateur (pas de user_id)

import { supabase } from "./supabaseClient";

/**
 * Sauvegarde les engagements déclarés le matin
 * @param {number} defiId - ID du défi
 * @param {number} jour - Numéro du jour (1, 2, 3...)
 * @param {Array<{texte: string, tenu: boolean}>} engagements - Liste des engagements
 * @param {string} notePersonnelle - Note optionnelle
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sauvegarderEngagements(defiId, jour, engagements, notePersonnelle = "") {
  try {
    // Vérifier si entrée existe déjà pour ce défi et ce jour
    const { data: existant, error: selectError } = await supabase
      .from("journal_defis")
      .select("id")
      .eq("defi_id", defiId)
      .eq("jour", jour)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      // PGRST116 = pas de résultat, c\'est normal
      return { success: false, error: selectError.message };
    }

    const payload = {
      defi_id: defiId,
      jour,
      engagements,
      note_personnelle: notePersonnelle,
      score: null,
      valide: false,
      updated_at: new Date().toISOString()
    };

    if (existant) {
      // Mise à jour
      const { error: updateError } = await supabase
        .from("journal_defis")
        .update(payload)
        .eq("id", existant.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }
    } else {
      // Insertion
      const { error: insertError } = await supabase
        .from("journal_defis")
        .insert([payload]);

      if (insertError) {
        return { success: false, error: insertError.message };
      }
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Charge le journal d\'un défi pour un jour donné
 * @param {number} defiId - ID du défi
 * @param {number} jour - Numéro du jour
 * @returns {Promise<{data: object|null, error?: string}>}
 */
export async function chargerJournalDefi(defiId, jour) {
  try {
    const { data, error } = await supabase
      .from("journal_defis")
      .select("*")
      .eq("defi_id", defiId)
      .eq("jour", jour)
      .single();

    if (error && error.code !== "PGRST116") {
      return { data: null, error: error.message };
    }

    return { data: data || null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Charge tout l\'historique d\'un défi
 * @param {number} defiId - ID du défi
 * @returns {Promise<{data: Array, error?: string}>}
 */
export async function chargerHistoriqueDefi(defiId) {
  try {
    const { data, error } = await supabase
      .from("journal_defis")
      .select("*")
      .eq("defi_id", defiId)
      .order("jour", { ascending: true });

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: data || [] };
  } catch (err) {
    return { data: [], error: err.message };
  }
}

/**
 * Valide les engagements du soir et incrémente la progression si >= 2/3 tenus
 * @param {number} defiId - ID du défi
 * @param {number} jour - Numéro du jour
 * @param {Array<{texte: string, tenu: boolean}>} engagements - Engagements cochés
 * @returns {Promise<{success: boolean, etapeValidee: boolean, error?: string}>}
 */
export async function validerEtapeDefi(defiId, jour, engagements) {
  try {
    const score = calculerScore(engagements);
    const scoreNumerique = calculerScoreNumerique(engagements);
    const etapeValidee = scoreNumerique >= (2 / 3);

    // 1. Mettre à jour journal_defis
    const { error: journalError } = await supabase
      .from("journal_defis")
      .update({
        engagements,
        score,
        valide: etapeValidee,
        updated_at: new Date().toISOString()
      })
      .eq("defi_id", defiId)
      .eq("jour", jour);

    if (journalError) {
      return { success: false, etapeValidee: false, error: journalError.message };
    }

    // 2. Si étape validée, incrémenter progression du défi
    if (etapeValidee) {
      const { data: defi, error: defiSelectError } = await supabase
        .from("defis")
        .select("progress, duree")
        .eq("id", defiId)
        .single();

      if (defiSelectError) {
        return { success: false, etapeValidee: true, error: defiSelectError.message };
      }

      const nouvelleProgression = Math.min((defi.progress || 0) + 1, defi.duree || 99);
      const nouveauStatus = nouvelleProgression >= defi.duree ? "terminé" : "en cours";

      const { error: defiUpdateError } = await supabase
        .from("defis")
        .update({
          progress: nouvelleProgression,
          status: nouveauStatus
        })
        .eq("id", defiId);

      if (defiUpdateError) {
        return { success: false, etapeValidee: true, error: defiUpdateError.message };
      }
    }

    return { success: true, etapeValidee };
  } catch (err) {
    return { success: false, etapeValidee: false, error: err.message };
  }
}

/**
 * Calcule le score au format "2/3"
 * @param {Array<{texte: string, tenu: boolean}>} engagements
 * @returns {string} Ex: "2/3"
 */
export function calculerScore(engagements) {
  if (!engagements || engagements.length === 0) return "0/0";
  const tenus = engagements.filter(e => e.tenu).length;
  return `${tenus}/${engagements.length}`;
}

/**
 * Calcule le score numérique (0 à 1)
 * @param {Array<{texte: string, tenu: boolean}>} engagements
 * @returns {number} Ex: 0.666 pour "2/3"
 */
export function calculerScoreNumerique(engagements) {
  if (!engagements || engagements.length === 0) return 0;
  const tenus = engagements.filter(e => e.tenu).length;
  return tenus / engagements.length;
}
