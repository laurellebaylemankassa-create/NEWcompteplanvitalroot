/**
 * Calcule le jour relatif entre la date du jeûne et la date courante
 * @param {Date|string} dateJeune - Date du jeûne (objet Date ou string ISO)
 * @param {Date|string} dateCourante - Date courante (objet Date ou string ISO)
 * @returns {number} - Nombre de jours entre dateJeune et dateCourante (J-xx)
 */
export function calculerJourRelatif(dateJeune, dateCourante) {
  if (!dateJeune || !dateCourante) return null;
  const dJeune = typeof dateJeune === 'string' ? new Date(dateJeune) : dateJeune;
  const dCourante = typeof dateCourante === 'string' ? new Date(dateCourante) : dateCourante;
  // Calcul en jours, arrondi à l'entier inférieur
  return Math.floor((dJeune.setHours(0,0,0,0) - dCourante.setHours(0,0,0,0)) / (1000*60*60*24));
}
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

/**
 * Vérifie si la période de validation d'un critère est active selon le jalon et la date courante
 * @param {number} jalon - Le jalon (jour) associé au critère
 * @param {number} jourCourant - Le jour courant du parcours (ex: J-30, J-12, etc.)
 * @returns {boolean} - true si la période est active, false sinon
 */
export function isPeriodeActive(jalon, jourCourant) {
  if (typeof jalon !== 'number' || typeof jourCourant !== 'number') return false;
  // La période est active si le jour courant >= jalon
  return jourCourant >= jalon;
}
