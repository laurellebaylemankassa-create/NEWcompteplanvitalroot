import alimentsRepriseJeune from '../data/alimentsRepriseJeune';

// ═══════════════════════════════════════════════════════════
// FONCTION PRINCIPALE : GÉNÉRATION DU PROGRAMME DE REPRISE
// ═══════════════════════════════════════════════════════════

/**
 * Génère un programme complet de reprise alimentaire après jeûne
 * @param {Object} params - Paramètres du programme
 * @param {number} params.dureeJeune - Durée du jeûne en jours (3-14)
 * @param {number} params.poidsDepart - Poids au début du jeûne (kg)
 * @param {string} params.dateFin - Date de fin du jeûne (format ISO)
 * @param {Object} params.options - Options supplémentaires (facultatif)
 * @returns {Object} - Programme complet prêt pour insertion en base
 */
export function genererProgrammeReprise({ dureeJeune, poidsDepart, dateFin, options = {} }) {
  // Validation des paramètres
  if (!dureeJeune || dureeJeune < 1 || dureeJeune > 14) {
    throw new Error('Durée de jeûne invalide (doit être entre 1 et 14 jours)');
  }
  if (!dateFin) {
    throw new Error('Date de fin du jeûne requise');
  }

  // Calcul de la durée de reprise (formule médicale : jeûne × 2)
  const dureeReprise = calculerDureeReprise(dureeJeune);

  // Calcul des dates
  const dateFinJeune = new Date(dateFin);
  const dateDebutReprise = new Date(dateFinJeune);
  dateDebutReprise.setDate(dateDebutReprise.getDate() + 1); // Lendemain de fin de jeûne

  const dateFinReprise = new Date(dateDebutReprise);
  dateFinReprise.setDate(dateFinReprise.getDate() + dureeReprise - 1);

  // Découpage en 4 phases médicales
  const phases = decouperEnPhases(dureeReprise);

  // Génération des jours détaillés
  const joursDetailles = [];
  for (let jourNum = 1; jourNum <= dureeReprise; jourNum++) {
    const dateJour = new Date(dateDebutReprise);
    dateJour.setDate(dateJour.getDate() + jourNum - 1);

    // Détermination de la phase du jour
    const phase = getPhaseForJour(jourNum, phases);

    // Récupération des aliments autorisés pour cette phase
    const alimentsAutorises = getAlimentsPhase(phase);

    // Message contextuel du jour
    const messageContextuel = getMessagePhase(phase, jourNum, dureeReprise);

    joursDetailles.push({
      jour_numero: jourNum,
      date: dateJour.toISOString().split('T')[0],
      phase: phase,
      aliments_autorises: alimentsAutorises.map(a => ({
        nom: a.nom,
        categorie: a.categorie,
        portion: a.portionDefaut,
        unite: a.unite,
        conseil: a.conseil,
        favoriseCetose: a.favoriseCetose
      })),
      message_contextuel: messageContextuel
    });
  }

  // Génération de la liste de courses (7 premiers jours)
  const listeCourses = genererListeCourses(joursDetailles.slice(0, 7));

  // Construction de l'objet programme complet
  const programme = {
    duree_jeune_jours: dureeJeune,
    duree_reprise_jours: dureeReprise,
    date_debut_reprise: dateDebutReprise.toISOString().split('T')[0],
    date_fin_reprise: dateFinReprise.toISOString().split('T')[0],
    phases: {
      phase1: {
        nom: 'Liquides',
        debut: phases.phase1.debut,
        fin: phases.phase1.fin,
        objectif: 'Prévenir syndrome de réalimentation, réhydratation progressive'
      },
      phase2: {
        nom: 'Fibres douces',
        debut: phases.phase2.debut,
        fin: phases.phase2.fin,
        objectif: 'Réactivation intestinale douce, fibres cuites uniquement'
      },
      phase3: {
        nom: 'Protéines & Lipides',
        debut: phases.phase3.debut,
        fin: phases.phase3.fin,
        objectif: 'Reconstruction tissulaire, maintien cétose si souhaité'
      },
      phase4: {
        nom: 'Féculents doux',
        debut: phases.phase4.debut,
        fin: phases.phase4.fin,
        objectif: 'Réintroduction progressive glucides, sortie cétose en douceur'
      }
    },
    liste_courses: listeCourses,
    jours_detailles: joursDetailles,
    statut: 'proposition',
    options: options
  };

  return programme;
}

// ═══════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════

/**
 * Calcule la durée de reprise selon la formule médicale
 * @param {number} dureeJeune - Durée du jeûne en jours
 * @returns {number} - Durée de reprise en jours (jeûne × 2)
 */
export function calculerDureeReprise(dureeJeune) {
  return Math.ceil(dureeJeune * 2);
}

/**
 * Découpe la durée de reprise en 4 phases proportionnelles
 * Phase 1 : ~11% (Liquides)
 * Phase 2 : ~14% (Fibres douces)
 * Phase 3 : ~18% (Protéines/lipides)
 * Phase 4 : ~57% (Féculents doux)
 * 
 * @param {number} dureeReprise - Durée totale de reprise
 * @returns {Object} - Découpage en phases avec début/fin pour chaque phase
 */
export function decouperEnPhases(dureeReprise) {
  const finPhase1 = Math.ceil(dureeReprise * 0.11);
  const finPhase2 = Math.ceil(dureeReprise * 0.25);
  const finPhase3 = Math.ceil(dureeReprise * 0.43);
  const finPhase4 = dureeReprise;

  return {
    phase1: { debut: 1, fin: finPhase1 },
    phase2: { debut: finPhase1 + 1, fin: finPhase2 },
    phase3: { debut: finPhase2 + 1, fin: finPhase3 },
    phase4: { debut: finPhase3 + 1, fin: finPhase4 }
  };
}

/**
 * Détermine la phase pour un numéro de jour donné
 * @param {number} jourNum - Numéro du jour (1-based)
 * @param {Object} phases - Objet phases retourné par decouperEnPhases()
 * @returns {number} - Numéro de la phase (1-4)
 */
function getPhaseForJour(jourNum, phases) {
  if (jourNum <= phases.phase1.fin) return 1;
  if (jourNum <= phases.phase2.fin) return 2;
  if (jourNum <= phases.phase3.fin) return 3;
  return 4;
}

/**
 * Récupère les aliments autorisés pour une phase donnée
 * @param {number} phase - Numéro de la phase (1-4)
 * @returns {Array} - Tableau d'objets aliments
 */
export function getAlimentsPhase(phase) {
  return alimentsRepriseJeune.filter(aliment => aliment.phase === phase);
}

/**
 * Génère un message contextuel personnalisé selon la phase et le jour
 * @param {number} phase - Numéro de la phase (1-4)
 * @param {number} jour - Numéro du jour dans la reprise
 * @param {number} dureeReprise - Durée totale de la reprise
 * @returns {string} - Message contextuel
 */
export function getMessagePhase(phase, jour, dureeReprise) {
  const messages = {
    phase1: {
      1: `🎉 Bienvenue dans ta reprise alimentaire ! Aujourd'hui, liquides uniquement. Ton intestin se réveille en douceur. Sirote lentement, écoute ton corps.`,
      2: `💧 Jour 2 des liquides. Tu peux ressentir des gargouillements, c'est normal ! Continue les bouillons et jus filtrés. Hydratation = priorité.`,
      default: `💧 Phase liquides (J${jour}/${dureeReprise}). Garde le rythme : petites quantités, souvent. Ton système digestif te remercie !`
    },
    phase2: {
      1: `🥬 Passage aux fibres douces ! Bienvenue aux légumes cuits et poissons blancs vapeur. Mâche lentement, savoure chaque bouchée.`,
      default: `🥬 Phase fibres douces (J${jour}/${dureeReprise}). Tout doit être bien cuit, facile à digérer. Évite les crudités pour l'instant.`
    },
    phase3: {
      1: `🥚 Phase protéines & lipides ! Ton corps reconstruit ses tissus. Œufs, avocats, huiles : tes alliés pour maintenir la cétose si tu le souhaites.`,
      default: `🥚 Phase protéines & lipides (J${jour}/${dureeReprise}). Les bonnes graisses sont tes amies. Écoute ta satiété, ne force rien.`
    },
    phase4: {
      1: `🍠 Réintroduction des féculents doux ! Patate douce, riz complet, quinoa : UNIQUEMENT À MIDI. Commence petit, augmente progressivement.`,
      2: `🍠 Féculents doux (J2). Comment te sens-tu avec les glucides ? Observe ton énergie, ton sommeil. Ajuste si besoin.`,
      default: `🍠 Phase féculents doux (J${jour}/${dureeReprise}). Glucides midi uniquement. Ton corps sort doucement de la cétose. C'est normal et sain.`
    }
  };

  const phaseMessages = messages[`phase${phase}`];
  return phaseMessages[jour] || phaseMessages.default;
}

/**
 * Génère une liste de courses regroupée par catégorie
 * @param {Array} jours - Tableau des jours détaillés (généralement 7 premiers jours)
 * @returns {Array} - Liste de courses avec nom, quantité estimée, catégorie
 */
export function genererListeCourses(jours) {
  const alimentsUniques = new Map();

  // Collecte tous les aliments uniques des jours
  jours.forEach(jour => {
    jour.aliments_autorises.forEach(aliment => {
      if (!alimentsUniques.has(aliment.nom)) {
        alimentsUniques.set(aliment.nom, {
          nom: aliment.nom,
          categorie: aliment.categorie,
          portion: aliment.portion,
          unite: aliment.unite,
          phase: jour.phase,
          frequence: 1
        });
      } else {
        // Incrémente la fréquence si l'aliment apparaît plusieurs fois
        const item = alimentsUniques.get(aliment.nom);
        item.frequence += 1;
      }
    });
  });

  // Conversion en tableau et calcul des quantités
  const listeCourses = Array.from(alimentsUniques.values()).map(item => {
    let quantiteEstimee = '';

    // Estimation intelligente selon la catégorie et fréquence
    if (item.categorie === 'liquide') {
      quantiteEstimee = item.frequence >= 5 ? '2L' : '1L';
    } else if (item.categorie === 'légume') {
      quantiteEstimee = item.frequence >= 3 ? '500g' : '300g';
    } else if (item.categorie === 'protéine') {
      quantiteEstimee = item.frequence >= 3 ? '300g' : '150g';
    } else if (item.categorie === 'lipide') {
      quantiteEstimee = '1 unité';
    } else if (item.categorie === 'féculent') {
      quantiteEstimee = '500g';
    } else if (item.categorie === 'fruit') {
      quantiteEstimee = '3-4 unités';
    } else {
      quantiteEstimee = 'À prévoir';
    }

    return {
      nom: item.nom,
      quantite: quantiteEstimee,
      categorie: item.categorie,
      phase: item.phase,
      priorite: item.phase <= 2 ? 'haute' : 'normale' // Phase 1-2 = haute priorité
    };
  });

  // Tri par phase puis catégorie
  return listeCourses.sort((a, b) => {
    if (a.phase !== b.phase) return a.phase - b.phase;
    return a.categorie.localeCompare(b.categorie);
  });
}

/**
 * Valide qu'un programme est cohérent avant insertion
 * @param {Object} programme - Programme généré
 * @returns {Object} - {valide: boolean, erreurs: Array}
 */
export function validerProgramme(programme) {
  const erreurs = [];

  if (!programme.duree_jeune_jours || programme.duree_jeune_jours < 1) {
    erreurs.push('Durée de jeûne invalide');
  }

  if (!programme.duree_reprise_jours || programme.duree_reprise_jours < 1) {
    erreurs.push('Durée de reprise invalide');
  }

  if (!programme.jours_detailles || programme.jours_detailles.length === 0) {
    erreurs.push('Aucun jour généré');
  }

  if (programme.jours_detailles.length !== programme.duree_reprise_jours) {
    erreurs.push(`Incohérence : ${programme.jours_detailles.length} jours générés pour ${programme.duree_reprise_jours} jours attendus`);
  }

  if (!programme.liste_courses || programme.liste_courses.length === 0) {
    erreurs.push('Liste de courses vide');
  }

  return {
    valide: erreurs.length === 0,
    erreurs
  };
}

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

export default {
  genererProgrammeReprise,
  calculerDureeReprise,
  decouperEnPhases,
  getAlimentsPhase,
  getMessagePhase,
  genererListeCourses,
  validerProgramme
};
