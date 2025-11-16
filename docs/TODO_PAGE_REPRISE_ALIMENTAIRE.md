# TODO UX/DEV – PAGE REPRISE ALIMENTAIRE (après validation)

- [ ] Barre de progression globale
  - Calculer le nombre total de jours de reprise (programme.duree_reprise_jours ou jours.length). Afficher la progression (ex : « Jour 3/8 ») en haut de la page ou au-dessus de la liste des jours accessibles.
- [ ] Navigation jour par jour
  - Ajouter des boutons « Jour précédent » et « Jour suivant » pour chaque jour accessible. Désactiver les boutons si on est au début ou à la fin. Empêcher d’accéder à un jour futur non débloqué.
- [ ] Aperçu latéral des phases futures
  - Afficher la liste des phases à venir (à droite ou en bas). Indiquer les phases verrouillées (cadenas), dates de déblocage, anticipation du jour suivant, lien « Voir aliments ». Rendre les phases futures inaccessibles tant que la date n’est pas atteinte.
- [ ] Validation quotidienne à partir de J1
  - Pour chaque jour dont la date est atteinte, afficher une checkbox ou un bouton « Valider ce jour ». Sauvegarder la validation dans le localStorage (ex : tableau des jours validés). Désactiver la validation pour les jours futurs ou déjà validés.
- [ ] Indication visuelle de verrouillage
  - Afficher un cadenas ou un style grisé pour les jours/phases non accessibles.
- [ ] (Optionnel) Scroll-snap, semaine-type, anticipation UX
  - Bonus UX à intégrer après les points ci-dessus.

> Cette todo doit être suivie pour toute évolution de la page de reprise alimentaire après validation du plan. Elle doit rester à jour dans la base de travail.
