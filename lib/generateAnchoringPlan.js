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
  // Sécurisation : si dateDebut ou dateCible sont invalides, retourner un plan vide ou lever une erreur explicite
  if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
    throw new RangeError('Date de début ou date cible invalide');
  }
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
      est_pilier: true
    });
  }

  // Génération des actions structurées par mois > semaines > actions
  const mois = [];
  // Pour chaque semaine, générer les actions sur les bons jours proposés
  for (let s = 0; s < nbSemaines; s++) {
    // La semaine 1 commence exactement à la dateDebut, puis chaque semaine suivante +7 jours
    const weekStartDate = new Date(debut.getTime() + s * 7 * 24 * 60 * 60 * 1000);
    // Utiliser le vrai mois (1-12) et la vraie année de la semaine courante
    const moisNum = weekStartDate.getMonth() + 1;
    const annee = weekStartDate.getFullYear();
    let moisObj = mois.find(m => m.numero === moisNum && m.annee === annee);
    if (!moisObj) {
      moisObj = { numero: moisNum, annee: annee, semaines: [] };
      mois.push(moisObj);
    }
    const semaineNum = moisObj.semaines.length + 1;
    const semaineObj = { numero: semaineNum, debut: weekStartDate.toISOString().slice(0,10), actions: [] };

    // Pour chaque jour proposé, trouver la date réelle dans la semaine
    for (let r = 0; r < objectif.routines.length; r++) {
      const routine = objectif.routines[r];
      // Trouver l'index du jour proposé (0=dimanche, 1=lundi, ..., 6=samedi)
      const joursSemaine = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
      const idxJour = joursSemaine.indexOf(routine.jour);
      if (idxJour === -1) continue;
      // Calculer la date réelle de ce jour dans la semaine courante
      const weekDay = weekStartDate.getDay();
      let offset = idxJour - weekDay;
      if (offset < 0) offset += 7;
      const dateAction = new Date(weekStartDate);
      dateAction.setDate(weekStartDate.getDate() + offset);
      // Ne générer l'action que si la date est dans la plage [debut, fin]
      if (dateAction < debut || dateAction > fin) continue;
      semaineObj.actions.push({
        date: dateAction.toISOString().slice(0,10),
        jour: routine.jour,
        action_type: routine.action_type,
        moment: routine.moment,
        statut: 'à faire',
        commentaire: '',
        energie: null
      });
    }
    // Trier les actions par date croissante dans la semaine
    semaineObj.actions.sort((a, b) => a.date.localeCompare(b.date));
    moisObj.semaines.push(semaineObj);
  }

  // Structure finale à valider/ajuster par l'utilisateur
  return {
    ideal: {
      titre,
      indicateur,
      date_cible: dateCible
    },
    objectif,
    mois,
    // dateDebut explicite (yyyy-mm-dd) pour faciliter l'affichage et les mises à jour
    dateDebut: debut.toISOString().slice(0,10)
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