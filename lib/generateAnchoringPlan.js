// Générateur de plan d'ancrage (proposition)
// Entrée : idéal (titre, indicateur, date_cible, fréquence/semaine, durée, intensité, jours proposés...)
// Sortie : structure complète à valider/ajuster par l'utilisateur

function generateAnchoringPlan({
  titre,
  indicateur,
  dateCible,
  frequence = 3, // séances/semaine par défaut
  duree = 15,    // minutes
  intensite = '7,6 km/h',
  joursProposes = ['lundi', 'mercredi', 'samedi'],
  dateDebut = new Date()
}) {
  // Calcul du nombre de semaines
  const debut = new Date(dateDebut);
  const fin = new Date(dateCible);
  const msParSemaine = 1000 * 60 * 60 * 24 * 7;
  const nbSemaines = Math.ceil((fin - debut) / msParSemaine);

  // Génération des objectifs intermédiaires (1 objectif global ici)
  const objectif = {
    titre: `Courir ${frequence}x/semaine pendant ${duree} min à ${intensite}`,
    frequence_par_semaine: frequence,
    duree_unite: duree,
    unite_duree: 'minutes',
    intensite,
    periode: `${debut.toISOString().slice(0,10)} au ${fin.toISOString().slice(0,10)}`,
    progression: 0,
    statut: 'en cours',
    routines: []
  };

  // Génération des routines (jours proposés)
  for (let jour of joursProposes) {
    objectif.routines.push({
      jour,
      action_type: 'course',
      moment: 'matin',
      est_pilier: true,
      actions: []
    });
  }

  // Génération des actions (pour chaque semaine et chaque jour)
  for (let s = 0; s < nbSemaines; s++) {
    for (let r = 0; r < objectif.routines.length; r++) {
      const routine = objectif.routines[r];
      // Calcul de la date de l'action
      const dateAction = new Date(debut);
      dateAction.setDate(debut.getDate() + s * 7 + r);
      if (dateAction > fin) continue;
      routine.actions.push({
        date: dateAction.toISOString().slice(0,10),
        statut: 'à faire',
        commentaire: '',
        energie: null
      });
    }
  }

  // Structure finale à valider/ajuster par l'utilisateur
  return {
    ideal: {
      titre,
      indicateur,
      date_cible: dateCible
    },
    objectifs: [objectif]
  };
}

// Exemple d'utilisation (à brancher sur l'UI pour validation/ajustement)
/*
const plan = generateAnchoringPlan({
  titre: "Find back my 2023 runstatus",
  indicateur: "6 km à 7,6 km/h",
  dateCible: "2026-07-25",
  frequence: 3,
  duree: 15,
  intensite: "7,6 km/h",
  joursProposes: ["lundi", "mercredi", "samedi"]
});
console.log(plan);
*/

module.exports = { generateAnchoringPlan };