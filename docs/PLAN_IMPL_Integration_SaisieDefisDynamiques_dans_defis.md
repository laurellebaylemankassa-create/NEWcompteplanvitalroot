# PLAN D’IMPLÉMENTATION — Intégration du formulaire « Créer un défi personnalisé » dans la page des défis

## Titre de la tâche
Intégrer le composant `SaisieDefisDynamiques` (formulaire « Créer un défi personnalisé ») dans la page `/pages/defis.js` pour rendre accessible la création de défis personnalisés depuis l’interface principale des défis.

## Description précise de la modification attendue
- Importer le composant `SaisieDefisDynamiques` dans `/pages/defis.js`.
- Afficher ce composant en haut de la page (avant la liste des défis existants).
- Permettre à l’utilisateur d’accéder au bouton et au formulaire « Créer un défi personnalisé » directement depuis la page des défis.
- S’assurer que l’intégration ne perturbe pas l’affichage ou la logique des autres défis.

## Fichiers concernés
- `/pages/defis.js`
- `/components/SaisieDefisDynamiques.js`

## Audit des risques préalable
- Risque d’affichage redondant ou cassé si le composant est mal positionné.
- Risque de conflit d’état si plusieurs hooks ou contextes sont utilisés en double.
- Risque de régression sur la logique d’affichage des défis existants.
- Risque d’oubli d’import ou de mauvaise initialisation du composant.
- Risque d’accessibilité si le formulaire n’est pas visible ou utilisable sur tous les devices.
- Risque de confusion utilisateur si le bouton/formulaire n’est pas clairement séparé de la liste des défis standards.

## Sous-checklist à valider systématiquement
- [ ] Vérification de la présence/import de toutes les fonctions, hooks et variables utilisées dans le code modifié

## Checklist stricte sécurité & qualité (à cocher AVANT toute modification)
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React sont déclarés uniquement en haut du corps du composant fonctionnel
- [ ] Séparation stricte des étapes : initialisation, logique calculée, handlers/fonctions, rendu
- [ ] Vérification : toute fonction ou handler utilisé dans le rendu est présent et initialisé avant usage
- [ ] Ordre et portée logiques stricts (jamais déclaration, appel ou usage prématuré)
- [ ] Pas de doublons ni de déclarations superflues
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Mise à jour précise et justifiée du pourcentage d’avancement
- [ ] Toute anomalie ou erreur ➔ rollback immédiat, rapport d’anomalie avec contexte, date et heure (cf. fichier ANOMALIE)
- [ ] Documentation claire de chaque étape, chaque validation, et toute action automatisée (Copilot/IA)
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation
- [ ] Toutes les cases ci-dessus doivent être cochées et documentées avant de poursuivre.

## Contrôles conformité à réaliser en suivant les étapes suivantes
- Vérifier l’affichage du bouton et du formulaire sur tous les devices et navigateurs principaux.
- Vérifier que la création d’un défi personnalisé n’impacte pas la liste des défis standards.
- Vérifier la non-régression sur la logique d’affichage, de démarrage et de progression des défis existants.
- Lire les entrées d’anomalies dans le fichier rollback pour anticiper tout risque connu.
- Documenter toute anomalie ou écart dans le fichier dédié.

## Mise à jour de l’avancement
- [ ] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis/Pourcentage réel (à MAJ à chaque étape) : ____ %
- Historique des mises à jour : ___

## Point de vigilance
- S’assurer que le composant n’introduit pas de conflit d’état ou de hooks avec la logique existante.
- Vérifier la clarté de l’UI pour éviter toute confusion utilisateur.
- Tester l’accessibilité et la compatibilité multi-device.

## Proposition de rollback
- Si anomalie d’affichage ou de logique, retirer l’import et le rendu du composant, revenir à l’état initial de la page, documenter l’anomalie dans le fichier rollback.

## Rapport Markdown Copilot
- Générer un rapport avant/après modification (structure, hooks, rendu, impact UI).
- À valider par l’utilisateur avant code.

## Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

---

**Aucune modification de code ne sera produite tant que tu n’auras pas validé explicitement ce plan.**
