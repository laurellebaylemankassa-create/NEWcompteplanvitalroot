/**
 * Helpers pour la gestion de la validation des semaines
 * Calculs d'extras, génération de feedback, détection semaines non validées
 */

// ═══════════════════════════════════════════════════════════
// HELPERS DATE JAVASCRIPT NATIF (EXPORTÉS POUR RÉUTILISATION)
// Pas de dépendance externe, gestion erreurs robuste
// ═══════════════════════════════════════════════════════════

/**
 * Formate une date selon un pattern spécifié
 * @param {Date|string} date - Date à formater
 * @param {string} formatStr - Pattern de format
 * @returns {string} - Date formatée ou string vide si invalide
 */
export function formatDate(date, formatStr) {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return ''; // Date invalide
    
    const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const mois = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
    const moisComplet = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    
    if (formatStr === 'yyyy-MM-dd') {
      // Utiliser heure locale au lieu de UTC
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    if (formatStr === "d MMMM yyyy 'à' HH:mm") {
      const jour = d.getDate();
      const moisNom = moisComplet[d.getMonth()];
      const annee = d.getFullYear();
      const heure = String(d.getHours()).padStart(2, '0');
      const minute = String(d.getMinutes()).padStart(2, '0');
      return `${jour} ${moisNom} ${annee} à ${heure}:${minute}`;
    }
    if (formatStr === 'd MMMM yyyy') {
      const jour = d.getDate();
      const moisNom = moisComplet[d.getMonth()];
      const annee = d.getFullYear();
      return `${jour} ${moisNom} ${annee}`;
    }
    if (formatStr === 'EEEE d MMM') {
      return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]}`;
    }
    if (formatStr === 'd MMM') {
      return `${d.getDate()} ${mois[d.getMonth()]}`;
    }
    if (formatStr === 'd MMM yyyy') {
      return `${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`;
    }
    return d.toISOString();
  } catch (error) {
    console.error('Erreur formatDate:', error);
    return '';
  }
}

/**
 * Retourne le lundi de la semaine d'une date donnée
 * @param {Date|string} date - Date de référence
 * @returns {Date} - Lundi de la semaine (00:00:00)
 */
export function getMonday(date) {
  try {
    // Si c'est une string au format YYYY-MM-DD, créer la date en heure locale
    let d;
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number);
      d = new Date(year, month - 1, day, 12, 0, 0); // Midi pour éviter les problèmes de fuseau
    } else {
      d = new Date(date);
    }
    if (isNaN(d.getTime())) throw new Error('Date invalide');
    
    const day = d.getDay();
    // Calcul correct : dimanche (0) → -6 jours, lundi (1) → 0 jours, mardi (2) → -1 jour, etc.
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(d); // Créer nouvelle instance AVANT setDate
    monday.setDate(d.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    return monday;
  } catch (error) {
    console.error('Erreur getMonday:', error);
    return new Date(); // Fallback: aujourd'hui
  }
}

/**
 * Ajoute des jours à une date
 * @param {Date|string} date - Date de départ
 * @param {number} days - Nombre de jours (peut être négatif)
 * @returns {Date} - Nouvelle date
 */
export function addDays(date, days) {
  try {
    const result = new Date(date);
    if (isNaN(result.getTime())) throw new Error('Date invalide');
    result.setDate(result.getDate() + days);
    return result;
  } catch (error) {
    console.error('Erreur addDays:', error);
    return new Date();
  }
}

/**
 * Vérifie si une date est dans un intervalle
 * @param {Date|string} date - Date à tester
 * @param {Date|string} start - Date de début (inclusive)
 * @param {Date|string} end - Date de fin (inclusive)
 * @returns {boolean}
 */
export function isDateInRange(date, start, end) {
  try {
    const d = new Date(date);
    const s = new Date(start);
    const e = new Date(end);
    
    if (isNaN(d.getTime()) || isNaN(s.getTime()) || isNaN(e.getTime())) {
      return false;
    }
    
    return d >= s && d <= e;
  } catch (error) {
    console.error('Erreur isDateInRange:', error);
    return false;
  }
}

/**
 * Calcule les extras d'une semaine donnée
 * @param {string} weekStart - Date de début de semaine (format ISO "YYYY-MM-DD")
 * @param {Array} repasReels - Liste complète des repas avec tags fast-food
 * @returns {Object} - { count: number, details: Array, variation: number }
 */
export function calculerExtrasSemaine(weekStart, repasReels) {
  if (!weekStart || !repasReels || !Array.isArray(repasReels)) {
    return { count: 0, details: [], variation: 0 };
  }

  try {
    const debut = new Date(weekStart);
    const fin = addDays(debut, 6); // Lundi à Dimanche (7 jours)

    // Filtrer les repas de la semaine
    const repasDesSemaine = repasReels.filter(repas => {
      const dateRepas = new Date(repas.date);
      return isDateInRange(dateRepas, debut, fin);
    });

    // Détecter les extras selon la vraie définition métier : est_extra === true
    const extras = repasDesSemaine.filter(repas => repas.est_extra === true);

    // Construire les détails
    const details = extras.map(extra => ({
      type: 'extra',
      nom: extra.nom || extra.description || extra.aliment || 'Extra',
      date: extra.date,
      moment: extra.moment || 'inconnu', // Déjeuner, Dîner, etc.
      kcal: extra.kcal || 0,
    }));

    return {
      count: details.length,
      details: details,
      variation: 0, // Sera calculé lors de l'enregistrement (comparaison avec semaine précédente)
    };
  } catch (error) {
    console.error('Erreur calculerExtrasSemaine:', error);
    return { count: 0, details: [], variation: 0 };
  }
}

/**
 * Génère un message de feedback personnalisé selon le nombre d'extras
 * @param {number} extrasCount - Nombre d'extras détectés
 * @param {number} quota - Quota d'extras autorisés (par défaut 2)
 * @returns {string} - Message personnalisé
 */
export function genererMessageFeedback(extrasCount, quota = 2) {
  if (extrasCount === 0) {
    return "🎉 Incroyable ! Aucun extra cette semaine, c'est parfait !";
  }

  if (extrasCount === 1) {
    return "👏 Excellent travail ! 1 seul extra, tu restes dans le quota.";
  }

  if (extrasCount <= quota) {
    return `✅ Bravo ! ${extrasCount} extras, quota respecté (${quota} max).`;
  }

  if (extrasCount === quota + 1) {
    return `⚠️ Attention : ${extrasCount} extras, léger dépassement du quota (${quota} max).`;
  }

  // Dépassement significatif
  const difference = extrasCount - quota;
  return `🚨 Dépassement : ${extrasCount} extras au lieu de ${quota} max (+${difference}). Reprends le contrôle la semaine prochaine !`;
}

/**
 * Calcule la variation d'extras par rapport à la semaine précédente
 * @param {number} extrasActuels - Extras de la semaine actuelle
 * @param {Array} semainesValidees - Liste des semaines déjà validées
 * @param {string} weekStart - Date de début de semaine actuelle
 * @returns {number} - Variation (ex: +1, -2, 0)
 */
export function calculerVariation(extrasActuels, semainesValidees, weekStart) {
  if (!semainesValidees || semainesValidees.length === 0) {
    return 0; // Première semaine validée
  }

  try {
    const dateActuelle = new Date(weekStart);
    
    // Trouver la semaine précédente validée (la plus récente avant weekStart)
    const semainePrecedente = semainesValidees
      .filter(s => new Date(s.weekStart) < dateActuelle)
      .sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart))[0];

    if (!semainePrecedente || semainePrecedente.extras_count === null) {
      return 0;
    }

    return extrasActuels - semainePrecedente.extras_count;
  } catch (error) {
    console.error('Erreur calculerVariation:', error);
    return 0;
  }
}

/**
 * Récupère les semaines non validées parmi les N dernières semaines
 * @param {Array} semainesValidees - Liste des semaines déjà validées
 * @param {number} nbSemaines - Nombre de semaines à analyser (par défaut 4)
 * @returns {Array} - Liste des semaines non validées avec infos
 */
export function getSemainesNonValidees(semainesValidees = [], nbSemaines = 4) {
  try {
    const aujourdHui = new Date();
    const semaines = [];

    // Générer les N dernières semaines (lundi de chaque semaine)
    for (let i = 0; i < nbSemaines; i++) {
      const dateSemaine = addDays(aujourdHui, -7 * i);
      const lundi = getMonday(dateSemaine);
      const lundiFormate = formatDate(lundi, 'yyyy-MM-dd');

      // Vérifier si déjà validée (présence dans la table = validée)
      const estValidee = semainesValidees.some(
        s => s.semaine_debut === lundiFormate || s.weekStart === lundiFormate
      );

      if (!estValidee) {
        // Calculer le label de la semaine
        const finSemaine = addDays(lundi, 6);
        const label = `${formatDate(lundi, 'd MMM')} - ${formatDate(finSemaine, 'd MMM yyyy')}`;

        semaines.push({
          weekStart: lundiFormate,
          label,
          estSemaineActuelle: i === 0,
        });
      }
    }

    return semaines;
  } catch (error) {
    console.error('Erreur getSemainesNonValidees:', error);
    return [];
  }
}

/**
 * Formatte les détails d'extras pour affichage
 * @param {Array} details - Liste des détails d'extras
 * @returns {string} - Texte formatté pour affichage
 */
export function formatterDetailsExtras(details) {
  if (!details || details.length === 0) {
    return 'Aucun extra détecté';
  }

  return details
    .map((extra, index) => {
      const dateFormatee = formatDate(new Date(extra.date), 'EEEE d MMM');
      return `${index + 1}. ${extra.nom} - ${dateFormatee} (${extra.moment})`;
    })
    .join('\n');
}

/**
 * Détermine l'emoji selon la performance de la semaine
 * @param {number} extrasCount - Nombre d'extras
 * @param {number} quota - Quota autorisé
 * @returns {string} - Emoji représentatif
 */
export function getEmojiPerformance(extrasCount, quota = 2) {
  if (extrasCount === 0) return '🏆';
  if (extrasCount <= quota) return '✅';
  if (extrasCount === quota + 1) return '⚠️';
  return '🚨';
}

/**
 * Génère un message pour validation multiple (batch)
 * @param {number} nbSemainesValidees - Nombre de semaines validées d'un coup
 * @param {number} extrasTotal - Total d'extras sur toutes les semaines
 * @returns {string} - Message de synthèse
 */
export function genererMessageBatch(nbSemainesValidees, extrasTotal) {
  if (nbSemainesValidees === 0) {
    return 'Aucune semaine sélectionnée';
  }

  if (nbSemainesValidees === 1) {
    return '1 semaine validée avec succès';
  }

  return `${nbSemainesValidees} semaines validées avec succès (${extrasTotal} extras au total)`;
}

/**
 * Calcule la tendance pondérale sur 7 jours (semaine courante)
 * @param {number} apportsTotaux - Total des apports de la semaine (kcal)
 * @param {number} objectifHebdo - Objectif hebdomadaire (kcal)
 * @returns {Object} - { type: 'perte'|'maintien'|'surplus', ecart: number, label: string, couleur: string, verbatim: string }
 */
export function calculerTendance7j(apportsTotaux, objectifHebdo) {
  // Sécurité : si objectif à 0, retourner tendance neutre
  if (!objectifHebdo || objectifHebdo === 0) {
    return {
      type: 'neutre',
      ecart: 0,
      projection_poids: 0,
      label: '—',
      couleur: '#94a3b8',
      verbatim: 'Aucune donnée disponible pour cette semaine.',
      projection: '—'
    };
  }
  
  const ecart = apportsTotaux - objectifHebdo;
  
  // Calcul projection poids : 7700 kcal = 1 kg de masse grasse
  const projectionGrammes = Math.round((ecart / 7700) * 1000);
  const projectionTexte = Math.abs(projectionGrammes) >= 1000 
    ? `${(projectionGrammes / 1000).toFixed(1)}kg`
    : `${projectionGrammes}g`;
  
  // Seuils métier : -200 / +200 kcal
  if (ecart < -200) {
    return {
      type: 'perte',
      ecart: Math.round(ecart),
      projection_poids: projectionGrammes,
      label: '📉 Tendance perte',
      couleur: '#27ae60', // Vert
      verbatim: `Tu es en déficit de ${Math.abs(Math.round(ecart))} kcal cette semaine. Trajectoire favorable à la perte de poids.`,
      projection: `Projection : environ ${projectionTexte} cette semaine`
    };
  } else if (ecart > 200) {
    return {
      type: 'surplus',
      ecart: Math.round(ecart),
      projection_poids: projectionGrammes,
      label: '📈 Tendance surplus',
      couleur: '#e74c3c', // Rouge
      verbatim: `Tu es en excédent de ${Math.round(ecart)} kcal cette semaine. Attention à l'éloignement de l'objectif.`,
      projection: `Projection : environ +${projectionTexte} cette semaine`
    };
  } else {
    return {
      type: 'maintien',
      ecart: Math.round(ecart),
      projection_poids: projectionGrammes,
      label: '➡️ Tendance maintien',
      couleur: '#f39c12', // Orange
      verbatim: `Tu es proche de l'équilibre (${ecart >= 0 ? '+' : ''}${Math.round(ecart)} kcal). Stabilité observée cette semaine.`,
      projection: `Projection : environ ${ecart >= 0 ? '+' : ''}${projectionTexte} cette semaine`
    };
  }
}

/**
 * Calcule la comparaison N/N-1 avec verbatims adaptatifs
 * @param {number} ecartN - Écart semaine actuelle
 * @param {number} ecartN1 - Écart semaine précédente
 * @param {string} tendanceN - Type tendance semaine N ('perte'|'maintien'|'surplus')
 * @param {string} weekStartN - Date début semaine N (format YYYY-MM-DD)
 * @param {object} supabase - Client Supabase
 * @returns {Promise<object>} - {type, evolution, verbatim, couleur, badge, renforcementVerbatim}
 */
export async function calculerComparaisonN1(ecartN, ecartN1, tendanceN, weekStartN, supabase) {
  const evolution = ecartN - ecartN1;
  const seuil = 100; // Variation < 100 kcal = reproduction
  
  // Verbatims base pour rotation aléatoire
  const verbatimsRapprochement = [
    "L'écart avec l'objectif diminue. **Bravo**, le comportement se rapproche de la cible. Continue comme ça ! 🌟",
    "L'écart avec l'objectif diminue. **Excellent**, le corps perçoit un ajustement dans la bonne direction. Tu avances bien ! ✨",
    "L'écart avec l'objectif diminue. **Belle progression**, le déséquilibre s'atténue. La direction est la bonne ! 💪"
  ];
  
  const verbatimsEloignement = [
    "L'écart avec l'objectif augmente. **Vigilance** : l'écart s'est creusé. **Mais tu peux reprendre la main dès cette semaine** ! 💪",
    "L'écart avec l'objectif augmente. **Attention** : le corps perçoit un déséquilibre plus important. **Un ajustement maintenant peut tout changer** ! 🔄",
    "L'écart avec l'objectif augmente. **Alerte douce** : le déséquilibre s'accentue. **Tu as les ressources pour corriger le tir** ! 🎯"
  ];
  
  const verbatimsReproductionPositif = [
    "L'écart avec l'objectif reste identique. **Bravo pour la régularité**, tu maintiens un bon niveau ! ✅",
    "L'écart avec l'objectif est stable. **Belle constance**, le corps perçoit une continuité positive ! 🌿",
    "L'écart avec l'objectif se reproduit. **Continue**, cette stabilité est une force dans ton contexte ! 💚"
  ];
  
  const verbatimsReproductionNegatif = [
    "L'écart avec l'objectif reste similaire. **C'est le moment d'ajuster** : un petit changement peut faire la différence ! 🔄",
    "L'écart avec l'objectif se maintient. **On peut reprendre la main** : tu as toutes les cartes en main ! 💡",
    "L'écart avec l'objectif se répète. **Nouvelle semaine, nouvelle opportunité** : un ajustement suffit pour relancer ! 🚀"
  ];
  
  // Verbatims renforcés (3 semaines consécutives)
  const verbatimsRenforcementRapprochement = [
    "Depuis plusieurs semaines, un nouveau schéma se met en place. **Félicitations**, la trajectoire se réaligne durablement ! 🎯",
    "La direction prise montre une constance remarquable. **Continue**, le corps perçoit un ajustement profond ! 🔥",
    "Depuis plusieurs semaines, la trajectoire revient vers l'équilibre. **C'est exactement ça**, tu poses de nouvelles bases ! 🌱"
  ];
  
  const verbatimsRenforcementEloignement = [
    "Depuis plusieurs semaines, un schéma se cristallise. **C'est un signal important** : la trajectoire s'éloigne. **Mais rien n'est figé** : reprends la direction dès maintenant ! 🚀",
    "Un schéma commence à se fixer. **Ne laisse pas cela s'installer** : tu es capable de réajuster. **Chaque semaine compte** ! 💡",
    "Depuis plusieurs semaines, le corps répète le même schéma. **Il est temps de changer la donne** : tu as tout pour retrouver l'équilibre recherché ! 🌱"
  ];
  
  const verbatimsRenforcementReproduction = [
    "Depuis plusieurs semaines, le même niveau se maintient. **Prenons un nouveau départ** : il est temps de réajuster pour retrouver l'équilibre ! 🔧",
    "Un schéma de continuité s'installe. **Tu peux inverser la tendance** : chaque semaine est une chance de reprendre la direction ! 💪"
  ];
  
  // Fonction helper : sélection aléatoire
  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  
  // Détection pattern 3 semaines consécutives
  let patternDetecte = null;
  if (supabase) {
    try {
      const dateN = new Date(weekStartN);
      const dateN1 = new Date(dateN);
      dateN1.setDate(dateN1.getDate() - 7);
      const dateN2 = new Date(dateN);
      dateN2.setDate(dateN2.getDate() - 14);
      
      const weekStartN1 = formatDate(dateN1, 'yyyy-MM-dd');
      const weekStartN2 = formatDate(dateN2, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('semaines_validees')
        .select('tendance_7j, ecart_hebdo')
        .in('weekStart', [weekStartN2, weekStartN1])
        .order('weekStart', { ascending: false });
      
      if (!error && data && data.length === 2) {
        const [n1Data, n2Data] = data;
        
        // Détection 3 semaines surplus
        if (tendanceN === 'surplus' && n1Data.tendance_7j === 'surplus' && n2Data.tendance_7j === 'surplus') {
          patternDetecte = 'eloignement_3semaines';
        }
        // Détection 3 semaines amélioration (écart diminue)
        else if (evolution < -seuil && 
                 n1Data.ecart_hebdo < n2Data.ecart_hebdo && 
                 ecartN < n1Data.ecart_hebdo) {
          patternDetecte = 'rapprochement_3semaines';
        }
        // Détection 3 semaines reproduction surplus
        else if (Math.abs(evolution) < seuil && 
                 tendanceN === 'surplus' && 
                 n1Data.tendance_7j === 'surplus') {
          patternDetecte = 'reproduction_3semaines';
        }
      }
    } catch (err) {
      console.error('[Comparaison N/N-1] Erreur détection pattern:', err);
    }
  }
  
  // Détermination type et verbatim
  let type, verbatim, couleur, badge, renforcementVerbatim = null, evolutionTexte = '';
  
  if (evolution < -seuil) {
    // RAPPROCHEMENT
    type = 'rapprochement';
    verbatim = pickRandom(verbatimsRapprochement);
    couleur = '#27ae60'; // Vert
    badge = '✨ Amélioration';
    evolutionTexte = `📉 Cette semaine, l'écart se réduit de ${Math.abs(evolution)} kcal comparé à la semaine dernière`;
    if (patternDetecte === 'rapprochement_3semaines') {
      renforcementVerbatim = pickRandom(verbatimsRenforcementRapprochement);
    }
  } else if (evolution > seuil) {
    // ÉLOIGNEMENT
    type = 'eloignement';
    verbatim = pickRandom(verbatimsEloignement);
    couleur = '#e74c3c'; // Rouge
    badge = '⚠️ Éloignement';
    evolutionTexte = `📈 Cette semaine, l'écart s'intensifie de ${Math.abs(evolution)} kcal comparé à la semaine dernière`;
    if (patternDetecte === 'eloignement_3semaines') {
      renforcementVerbatim = pickRandom(verbatimsRenforcementEloignement);
    }
  } else {
    // REPRODUCTION
    const isPositif = tendanceN === 'perte' || tendanceN === 'maintien';
    type = isPositif ? 'reproduction_positif' : 'reproduction_negatif';
    verbatim = pickRandom(isPositif ? verbatimsReproductionPositif : verbatimsReproductionNegatif);
    couleur = isPositif ? '#27ae60' : '#f39c12'; // Vert ou Orange
    badge = isPositif ? '✅ Continuité positive' : '➡️ Continuité';
    evolutionTexte = `➡️ Cette semaine, l'écart reste stable : variation de seulement ${Math.abs(evolution)} kcal comparé à la semaine dernière`;
    if (patternDetecte === 'reproduction_3semaines') {
      renforcementVerbatim = pickRandom(verbatimsRenforcementReproduction);
    }
  }
  
  return {
    type,
    evolution: Math.round(evolution),
    evolutionTexte,
    verbatim,
    couleur,
    badge,
    renforcementVerbatim,
    ecartN1: Math.round(ecartN1),
    ecartN: Math.round(ecartN)
  };
}

/**
 * Catégorise un moment de la journée selon le type de repas
 * @param {string} type - Type de repas (Petit-déjeuner, Déjeuner, Dîner, Collation, etc.)
 * @returns {string} - 'matin' | 'apresmidi' | 'soir' | 'nuit'
 */
export function categoriserMomentJournee(type) {
  if (!type) return 'inconnu';
  
  const typeNormalized = type.toLowerCase().trim();
  
  // Mapping type repas → moment journée
  if (typeNormalized.includes('petit') || typeNormalized.includes('déjeuner') && typeNormalized.includes('petit')) {
    return 'matin';
  }
  if (typeNormalized.includes('déjeuner') || typeNormalized.includes('lunch') || typeNormalized.includes('midi')) {
    return 'apresmidi';
  }
  if (typeNormalized.includes('dîner') || typeNormalized.includes('diner') || typeNormalized.includes('souper')) {
    return 'soir';
  }
  if (typeNormalized.includes('collation') || typeNormalized.includes('goûter') || typeNormalized.includes('snack')) {
    // Pour les collations, on suppose après-midi par défaut (goûter typique)
    return 'apresmidi';
  }
  
  return 'inconnu';
}

/**
 * Calcule la répartition des extras par moment de journée
 * @param {Array} repasExtras - Liste des repas extras avec type
 * @returns {Object} - { matin: number, apresmidi: number, soir: number, nuit: number }
 */
export function calculerRepartitionExtrasTemporelle(repasExtras) {
  const repartition = { matin: 0, apresmidi: 0, soir: 0, nuit: 0 };
  
  if (!repasExtras || !Array.isArray(repasExtras)) {
    return repartition;
  }
  
  repasExtras.forEach(repas => {
    if (repas.type) {
      const moment = categoriserMomentJournee(repas.type);
      if (moment !== 'inconnu' && repartition.hasOwnProperty(moment)) {
        repartition[moment]++;
      }
    }
  });
  
  return repartition;
}

// ═══════════════════════════════════════════════════════════
// LECTURE A — RÉPARTITION JOURS VS OBJECTIF
// Ajouté le : 01/02/2026
// Conforme à : /docs/maj bilan hebdo Section 3
// ═══════════════════════════════════════════════════════════

/**
 * Catégorise chaque jour de la semaine selon son écart avec l'objectif journalier.
 * Détecte également les jours incomplets (< 2 repas ou kcal suspicieusement bas).
 * 
 * @param {Array} repasReels - Tous les repas de l'utilisateur (avec date, kcal, type)
 * @param {string} weekStart - Date début semaine (format YYYY-MM-DD)
 * @param {number} objectifHebdo - Objectif calorique hebdomadaire (ex: 12110)
 * 
 * @returns {Object} {
 *   objectifJournalier: number,
 *   joursCategories: { sous: number, proches: number, legerDepassement: number, debordement: number },
 *   joursIncomplets: number,
 *   detailsJours: [{ date: string, kcal_total: number, ecart: number, categorie: string, incomplet: boolean }],
 *   longestStreak: number,
 *   streaks: number[]
 * }
 */
export function calculerRepartitionJours(repasReels, weekStart, objectifHebdo) {
  // 1. Validation paramètres
  if (!repasReels || !Array.isArray(repasReels) || !weekStart || !objectifHebdo) {
    console.error('[calculerRepartitionJours] Paramètres invalides', { repasReels, weekStart, objectifHebdo });
    return {
      objectifJournalier: 0,
      joursCategories: { sous: 0, proches: 0, legerDepassement: 0, debordement: 0 },
      joursIncomplets: 0,
      detailsJours: [],
      longestStreak: 0,
      streaks: []
    };
  }

  // 2. Initialisation
  const objectifJournalier = Math.round(objectifHebdo / 7);
  const joursCategories = {
    sous: 0,
    proches: 0,
    legerDepassement: 0,
    debordement: 0
  };
  let joursIncomplets = 0;
  const detailsJours = [];

  // 3. Filtrer repas valides uniquement
  const repasValides = repasReels.filter(r => {
    if (!r.date || r.kcal === undefined || r.kcal === null) {
      console.warn('[calculerRepartitionJours] Repas invalide ignoré:', r);
      return false;
    }
    return true;
  });

  // 4. Parcourir les 7 jours de la semaine
  const mondayDate = new Date(weekStart);
  
  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(mondayDate, i);
    const dateStr = formatDate(currentDate, 'yyyy-MM-dd');
    
    // Filtrer repas du jour
    const repasDuJour = repasValides.filter(r => r.date === dateStr);
    
    // Calculer total kcal du jour
    const kcal_total = repasDuJour.reduce((sum, r) => sum + (r.kcal || 0), 0);
    
    // Détecter jour incomplet (≥ 2 repas et ≥ 800 kcal = données fiables)
    const incomplet = repasDuJour.length < 2 || kcal_total < 800;
    if (incomplet) {
      joursIncomplets++;
    }
    
    // Calculer écart avec objectif
    const ecart = kcal_total - objectifJournalier;
    
    // Catégoriser selon seuils métier - SEULEMENT si jour complet
    // Les jours incomplets ne sont PAS catégorisés (évite biais statistique)
    let categorie = incomplet ? 'incomplet' : '';
    
    if (!incomplet) {
      if (ecart <= -100) {
        categorie = 'sous';
        joursCategories.sous++;
      } else if (ecart > -100 && ecart < 100) {
        categorie = 'proche';
        joursCategories.proches++;
      } else if (ecart >= 100 && ecart < 300) {
        categorie = 'legerDepassement';
        joursCategories.legerDepassement++;
      } else {
        categorie = 'debordement';
        joursCategories.debordement++;
      }
    }
    
    // Ajouter aux détails
    detailsJours.push({
      date: dateStr,
      kcal_total,
      ecart: Math.round(ecart),
      categorie,
      incomplet
    });
  }

  // 5. Détecter streaks réussis (jours consécutifs alignés)
  const streaksData = detecterStreaksReussis(detailsJours);

  return {
    objectifJournalier,
    joursCategories,
    joursIncomplets,
    detailsJours,
    longestStreak: streaksData.longestStreak,
    streaks: streaksData.streaks
  };
}

/**
 * Détecte les séries de jours consécutifs alignés avec l'objectif (catégorie 'sous' ou 'proche').
 * Un streak est une série de ≥2 jours consécutifs conformes.
 * 
 * @param {Array} detailsJours - Liste des jours avec leur catégorie
 * @returns {Object} { longestStreak: number, streaks: number[] }
 */
function detecterStreaksReussis(detailsJours) {
  if (!detailsJours || detailsJours.length === 0) {
    return { longestStreak: 0, streaks: [] };
  }

  let streaks = [];
  let currentStreak = 0;

  detailsJours.forEach(jour => {
    // Jour aligné = catégorie 'sous' ou 'proche'
    if (jour.categorie === 'sous' || jour.categorie === 'proche') {
      currentStreak++;
    } else {
      // Fin du streak, enregistrer si ≥2 jours
      if (currentStreak >= 2) {
        streaks.push(currentStreak);
      }
      currentStreak = 0;
    }
  });

  // Gérer le dernier streak (si la semaine se termine sur un streak)
  if (currentStreak >= 2) {
    streaks.push(currentStreak);
  }

  // Retourner le plus long streak
  const longestStreak = streaks.length > 0 ? Math.max(...streaks) : 0;

  return {
    longestStreak,
    streaks
  };
}

// ═══════════════════════════════════════════════════════════
// LECTURE B — JOUR(S) QUI PÈSENT DANS L'ÉCART
// Ajouté le : 01/02/2026
// Conforme à : /docs/maj bilan hebdo Section 4
// ═══════════════════════════════════════════════════════════

/**
 * Identifie le(s) jour(s) qui pèsent le plus dans l'écart hebdomadaire.
 * Distingue si l'excédent est concentré sur un jour ou diffus sur plusieurs jours.
 * 
 * @param {Array} detailsJours - Détails des 7 jours avec écarts
 * 
 * @returns {Object|null} {
 *   surplusTotal: number,
 *   jourPlusLourd: { date: string, ecart: number, part: number },
 *   repartition: 'concentre' | 'fort' | 'diffus'
 * } ou null si aucun surplus
 */
export function calculerImpactJours(detailsJours) {
  // 1. Validation paramètres
  if (!detailsJours || !Array.isArray(detailsJours) || detailsJours.length === 0) {
    console.error('[calculerImpactJours] Paramètres invalides', { detailsJours });
    return null;
  }

  // 2. Filtrer jours avec écart positif uniquement
  const joursExcedent = detailsJours.filter(j => j.ecart > 0);

  // 3. Si aucun surplus, retourner null
  if (joursExcedent.length === 0) {
    return null;
  }

  // 4. Calculer surplus total
  const surplusTotal = joursExcedent.reduce((sum, j) => sum + j.ecart, 0);

  // 5. Identifier jour le plus lourd
  const jourPlusLourd = joursExcedent.reduce((max, j) => 
    j.ecart > max.ecart ? j : max
  , joursExcedent[0]);

  // 6. Calculer part du jour le plus lourd (0-1)
  const part = jourPlusLourd.ecart / surplusTotal;

  // 7. Catégoriser répartition selon seuils métier
  let repartition = '';
  if (part >= 0.5) {
    repartition = 'concentre'; // ≥50% sur un jour
  } else if (part >= 0.3) {
    repartition = 'fort'; // 30-50% sur un jour
  } else {
    repartition = 'diffus'; // <30% sur un jour
  }

  return {
    surplusTotal: Math.round(surplusTotal),
    jourPlusLourd: {
      date: jourPlusLourd.date,
      ecart: Math.round(jourPlusLourd.ecart),
      part: Math.round(part * 100) / 100 // Arrondi 2 décimales
    },
    repartition
  };
}

// ═══════════════════════════════════════════════════════════
// LECTURE C — ÉVOLUTION EXTRAS VS SEMAINE PRÉCÉDENTE
// Ajouté le : 01/02/2026
// Conforme à : /docs/maj bilan hebdo Section 5
// ═══════════════════════════════════════════════════════════

/**
 * Compare les extras de la semaine N avec la semaine N-1.
 * Détermine la tendance : progrès (moins d'extras), stable, ou plus présent.
 * 
 * @param {number} extrasKcalN - Kcal extras semaine N
 * @param {number} extrasNbN - Nombre extras semaine N
 * @param {number} extrasKcalN1 - Kcal extras semaine N-1 (peut être null si première semaine)
 * @param {number} extrasNbN1 - Nombre extras semaine N-1 (peut être null si première semaine)
 * 
 * @returns {Object|null} {
 *   deltaKcal: number,
 *   deltaNb: number,
 *   tendanceExtras: 'progres' | 'stable' | 'plus_present'
 * } ou null si N-1 absente
 */
export function calculerEvolutionExtras(extrasKcalN, extrasNbN, extrasKcalN1, extrasNbN1) {
  // 1. Validation : Si N-1 absente, impossible de comparer
  if (extrasKcalN1 === null || extrasKcalN1 === undefined || 
      extrasNbN1 === null || extrasNbN1 === undefined) {
    console.warn('[calculerEvolutionExtras] Semaine N-1 absente, comparaison impossible');
    return null;
  }

  // 2. Validation paramètres N
  if (extrasKcalN === null || extrasKcalN === undefined ||
      extrasNbN === null || extrasNbN === undefined) {
    console.error('[calculerEvolutionExtras] Données semaine N invalides', { extrasKcalN, extrasNbN });
    return null;
  }

  // 3. Calculer deltas
  const deltaKcal = extrasKcalN - extrasKcalN1;
  const deltaNb = extrasNbN - extrasNbN1;

  // 4. Déterminer tendance selon seuils métier
  let tendanceExtras = '';
  
  if (deltaKcal < -100 && deltaNb < 0) {
    // Progrès net : moins de kcal ET moins d'extras
    tendanceExtras = 'progres';
  } else if (Math.abs(deltaKcal) <= 100 && Math.abs(deltaNb) <= 1) {
    // Stable : variation faible en kcal ET en nombre
    tendanceExtras = 'stable';
  } else {
    // Plus présent : augmentation kcal OU nombre
    tendanceExtras = 'plus_present';
  }

  return {
    deltaKcal: Math.round(deltaKcal),
    deltaNb: Math.round(deltaNb),
    tendanceExtras
  };
}

// ═══════════════════════════════════════════════════════════
// SECTION D — ANALYSE DES FRAGILITÉS
// Ajouté le : 01/02/2026
// Enrichissement utilisateur : Typologie repas problématiques
// ═══════════════════════════════════════════════════════════

/**
 * Analyse les jours de débordement pour identifier les patterns problématiques.
 * Extrait les repas les plus lourds et détecte la typologie de problème.
 * 
 * @param {Array} detailsJours - Détails des 7 jours avec catégories
 * @param {Array} repasReels - Tous les repas de la semaine
 * 
 * @returns {Object|null} {
 *   joursDebordement: [{ date, kcal_total, ecart, repasProblematiques }],
 *   typologieProblematique: 'cumul_repas_extras' | 'extras_nombreux' | 'repas_trop_lourds',
 *   momentFragile: 'soir' | 'dejeuner' | 'apres-midi' | 'nuit'
 * } ou null si aucun débordement
 */
export function analyserFragilites(detailsJours, repasReels) {
  // 1. Validation paramètres
  if (!detailsJours || !Array.isArray(detailsJours) || !repasReels || !Array.isArray(repasReels)) {
    console.error('[analyserFragilites] Paramètres invalides', { detailsJours, repasReels });
    return null;
  }

  // 2. Identifier jours de débordement (catégorie === 'debordement')
  const joursDebordement = detailsJours.filter(j => j.categorie === 'debordement');

  // 3. Si aucun débordement, retourner null
  if (joursDebordement.length === 0) {
    return null;
  }

  // 4. Pour chaque jour problématique, extraire top 3 repas les plus lourds
  const fragilites = joursDebordement.map(jour => {
    const repasDuJour = repasReels.filter(r => r.date === jour.date);
    
    // Trier par kcal décroissant et prendre top 3
    const repasProblematiques = repasDuJour
      .sort((a, b) => (b.kcal || 0) - (a.kcal || 0))
      .slice(0, 3)
      .map(r => ({
        type: r.type || 'Inconnu',
        kcal: r.kcal || 0,
        aliment: r.aliment || 'Non renseigné',
        est_extra: r.est_extra || false
      }));

    return {
      date: jour.date,
      kcal_total: jour.kcal_total,
      ecart: jour.ecart,
      repasProblematiques
    };
  });

  // 5. Détecter typologie problématique
  let typologie = null;
  let momentFragile = null;

  // Compter extras et repas lourds sur tous les jours problématiques
  let totalExtras = 0;
  let totalRepasLourds = 0;
  const momentsExtras = [];

  fragilites.forEach(f => {
    f.repasProblematiques.forEach(r => {
      if (r.est_extra) {
        totalExtras++;
        // Extraire moment si possible (basé sur type de repas)
        const moment = extraireMomentFromType(r.type);
        if (moment) momentsExtras.push(moment);
      }
      if (!r.est_extra && r.kcal >= 800) {
        totalRepasLourds++;
      }
    });
  });

  // Déterminer typologie selon patterns détectés
  if (totalExtras >= 2 && totalRepasLourds >= 1) {
    typologie = 'cumul_repas_extras';
  } else if (totalExtras >= 3) {
    typologie = 'extras_nombreux';
    // Identifier moment fragile si plusieurs extras
    momentFragile = getMomentDominant(momentsExtras);
  } else if (totalRepasLourds >= 2) {
    typologie = 'repas_trop_lourds';
  }

  return {
    joursDebordement: fragilites,
    typologieProblematique: typologie,
    momentFragile
  };
}

/**
 * Extrait le moment de la journée depuis le type de repas.
 * @param {string} type - Type de repas (Petit-déjeuner, Déjeuner, Dîner, Collation, etc.)
 * @returns {string|null} - 'matin' | 'apresmidi' | 'soir' | 'nuit' ou null
 */
function extraireMomentFromType(type) {
  if (!type) return null;
  
  const typeNormalized = type.toLowerCase().trim();
  
  if (typeNormalized.includes('petit') || typeNormalized.includes('matin')) {
    return 'matin';
  }
  if (typeNormalized.includes('déjeuner') || typeNormalized.includes('midi')) {
    return 'apresmidi';
  }
  if (typeNormalized.includes('dîner') || typeNormalized.includes('diner') || typeNormalized.includes('soir')) {
    return 'soir';
  }
  if (typeNormalized.includes('collation') || typeNormalized.includes('goûter')) {
    return 'apresmidi'; // Par défaut, collation = après-midi
  }
  if (typeNormalized.includes('nuit')) {
    return 'nuit';
  }
  
  return null;
}

/**
 * Détermine le moment dominant d'une liste de moments.
 * @param {Array} moments - Liste de moments ('matin', 'soir', etc.)
 * @returns {string|null} - Moment le plus fréquent
 */
function getMomentDominant(moments) {
  if (!moments || moments.length === 0) return null;
  
  const counts = {};
  moments.forEach(m => {
    if (m) counts[m] = (counts[m] || 0) + 1;
  });
  
  // Retourner moment avec le plus d'occurrences
  const momentMax = Object.keys(counts).reduce((a, b) => 
    counts[a] > counts[b] ? a : b
  , null);
  
  return momentMax;
}

