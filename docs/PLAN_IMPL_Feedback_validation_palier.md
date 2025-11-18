# 🟢 TEMPLATE — PLAN D’IMPLÉMENTATION COPILOT (REMPLI)

## Titre de la tâche  
Implémenter le feedback utilisateur lors de la validation d’un palier (progression, message, contrôle, rollback si anomalie)

## **Description précise de la modification attendue**  
Afficher un feedback clair et motivant à l’utilisateur lors de la validation d’un palier (ex : progression, badge, message personnalisé). Garantir la robustesse du calcul de progression et l’absence d’erreur de référence ou d’import. Permettre un rollback immédiat en cas d’anomalie détectée.

## **Fichiers concernés**
- `/pages/ideaux.js`
- `/components/BandeauDefiActif.js`
- `/components/PopUpDefi.js`
- `/components/JournalDeBordDefi.js`
- `/lib/defisUtils.js` (si logique métier à centraliser)

## **Audit des risques préalable**
- Risque d’erreur de référence (fonction non définie, import manquant)
- Risque de régression sur la progression ou la validation du palier
- Risque d’affichage incorrect du feedback (message, badge, progression)
- Risque de perte de données utilisateur (notes, progression)
- Risque d’incohérence entre l’état global et l’affichage
- Risque d’absence de rollback en cas d’anomalie
- Risque de non-respect du template strict (voir anomalies documentées dans `Anomalie roll back` et `MARKDOWN`)
- documenter ces risques en point de vigilance et les intégrer dans la checklist du contrôle qualité

**Sous-checklist à valider systématiquement :**
- [ ] Vérification de la présence/import de toutes les fonctions, hooks et variables utilisées dans le code modifié

## **Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Séparation stricte des étapes : initialisation ➔ logique ➔ handler ➔ rendu
- [ ] Vérification : toute fonction ou handler utilisé dans le rendu est présent et initialisé avant usage
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

## **Contrôles qualité à prévoir**  
- Tests de feedback sur validation de palier (progression, message, badge)
- Tests de non-régression sur la progression et la validation
- Tests multi-device et accessibilité
- Analyse de l’audit des risques et vérification de l’absence d’anomalie
- Prise en compte des retours d’expérience et anomalies documentées dans `Anomalie roll back` et `MARKDOWN` pour renforcer la vigilance et la rigueur
- Si anomalie/bug identifié, proposition immédiate de rollback à l’endroit où l’anomalie a été détectée (pour revenir à l’état sans bug), à confirmer avec l’utilisateur, et documentation dans le fichier Anomalie roll back avec date et heure

## **Mise à jour de l’avancement**  
- [ ] Non commencé | [ ] En cours | [ ] Terminé  
- Avancement précis/Pourcentage réel (**à MAJ à chaque étape**) : ____ %
- Historique des mises à jour : ___

## **Proposition de rollback**  
- Tout risque ou anomalie détecté :  
  - Décrire l’action de rollback, son contexte (fichier, modification en cause), l’alternative sûre proposée.
  - Ajouter dans le fichier ANOMALIE roll back : date, heure, détail complet pour traçabilité.

## **Rapport Markdown Copilot**  
- Générer un rapport structuré AVANT et APRÈS toute modification (structure, fonctions, hooks, changements, etc.).
- Ce rapport doit permettre une validation éclairée, claire et synthétique.
- À valider par l'utilisateur avant code.

## **Validation explicite de l’utilisateur (OBLIGATOIRE)**
- [ ] Plan validé par l’utilisateur à la date : ___
