// Fonction utilitaire centralisée pour la validation d’un critère de préparation
// Respect strict du template : aucune logique métier dans les pages, traçabilité, audit

/**
 * Valide un critère de préparation et met à jour le localStorage
 * @param {string} id - Identifiant du critère
 * @param {string} dateValidation - Date de validation (ISO ou locale)
 * @returns {object} - Nouvel état des critères après mise à jour
 */
export function validerCriterePreparation(id, dateValidation) {
  if (!id || !dateValidation) {
    throw new Error('id et dateValidation sont requis');
  }
  // Clé partagée pour le stockage des critères
  const STORAGE_KEY = 'preparationJeuneCriteres';
  // Récupérer l’état actuel
  let criteres = {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    criteres = data ? JSON.parse(data) : {};
  } catch (e) {
    criteres = {};
  }
  // Mettre à jour le critère
  criteres[id] = {
    validé: true,
    dateValidation,
  };
  // Sauvegarder l’état mis à jour
  localStorage.setItem(STORAGE_KEY, JSON.stringify(criteres));
  return criteres;
}

/**
 * Récupère l’état actuel des critères de préparation
 * @returns {object}
 */
export function getCriteresPreparation() {
  const STORAGE_KEY = 'preparationJeuneCriteres';
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}
