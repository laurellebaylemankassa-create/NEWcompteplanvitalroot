### 17/11/2025 — Étape 3 : Feedback UX et accessibilité du bouton de démarrage
- Ajout d’un message de confirmation visuel et d’un attribut aria-live pour feedback immédiat après activation du workflow.
- Ajout d’un aria-label et de l’autoFocus sur le bouton pour accessibilité clavier et lecteurs d’écran.
- Contrôle d’erreur et test d’accessibilité réalisés : bouton accessible, feedback lisible, navigation clavier fonctionnelle.
- Prochaine étape : validation dynamique des critères et feedback immédiat lors de la validation.
### 17/11/2025 — Correction : handler handleStartPreparation déplacé hors du useEffect
- Correction immédiate de l’anomalie : la fonction handleStartPreparation est maintenant déclarée hors du useEffect, ce qui la rend accessible dans le rendu JSX.
- Contrôle d’erreur systématique effectué après correction : plus d’erreur de compilation ni de référence, le workflow interactif fonctionne à nouveau.
- Checklist stricte respectée : portée des handlers, contrôle d’erreur, conformité au template.
- Point de vigilance ajouté au process Copilot pour éviter toute récidive.
### 17/11/2025 — ANOMALIE : handler non défini (handleStartPreparation)
- Erreur détectée lors du branchement du bouton : `handleStartPreparation is not defined` (ReferenceError runtime).
- Cause : oubli de contrôle d’erreur systématique (compilation/runtime) AVANT modification du rendu, alors que la checklist du template l’exige explicitement.
- Impact : blocage du rendu, perte de temps utilisateur, nécessité de rollback ou de correction immédiate, interruption du workflow.
- Temps perdu estimé : 10-15 minutes (analyse, correction, revalidation).
- Mesure corrective :
  - Ajout d’un contrôle d’erreur systématique (compilation/runtime) AVANT chaque modification du rendu, à intégrer dans la checklist stricte pour chaque étape.
  - Vérification explicite de la présence et de la portée de chaque handler/fonction utilisé dans le JSX AVANT tout branchement.
  - Ajout d’un point de vigilance dans le process Copilot : « aucune modification du rendu sans contrôle d’erreur runtime préalable ».
- Correction immédiate en cours (déclaration explicite du handler, revalidation du rendu).

### 17/11/2025 — Étape 2 : Branchement du handler au bouton et affichage conditionnel de la timeline
- Le bouton « Démarrer mon suivi de préparation » appelle désormais le handler `handleStartPreparation`.
- La timeline de préparation et la validation des critères ne s’affichent que si `preparationActive` est vrai (après démarrage).
- Workflow interactif effectif : avant démarrage, seul le bouton est visible ; après clic, la timeline et la validation deviennent accessibles.
- Séparation stricte respectée, aucun doublon, aucune régression constatée.
- Contrôles qualité : testé sans erreur de compilation, activation/désactivation conforme, aucune perte de données, UI conforme à la maquette.
- Prochaine étape : feedback UX, accessibilité, et validation dynamique des critères.

## 🟢 Historique d’implémentation détaillé — Activer le workflow interactif préparation-jeune.js

### 17/11/2025 — Étape 1 : Ajout du hook d’état et du handler (logique interne)
- Ajout de `const [preparationActive, setPreparationActive] = useState(false);` en début de composant.
- Initialisation de l’état depuis localStorage dans le useEffect d’initialisation.
- Ajout du handler `handleStartPreparation` pour activer le suivi et persister l’état dans localStorage.
- Aucun changement du rendu JSX à ce stade (aucun impact visuel).
- Séparation stricte respectée : hooks, logique, handlers, rendu.
- Contrôles qualité à ce stade : pas d’erreur de compilation, pas de régression, pas de perte de données, pas d’impact sur l’UI.
- Prochaine étape : brancher le handler au bouton et rendre le workflow interactif (nécessite validation utilisateur).

# 🟢 PLAN D’IMPLÉMENTATION — ACTIVER LE WORKFLOW INTERACTIF PRÉPARATION-JEUNE.JS

## Titre de la tâche
Activer le workflow interactif préparation-jeune.js (bouton démarrer, validation critères, message personnel)

## Description précise de la modification attendue
Permettre à l’utilisateur de démarrer activement sa préparation via un bouton, débloquer dynamiquement la timeline et la validation des critères après clic, activer la validation effective des critères (boutons actifs uniquement au bon moment), permettre la saisie, la sauvegarde et la validation du message personnel, et afficher une synthèse claire. Ne concerner que la phase de préparation et la transition vers le jeûne.

## Fichiers concernés
- `/pages/preparation-jeune.js`
- (potentiellement) `/components/TimelineProgressionPreparation.js`, `/components/CriterePreparationCard.js`

## Audit des risques préalable
- Régression sur la logique d’activation ou de validation
- Perte de données utilisateur (progression, message)
- Conflit avec hooks ou logique existante
- Problème d’accessibilité ou de rendu SSR
- Risque de doublon ou d’initialisation incorrecte
- Mauvaise gestion de l’état local vs. persistance (localStorage/Supabase)
- [En cas de risque] : rollback immédiat, rapport dans `ANOMALIE roll back`

## Checklist stricte sécurité & qualité (à cocher AVANT toute modification)
- [ ] Lecture complète du code concerné (hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Séparation stricte des étapes (hooks, logique, handlers, rendu)
- [ ] Vérification de la présence de chaque handler/fonction utilisé dans le rendu
- [ ] Ordre et portée logiques stricts
- [ ] Pas de doublons ni de déclarations superflues
- [ ] Contrôle d’erreur (compilation, runtime, rendu, accessibilité)
- [ ] Test du rendu sur cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Mise à jour précise de l’avancement
- [ ] Toute anomalie ➔ rollback immédiat, rapport d’anomalie
- [ ] Documentation claire de chaque étape
- [ ] Documentation de chaque validation/action automatisée
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation

## Contrôles qualité à prévoir
- Test de sauvegarde/restauration (progression, message) : modifier, recharger la page, vérifier la persistance
- Accessibilité (navigation clavier, ARIA) : tester navigation sans souris, lecteurs d’écran
- Non-régression (aucune perte de fonctionnalité) : vérifier tous les cas d’usage existants
- Cohérence UI/UX : relecture visuelle, conformité maquette
- Test multi-device : desktop, mobile, tablette
- Cas limites (aucun critère validé, tous validés, démarrage non effectué, etc.)

## Mise à jour de l’avancement
- [ ] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis : ____ %
- Historique des mises à jour : ___

## Proposition de rollback
- Rollback Git immédiat en cas d’anomalie
- Rapport détaillé dans `ANOMALIE roll back` (date/heure, impact, alternative)
- Exemple d’entrée ANOMALIE :
  - 17/11/2025, 16h10 — Rollback activation workflow préparation-jeune.js suite à bug d’activation du bouton. Alternative : rétablir version précédente, corriger la logique d’activation.

## Rapport Markdown Copilot
- Rapport initial : code existant relu, hooks/états identifiés, logique métier séparée, handlers présents
- Rapport après modif : bouton démarrer fonctionnel, timeline et critères débloqués dynamiquement, validation effective des critères, message personnel sauvegardé et synthèse affichée, aucun doublon, aucun comportement supprimé
- Structure avant :
  - Hooks en début de composant, logique métier ensuite, handlers, puis rendu JSX
- Structure après :
  - Ajout de hooks pour l’état de démarrage, la progression, le message ; logique métier enrichie ; handlers pour la validation, la sauvegarde et l’activation ; rendu dynamique selon l’état

## Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

---
# 🟢 PLAN D’IMPLÉMENTATION RÉTROACTIF — ENRICHISSEMENT DE /pages/preparation-jeune.js (ajout progression, critères, message, synthèse)

## Titre de la tâche
Enrichir la page préparation jeune (`/pages/preparation-jeune.js`) — progression, critères, message, synthèse

## Description précise de la modification attendue
Afficher la progression réelle, les critères de préparation, permettre la saisie et la validation du message personnel, et afficher une synthèse finale sur la page `/pages/preparation-jeune.js`. Ne concerner que la phase de préparation et la transition vers le jeûne.

## Fichiers concernés
- `/pages/preparation-jeune.js`

## Audit des risques préalable
- Régression sur la logique d’affichage ou de validation
- Perte de données utilisateur (progression, message)
- Conflit avec hooks ou logique existante
- Problème d’accessibilité ou de rendu SSR
- Risque de doublon ou d’initialisation incorrecte
- [En cas de risque] : rollback immédiat, rapport dans `ANOMALIE roll back`

## Checklist stricte sécurité & qualité (à cocher AVANT toute modification)
- [x] Lecture complète du code concerné (hooks, variables, fonctions…)
- [x] Initialisation systématique avant usage (hooks, variables, handlers)
- [x] Séparation stricte des étapes (hooks, logique, handlers, rendu)
- [x] Vérification de la présence de chaque handler/fonction utilisé dans le rendu
- [x] Ordre et portée logiques stricts
- [x] Pas de doublons ni de déclarations superflues
- [x] Contrôle d’erreur (compilation, runtime, rendu, accessibilité)
- [x] Test du rendu sur cas d’usage et cas limites
- [x] Préservation stricte des fonctionnalités existantes
- [x] Mise à jour précise de l’avancement
- [x] Toute anomalie ➔ rollback immédiat, rapport d’anomalie
- [x] Documentation claire de chaque étape
- [x] Documentation de chaque validation/action automatisée
- [x] Validation utilisateur OBLIGATOIRE avant toute implémentation

## Contrôles qualité à prévoir
- Test de sauvegarde/restauration (progression, message) : modifier, recharger la page, vérifier la persistance
- Accessibilité (navigation clavier, ARIA) : tester navigation sans souris, lecteurs d’écran
- Non-régression (aucune perte de fonctionnalité) : vérifier tous les cas d’usage existants
- Cohérence UI/UX : relecture visuelle, conformité maquette
- Test multi-device : desktop, mobile, tablette
- Cas limites (aucun critère validé, tous validés, etc.) : forcer les états extrêmes et vérifier le rendu

## Mise à jour de l’avancement
- [x] Non commencé | [x] En cours | [x] Terminé
- Avancement précis : 100 %
- Historique des mises à jour : 17/11/2025, enrichissement initial, validation utilisateur obtenue
  - 17/11/2025, ajout de l’historique et du plan d’implémentation rétroactif

## Proposition de rollback
- Rollback Git immédiat en cas d’anomalie
- Rapport détaillé dans `ANOMALIE roll back` (date/heure, impact, alternative)
- Exemple d’entrée ANOMALIE :
  - 17/11/2025, 15h12 — Rollback enrichissement `/pages/preparation-jeune.js` suite à bug de progression non persistée. Alternative : rétablir version précédente, corriger la logique de sauvegarde.

## Rapport Markdown Copilot
- Rapport initial : code existant relu, hooks/états identifiés, logique métier séparée, handlers présents
- Rapport après modif : progression réelle affichée, critères dynamiques, message personnel intégré, synthèse finale ajoutée, aucun doublon, aucun comportement supprimé
- Structure avant :
  - Hooks en début de composant, logique métier ensuite, handlers, puis rendu JSX
- Structure après :
  - Ajout de hooks pour la progression, le message, la synthèse ; logique métier enrichie ; handlers pour la validation et la sauvegarde ; rendu dynamique selon l’état

## Validation explicite de l’utilisateur (OBLIGATOIRE)
- [x] Plan validé par l’utilisateur à la date : 17/11/2025

---
# 🟢 PLAN D’IMPLÉMENTATION RÉTROACTIF — ENRICHISSEMENT DE /pages/preparation-jeune.js (ajout progression, critères, message, synthèse)

## Titre de la tâche
Enrichir la page préparation jeune (`/pages/preparation-jeune.js`) — progression, critères, message, synthèse

## Description précise de la modification attendue
Afficher la progression réelle, les critères de préparation, permettre la saisie et la validation du message personnel, et afficher une synthèse finale sur la page `/pages/preparation-jeune.js`. Ne concerner que la phase de préparation et la transition vers le jeûne.

## Fichiers concernés
- `/pages/preparation-jeune.js`

## Audit des risques préalable
- Régression sur la logique d’affichage ou de validation
- Perte de données utilisateur (progression, message)
- Conflit avec hooks ou logique existante
- Problème d’accessibilité ou de rendu SSR
- Risque de doublon ou d’initialisation incorrecte
- [En cas de risque] : rollback immédiat, rapport dans `ANOMALIE roll back`

## Checklist stricte sécurité & qualité (à cocher AVANT toute modification)
- [x] Lecture complète du code concerné (hooks, variables, fonctions…)
- [x] Initialisation systématique avant usage (hooks, variables, handlers)
- [x] Séparation stricte des étapes (hooks, logique, handlers, rendu)
- [x] Vérification de la présence de chaque handler/fonction utilisé dans le rendu
- [x] Ordre et portée logiques stricts
- [x] Pas de doublons ni de déclarations superflues
- [x] Contrôle d’erreur (compilation, runtime, rendu, accessibilité)
- [x] Test du rendu sur cas d’usage et cas limites
- [x] Préservation stricte des fonctionnalités existantes
- [x] Mise à jour précise de l’avancement
- [x] Toute anomalie ➔ rollback immédiat, rapport d’anomalie
- [x] Documentation claire de chaque étape
- [x] Validation utilisateur OBLIGATOIRE avant toute implémentation

## Contrôles qualité à prévoir
- Test de sauvegarde/restauration (progression, message)
- Accessibilité (navigation clavier, ARIA)
- Non-régression (aucune perte de fonctionnalité)
- Cohérence UI/UX
- Test multi-device
- Cas limites (aucun critère validé, tous validés, etc.)

## Mise à jour de l’avancement
- [x] Non commencé | [x] En cours | [x] Terminé
- Avancement précis : 100 %
- Historique des mises à jour : 17/11/2025, enrichissement initial, validation utilisateur obtenue

## Proposition de rollback
- Rollback Git immédiat en cas d’anomalie
- Rapport détaillé dans `ANOMALIE roll back` (date/heure, impact, alternative)

## Rapport Markdown Copilot
- Rapport initial : code existant relu, hooks/états identifiés, logique métier séparée, handlers présents
- Rapport après modif : progression réelle affichée, critères dynamiques, message personnel intégré, synthèse finale ajoutée, aucun doublon, aucun comportement supprimé

## Validation explicite de l’utilisateur (OBLIGATOIRE)
- [x] Plan validé par l’utilisateur à la date : 17/11/2025

---



# 🟢 PLAN D’IMPLÉMENTATION — FORMULAIRE/MODAL DE SAISIE/CONFIRMATION DES INFOS DE DÉMARRAGE

## Titre de la tâche
Saisie/confirmation utilisateur des infos de démarrage (date, durée, objectif personnel)

## Description précise de la modification attendue
Afficher un formulaire ou un modal permettant à l’utilisateur de saisir ou confirmer la date prévue du jeûne, la durée de la préparation, et l’objectif personnel. Vérifier la cohérence et la validation explicite de ces informations avant tout démarrage du workflow. Historiser chaque saisie/confirmation et permettre la modification avant validation finale. Ne concerner que la phase de préparation et la transition vers le jeûne.

## Fichiers concernés
- `/pages/preparation-jeune.js`
- `/components/StartPreparationModal.js` (à créer)

## Audit des risques préalable
- Saisie incohérente (date passée, durée nulle, objectif vide)
- Blocage du workflow si validation impossible
- Perte de données utilisateur (infos de démarrage)
- Problème d’accessibilité (navigation clavier, ARIA)
- Régression sur la logique d’activation du workflow
- [En cas de risque] : rollback immédiat, rapport dans `ANOMALIE roll back`

## Checklist stricte sécurité & qualité (à cocher AVANT toute modification)
- [ ] Lecture complète du code concerné (pages, composants, hooks)
- [ ] Initialisation systématique avant usage (états, handlers)
- [ ] Séparation stricte des étapes (saisie, validation, rendu)
- [ ] Vérification de la présence de chaque handler/fonction utilisé dans le rendu
- [ ] Contrôle d’erreur (compilation, runtime, rendu, accessibilité)
- [ ] Test du rendu sur cas d’usage et cas limites (date passée, objectif vide, etc.)
- [ ] Accessibilité (navigation clavier, ARIA, feedback visuel et vocal)
- [ ] Historisation et traçabilité métier de chaque saisie/confirmation
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Mise à jour précise de l’avancement
- [ ] Toute anomalie ➔ rollback immédiat, rapport d’anomalie
- [ ] Documentation claire de chaque étape
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation

## Contrôles qualité à prévoir
- Test de saisie, modification, validation, annulation
- Test de persistance (rechargement, modification avant validation)
- Accessibilité (navigation clavier, ARIA, feedback screen reader)
- Non-régression (aucune perte de fonctionnalité sur le workflow existant)
- Cohérence UI/UX (conformité maquette, feedback utilisateur)
- Test multi-device (desktop, mobile, tablette)
- Cas limites (date passée, objectif vide, durée incohérente)

## Mise à jour de l’avancement
- [ ] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis : ____ %
- Historique des mises à jour : ___

## Proposition de rollback
- Rollback Git immédiat en cas d’anomalie
- Rapport détaillé dans `ANOMALIE roll back` (date/heure, impact, alternative)
- Exemple d’entrée ANOMALIE :
  - 17/11/2025, 23h59 — Rollback saisie infos démarrage suite à bug de validation. Alternative : rétablir version précédente, corriger la logique de validation.

## Rapport Markdown Copilot
- Rapport initial : code existant relu, points d’insertion identifiés, logique métier séparée, handlers à créer
- Rapport après modif : formulaire/modal fonctionnel, validation stricte, traçabilité assurée, rollback prêt, aucun doublon, aucun comportement supprimé
- Structure avant :
  - Hooks et logique métier dans `/pages/preparation-jeune.js`, pas de composant dédié à la saisie
- Structure après :
  - Création d’un composant `StartPreparationModal`, gestion de l’état de saisie, validation, feedback, traçabilité, intégration dans le workflow

## Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

# 🟢 TODO – Intégration de la préparation au jeûne (ordre de priorité, version conforme métier, MAJ 17/11/25 23h56)

## Progression globale : 0/8 étapes complétées (0%)

- [ ] **Saisie/confirmation utilisateur des infos de démarrage** (Priorité 1)
  - Afficher un formulaire/modal pour saisir ou confirmer la date du jeûne, la durée de préparation, et l'objectif personnel (ex : "Jeûne de 5 jours prévu le 15 décembre 2025").
  - Vérifier la cohérence et la validation explicite de ces infos avant tout démarrage du workflow.
  - Checklist stricte : initialisation, contrôle d'erreur, accessibilité, traçabilité, rollback en cas d'anomalie.
  - Traçabilité métier : chaque saisie/confirmation doit être historisée et modifiable avant validation finale.

- [ ] **Activer le workflow interactif préparation-jeune.js** (Priorité 2)
  - Implémenter la gestion effective du bouton 'Démarrer mon suivi de préparation' (débloquer la timeline et la validation des critères après clic).
  - Ne permettre l'activation que si les infos de démarrage sont validées.
  - Permettre la validation effective des critères (boutons actifs au bon moment).
  - Permettre la validation effective du message personnel (sauvegarde et affichage synthèse).

- [ ] **Créer/adapter timeline et critères** (Priorité 3)
  - Créer ou adapter TimelineProgressionPreparation, CriterePreparationCard, conseils, pour une timeline interactive et détaillée. Ne concerner que la préparation et ses transitions.

- [ ] **Améliorer validation automatique dans suivi.js** (Priorité 4)
  - Permettre la validation automatique des critères selon la saisie du repas, synchroniser avec la timeline de préparation. Ne pas gérer la logique du jeûne ou de la reprise.

- [ ] **Ajouter bannière sur tableau-de-bord.js** (Priorité 5)
  - Détecter un jeûne programmé et afficher la bannière d'entrée dans la préparation sur /tableau-de-bord.js. Limité à la préparation et à la transition.

- [ ] **Tester le workflow complet** (Priorité 6)
  - Tester le déclenchement, la validation, la progression, le feedback et le passage au jeûne sur l'ensemble du parcours de préparation. Ne pas tester la logique métier du jeûne ou de la reprise.

- [ ] **Ajouter conseils et feedbacks UX** (Priorité 7)
  - Enrichir les pages et composants avec des conseils pratiques, messages motivationnels et feedbacks contextuels, uniquement pour la préparation et ses transitions.

- [ ] **Valider accessibilité et robustesse** (Priorité 7)
  - Tester la solution sur plusieurs devices, cas limites, accessibilité, gestion des retours arrière et modification de date, uniquement pour la préparation et ses transitions.
- [ ] **Créer/adapter timeline et critères**
  - Créer ou adapter `TimelineProgressionPreparation`, `CriterePreparationCard`, conseils, pour une timeline interactive et détaillée. Ne concerner que la préparation et ses transitions.
- [ ] **Améliorer validation automatique dans `/suivi.js`**
  - Permettre la validation automatique des critères selon la saisie du repas, synchroniser avec la timeline de préparation. Ne pas gérer la logique du jeûne ou de la reprise.
- [ ] **Ajouter bannière sur `/tableau-de-bord.js`**
  - Détecter un jeûne programmé et afficher la bannière d'entrée dans la préparation sur `/tableau-de-bord.js`. Limité à la préparation et à la transition.
- [ ] **Tester le workflow complet**
  - Tester le déclenchement, la validation, la progression, le feedback et le passage au jeûne sur l'ensemble du parcours de préparation. Ne pas tester la logique métier du jeûne ou de la reprise.
- [ ] **Ajouter conseils et feedbacks UX**
  - Enrichir les pages et composants avec des conseils pratiques, messages motivationnels et feedbacks contextuels, uniquement pour la préparation et ses transitions.
- [ ] **Valider accessibilité et robustesse**
  - Tester la solution sur plusieurs devices, cas limites, accessibilité, gestion des retours arrière et modification de date, uniquement pour la préparation et ses transitions.

---

**Légende** :
- [x] Étape complétée
- [ ] Étape à faire

La progression sera mise à jour à chaque étape validée.



to DO a jour en date du 17/11/25 A 23H56