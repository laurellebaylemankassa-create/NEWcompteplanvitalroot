// analyseRepasSynthétique.js
// Génère une analyse synthétique métier à partir des repas des 3 derniers jours

/**
 * Analyse les repas des 3 derniers jours et retourne :
 * - nb extras (sucreries, produits transformés, snacks, boissons sucrées...)
 * - nb repas après 19h
 * - total kcal/jour
 * - conseils personnalisés
 *
 * @param {Array<{date: string, repas: Array<{type: string, aliment: string, quantite: string|number, kcal: number, heure?: string}>}>} analyse3Jours
 * @returns {Array<string>} Liste de messages d'analyse synthétique
 */
export function genererAnalyseSynthétiqueRepas(analyse3Jours) {
  if (!Array.isArray(analyse3Jours) || analyse3Jours.length === 0) return ["Aucun repas trouvé sur les 3 derniers jours."];

  // Listes d'aliments considérés comme "extras" (à adapter selon le référentiel métier)
  const motsCleExtras = [
    'chips', 'glace', 'brioche', 'kinder', 'popcorn', 'sucrerie', 'bonbon', 'chocolat', 'biscuit', 'viennoiserie',
    'friture', 'soda', 'fuze tea', 'ice tea', 'jus', 'boisson sucrée', 'dessert', 'pâtisserie', 'crème dessert',
    'barre', 'snack', 'gâteau', 'coca', 'sprite', 'fanta', 'energy drink', 'red bull', 'alcool', 'bière', 'vin',
    'fromage', 'pizza', 'burger', 'sandwich', 'fast food', 'nuggets', 'saucisson', 'charcuterie', 'pâte à tartiner'
  ];
  const heureLimite = 19;
  let totalExtras = 0;
  let totalRepasTardifs = 0;
  let conseils = new Set();
  let totalKcal = 0;
  let joursAvecRepas = 0;

  for (const jour of analyse3Jours) {
    let extrasJour = 0;
    let repasTardifJour = 0;
    let kcalJour = 0;
    for (const repas of jour.repas) {
      // Détection extra
      const aliment = (repas.aliment || '').toLowerCase();
      if (motsCleExtras.some(mot => aliment.includes(mot))) {
        extrasJour++;
      }
      // Repas tardif (si heure connue)
      if (repas.heure) {
        const h = parseInt(repas.heure.split(':')[0], 10);
        if (!isNaN(h) && h >= heureLimite) {
          repasTardifJour++;
        }
      }
      // Calories
      if (repas.kcal && !isNaN(repas.kcal)) {
        kcalJour += Number(repas.kcal);
      }
    }
    if (jour.repas.length > 0) {
      joursAvecRepas++;
      totalExtras += extrasJour;
      totalRepasTardifs += repasTardifJour;
      totalKcal += kcalJour;
    }
  }

  // Conseils personnalisés
  if (totalExtras > 0) conseils.add('Réduis les extras (sucreries, snacks, boissons sucrées) pour optimiser ta préparation.');
  if (totalRepasTardifs > 0) conseils.add('Essaie d’avancer progressivement l’heure du dîner (évite les repas après 19h).');
  if (joursAvecRepas > 0 && totalKcal / joursAvecRepas > 1800) conseils.add('Attention à la charge calorique, vise des repas plus légers.');
  if (joursAvecRepas > 0 && totalKcal / joursAvecRepas < 1000) conseils.add('Veille à ne pas trop restreindre, garde de l’énergie pour la préparation.');
  if (totalExtras === 0 && totalRepasTardifs === 0) conseils.add('Bravo, tu respectes bien les recommandations ! Continue ainsi.');

  const res = [];
  res.push(`- ${totalExtras} extra(s) sur les 3 derniers jours${totalExtras > 0 ? ' (sucreries, snacks, boissons sucrées...)' : ''}`);
  res.push(`- ${totalRepasTardifs} repas après 19h`);
  if (joursAvecRepas > 0) res.push(`- Moyenne calorique estimée : ${Math.round(totalKcal / joursAvecRepas)} kcal/jour`);
  conseils.forEach(c => res.push(`- Conseil : ${c}`));
  return res;
}
