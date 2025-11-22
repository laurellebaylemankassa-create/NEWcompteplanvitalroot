# 🟢 PLAN D’IMPLÉMENTATION COPILOT — Audit `/pages/preparation-jeune.js`

## Titre de la tâche  
Audit métier strict et contrôle qualité de la page préparation jeûne (`/pages/preparation-jeune.js`)

## Description précise de la modification attendue  
- Vérifier la conformité métier, la robustesse technique, l’accessibilité, la synchronisation des critères, le contrôle des périodes, la gestion du feedback et la traçabilité.
- Identifier tout risque, anomalie ou écart par rapport au template et aux règles strictes copilot.

## Fichiers concernés
- `/pages/preparation-jeune.js`
- `/lib/validerCriterePreparation.js`
- `/components/StartPreparationModal.js`
- `/docs/Anomalie roll back`

## Audit des risques préalable
- Risques techniques : hooks React, synchronisation localStorage, calcul dynamique des périodes, gestion des états, feedback utilisateur, modale.
- Risques UX : blocage hors période, feedback non visible, progression non claire, accessibilité ARIA-live.
- Risques sécurité : manipulation du localStorage, robustesse des handlers.
- Risques régression : perte de progression, mauvaise initialisation, doublons.
- Risques accessibilité : feedback ARIA-live, boutons accessibles.
- Vérification stricte de l’ordre des hooks (tous en haut du composant, aucun dans une fonction ou boucle).
- Documentation des points de vigilance à intégrer dans la checklist qualité.

## Sous-checklist à valider systématiquement
- [x] Présence/import de toutes les fonctions, hooks et variables utilisées
- [x] Initialisation systématique avant usage

## Checklist stricte sécurité & qualité
- [x] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [x] Initialisation systématique avant usage (hooks, variables, handlers)
- [x] Hooks React déclarés uniquement en haut du composant fonctionnel
- [x] Séparation stricte des étapes (initialisation, logique, handlers, rendu)
- [x] Vérification de la présence des handlers dans le rendu
- [x] Ordre et portée logiques stricts
- [x] Pas de doublons ni de déclarations superflues
- [x] Contrôle d’erreur systématique (feedback, période, validation)
- [ ] Test du rendu sur tous les cas d’usage et cas limites
- [x] Préservation stricte des fonctionnalités existantes
- [x] Mise à jour précise du pourcentage d’avancement
- [ ] Rollback immédiat en cas d’anomalie
- [x] Documentation claire de chaque étape
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation

## Contrôles conformité à réaliser
- Lecture des anomalies dans `/docs/Anomalie roll back`
- Création d’une checklist de contrôle adaptée aux risques identifiés
- Analyse de l’audit des risques et vérification d’absence d’anomalie
- Proposition de rollback immédiat en cas de bug

## Mise à jour de l’avancement
- [x] Non commencé | [x] En cours | [ ] Terminé  
- Avancement précis : **40 %** (audit, checklist, points de vigilance validés)
- Historique des mises à jour : 21-22/11/2025 — Lecture complète, audit, checklist, validation utilisateur

## Point de vigilance
- Synchronisation des critères entre localStorage et état React
- Blocage métier hors période active
- Feedback utilisateur et accessibilité
- Robustesse des handlers et initialisation
- Vérification des anomalies documentées dans `/docs/Anomalie roll back`
- Application stricte de la checklist ci-dessous :
  1. Hooks React uniquement en haut du composant principal
  2. Pas de doublons d’imports
  3. Toutes les fonctions/variables utilisées existent et sont importées
  4. Composants React insérés uniquement dans le return principal
  5. Template strict relu et coché à chaque étape
  6. Documentation de toute anomalie/correction dans `/docs/Anomalie roll back`
  7. Test du rendu sur tous les cas d’usage et cas limites

## Proposition de rollback
- En cas de bug ou anomalie, rollback à l’état initial du fichier avant modification, documentation dans `/docs/Anomalie roll back` avec date et heure.
