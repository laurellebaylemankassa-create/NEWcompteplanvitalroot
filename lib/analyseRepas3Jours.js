import { supabase } from '../lib/supabaseClient';

/**
 * Récupère les 3 derniers jours de repas pour l'utilisateur connecté.
 * Retourne un tableau [{ date, repas: [ ... ] }]
 */
/**
 * Récupère les 3 jours précédant une date métier (startDate) pour l'utilisateur connecté.
 * @param {string} userId
 * @param {string|Date} [dateRef] - Date de référence (format YYYY-MM-DD ou Date JS). Si non fourni, prend la date système.
 */

export async function getAnalyse3DerniersJoursRepas(userId, dateRef) {
  let ref = dateRef ? new Date(dateRef) : new Date();
  ref.setHours(0,0,0,0);
  // Générer les 3 dates précédentes (J-1, J-2, J-3)
  const joursCibles = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date(ref);
    d.setDate(ref.getDate() - i);
    joursCibles.push(d.toISOString().slice(0,10));
  }

  // --- Synchronisation localStorage <-> Supabase au premier affichage ---
  let repas = [];
  let error = null;
  let localRepas = [];
  let localRepasRaw = null;
  if (typeof window !== 'undefined') {
    try {
      localRepasRaw = window.localStorage.getItem('repas');
      if (localRepasRaw) {
        localRepas = JSON.parse(localRepasRaw);
      }
    } catch (e) { /* ignore */ }
  }
  // Si localStorage.repas est vide, on synchronise depuis Supabase
  if (!localRepas || localRepas.length === 0) {
    if (userId) {
      ({ data: repas, error } = await supabase
        .from('repas_reels')
        .select('*')
        .eq('user_id', userId)
        .in('date', joursCibles)
        .order('date', { ascending: false }));
    } else {
      ({ data: repas, error } = await supabase
        .from('repas_reels')
        .select('*')
        .in('date', joursCibles)
        .order('date', { ascending: false }));
    }
    if (repas && Array.isArray(repas) && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('repas', JSON.stringify(repas));
        localRepas = repas;
      } catch (e) { /* ignore */ }
    }
  }
  // L’analyse s’appuie toujours sur localStorage.repas (localRepas)
  const repasParJour = {};
  for (const r of localRepas) {
    const d = r.date?.slice(0, 10);
    if (!d) continue;
    if (joursCibles.includes(d)) {
      if (!repasParJour[d]) repasParJour[d] = [];
      repasParJour[d].push(r);
    }
  }
  return joursCibles.map(date => ({ date, repas: repasParJour[date] || [] }));

}
