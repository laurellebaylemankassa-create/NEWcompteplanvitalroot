# 🟢 PLAN D’IMPLÉMENTATION COPILOT — Harmonisation de la saisie automatique dans le formulaire défi

## Titre de la tâche
Harmoniser la saisie automatique du champ aliment, portions et kcal dans le formulaire défi alimentaire (`SaisieDefiAlimentaire.js`) pour qu’elle fonctionne comme dans la saisie normale.

## Description précise de la modification attendue
- Ajouter une suggestion dynamique (datalist) sur le champ "aliment mangé" pour permettre la sélection d’un aliment du référentiel.
- Lorsque l’utilisateur sélectionne un aliment, pré-remplir automatiquement la catégorie, la portion recommandée et les kcal, comme en saisie normale.
- Garantir la robustesse, la conformité et l’accessibilité du formulaire défi.

## Fichiers concernés
- `/components/SaisieDefiAlimentaire.js`
- `/data/referentiel.js` (pour vérification des champs)

## Audit des risques préalable
- Risque technique : erreur de synchronisation entre le référentiel et le formulaire (aliment non reconnu, valeurs manquantes).
- Risque UX : suggestions non pertinentes, confusion utilisateur si le champ aliment n’est pas auto-rempli.
- Risque régression : perte de la logique métier existante, impact sur la validation du défi.
- Risque accessibilité : suggestions non accessibles au clavier ou aux lecteurs d’écran.
- Risque de doublon ou de déclaration de hook hors composant (cf. rollback).
- Risque de non-respect du template et de la checklist stricte.

## Sous-checklist à valider systématiquement
- [ ] Vérification de la présence/import de toutes les fonctions, hooks et variables utilisées dans le code modifié

## Checklist stricte sécurité & qualité
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React sont déclarés uniquement en haut du corps du composant fonctionnel, jamais dans une fonction, une boucle, un map, un if, etc.
- [ ] Séparation stricte des étapes : initialisation, logique calculée, handlers/fonctions, rendu
- [ ] Vérification : toute fonction ou handler utilisé dans le rendu est présent et initialisé avant usage
- [ ] Ordre et portée logiques stricts (jamais déclaration, appel ou usage prématuré)
- [ ] Pas de doublons ni de déclarations superflues
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [ ] Préservation stricte des fonctionnalités existantes : aucune suppression destructrice, aucune perte de comportement
- [ ] Mise à jour précise et justifiée du pourcentage d’avancement
- [ ] Toute anomalie ou erreur ➔ rollback immédiat, rapport d’anomalie avec contexte, date et heure (cf. fichier ANOMALIE)
- [ ] Documentation claire de chaque étape, chaque validation, et toute action automatisée (Copilot/IA)
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation
- [ ] Toutes les cases ci-dessus doivent être cochées et documentées avant de poursuivre.

## Contrôles conformité à réaliser en suivant les étapes suivantes
- Lecture des entrées d'anomalies enregistrées dans le fichier anomalies Roll back pour identifier les points de vigilance
- Création d’une checklist de contrôle adaptée à la correction
- Analyse de l’audit des risques et vérification de l’absence d’anomalie
- Proposition immédiate de rollback en cas de bug ou anomalie détectée
- Documentation de toute anomalie dans le fichier Anomalie roll back avec date et heure

## Mise à jour de l’avancement
- [x] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis/Pourcentage réel : 0 %
- Historique des mises à jour : 21/11/2025, plan généré

## Point de vigilance
- Rapport lié à la lecture des entrées du fichier Anomalie roll back :
  - Vérifier l’emplacement de tous les hooks
  - Initialiser toutes les variables utilisées dans le rendu
  - Tester la suggestion dynamique et le pré-remplissage sur tous les cas d’usage
  - Contrôler l’accessibilité et la robustesse du formulaire
  - Documenter toute anomalie et proposer un rollback immédiat si besoin

## Proposition de rollback
- Pour tout risque ou anomalie détecté :
  - Décrire l’action de rollback, son contexte (fichier, modification en cause), l’alternative sûre proposée.
  - Ajouter la donnée dans le fichier Anomalie roll back : date, heure, détail complet pour traçabilité.

## Rapport Markdown Copilot
- Rapport initial et rapport après modif, détaillant changements dans chaque section (initialisation, logique, handlers, rendu)
- Validation utilisateur obligatoire avant code

## Validation explicite de l’utilisateur (OBLIGATOIRE)
- [ ] Plan validé par l’utilisateur à la date : ___

## Amélioration continue (Copilot)
- Relier explicitement chaque action utilisateur (ex : sélection d’un aliment) à la mise à jour des états métier (catégorie, portion, kcal).
- Vérifier systématiquement que chaque étape du plan est traduite en code et testée dans le workflow réel (affichage, activation, réinitialisation, feedback).
- Après chaque modification, tester le parcours complet utilisateur et documenter le résultat (capture, rapport d’exécution).
- Ne jamais supposer qu’un état est synchronisé sans vérification concrète (affichage, console, tests).
- Ajouter un contrôle visuel ou un feedback à chaque action clé pour garantir la conformité UX et métier.
- Documenter toute anomalie ou écart dans le fichier dédié et proposer immédiatement une correction ou un rollback.
- Relire le plan et le template avant chaque implémentation pour s’assurer que toutes les étapes sont respectées.
- Se parler à soi-même (Copilot) : « Ai-je bien relié chaque étape du plan au code ? Ai-je testé le workflow complet ? Ai-je documenté chaque action et chaque anomalie ? »
