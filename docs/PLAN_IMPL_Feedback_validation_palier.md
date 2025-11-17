# 🟦 TEMPLATE — PLAN D’IMPLÉMENTATION COPILOT (rempli)

## Titre de la tâche
Feedback explicite validation palier (message/animation “Palier validé !”)

## **Description précise de la modification attendue**
Afficher un feedback explicite (message ou animation) dès que toutes les séances du palier courant sont cochées :
- Détection automatique : si toutes les séances sont cochées, afficher “Palier validé !” (bannière, pop-up ou animation)
- Option : bouton manuel “Valider le palier” pour déclencher la célébration
- Feedback visible sur /pages/ideaux.js et /pages/plan-action.js
- Tester tous les cas (validation, décochage, revalidation)

## **Fichiers concernés**
- /pages/ideaux.js
- /pages/plan-action.js

## **Audit des risques préalable**
- Risque de faux positif (feedback affiché alors qu’il manque une séance)
- Risque de non-détection si l’état local n’est pas à jour
- Risque de feedback trop intrusif ou non visible
- Risque de régression sur la validation automatique
- Rollback : retour à l’état précédent si bug ou feedback inadapté

## **Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (état, handlers)
- [ ] Séparation stricte des étapes (détection, feedback, rendu)
- [ ] Contrôle d’erreur systématique (feedback affiché uniquement si toutes les conditions sont réunies)
- [ ] Test du rendu sur tous les cas d’usage (validation, décochage, revalidation)
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Mise à jour précise de l’avancement
- [ ] Toute anomalie → rollback immédiat, rapport d’anomalie avec contexte, date et heure
- [ ] Documentation claire de chaque étape et validation utilisateur obligatoire
- [ ] Toutes les cases ci-dessus doivent être cochées et documentées avant de poursuivre.

## **Contrôles qualité à prévoir**
- Test feedback automatique (toutes séances cochées)
- Test feedback manuel (si bouton ajouté)
- Test décochage/revalidation
- Test sur /pages/ideaux.js et /pages/plan-action.js
- Non-régression sur la validation automatique

## **Mise à jour de l’avancement**
- [x] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis/Pourcentage réel : 0 %
- Historique des mises à jour : 17/11/2025, plan d’implémentation rédigé

## **Proposition de rollback**
- Si feedback inadapté ou bug, retour à la version précédente, rapport dans `Anomalie roll back` (date, heure, détail)


---
## Plan d’attaque détaillé (analyse préalable Copilot)

### 1. Détection automatique de validation de palier
- Parcourir le tableau `reel` (état local des séances) pour le palier courant.
- Si toutes les séances du palier courant ont `fait: true`, considérer le palier comme validé.
- Déclencher un feedback UX (bannière, pop-up ou animation “Palier validé !”).

### 2. Option bouton manuel
- Ajouter un bouton “Valider le palier” pour permettre à l’utilisateur de déclencher manuellement la célébration (optionnel, à valider avec l’utilisateur).

### 3. Feedback réversible
- Si l’utilisateur décoche une séance après validation, masquer le feedback “Palier validé !” (feedback dynamique, non bloquant).

### 4. Intégration dans les pages concernées
- Implémenter la logique sur `/pages/ideaux.js` et `/pages/plan-action.js`.
- Utiliser l’état React pour piloter l’affichage du feedback.

### 5. Tests à prévoir
- Tester la détection automatique (toutes séances cochées).
- Tester le feedback manuel (si bouton ajouté).
- Tester le décochage/revalidation.
- Vérifier la non-régression sur la validation automatique existante.

---

## Rapport Markdown Copilot
- À rédiger après implémentation et tests

## **Validation explicite de l’utilisateur (OBLIGATOIRE)**
- [ ] Plan validé par l’utilisateur à la date : ___

---
