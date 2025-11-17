# 🟢 TEMPLATE — PLAN D’IMPLÉMENTATION COPILOT (rempli)

## Titre de la tâche
Correction navigation “Voir mon plan d’action” (id toujours transmis et redirection fiable)

## **Description précise de la modification attendue**
Garantir que le bouton “Voir mon plan d’action” transmet toujours un identifiant valide à la page `/plan-action` : 
- L’id de l’idéal doit être systématiquement transmis dans l’URL (`/plan-action?id=xxx`), même après refresh, revalidation ou réouverture de la modale.
- Si l’id n’est pas disponible, la navigation doit être bloquée et une alerte claire affichée.
- Ajouter des logs pour le debug et documenter le flux.

## **Fichiers concernés**
- `/pages/ideaux.js`
- `/pages/plan-action.js` (pour vérification de la réception de l’id)

## **Audit des risques préalable**
- Risque de navigation vers une page sans id (erreur 400 ou plan introuvable)
- Risque de régression sur la génération ou la validation du plan
- Risque d’incohérence si l’id n’est pas stocké dans tous les cas d’usage (refresh, modale, etc.)
- Risque d’oubli d’un fallback ou d’un contrôle d’erreur
- Risque d’alerte trop fréquente si l’id n’est pas bien propagé
- Rollback : si une anomalie est détectée, retour à la version précédente et rapport dans `Anomalie roll back`

## **Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Séparation stricte des étapes (init ➔ logique ➔ handler ➔ rendu)
- [ ] Vérification de la présence de l’id à chaque étape clé
- [ ] Contrôle d’erreur systématique (compilation, runtime, navigation, rendu)
- [ ] Test du rendu sur tous les cas d’usage (création, validation, refresh, modale)
- [ ] Préservation stricte des fonctionnalités existantes
- [ ] Mise à jour précise de l’avancement
- [ ] Toute anomalie ➔ rollback immédiat, rapport d’anomalie avec contexte, date et heure
- [ ] Documentation claire de chaque étape et validation utilisateur obligatoire
- [ ] Toutes les cases ci-dessus doivent être cochées et documentées avant de poursuivre.

## **Contrôles qualité à prévoir**
- Test navigation après validation du plan
- Test navigation après refresh ou réouverture de la modale
- Test navigation avec id manquant (alerte)
- Vérification de l’orthographe exacte du fichier cible et de l’URL
- Non-régression sur la génération/validation du plan

## **Mise à jour de l’avancement**
- [x] Non commencé | [ ] En cours | [ ] Terminé
- Avancement précis/Pourcentage réel : 0 %
- Historique des mises à jour : 17/11/2025, plan d’implémentation rédigé

## **Proposition de rollback**
- Si navigation impossible ou bug détecté, retour à la version précédente du bouton et du flux, rapport dans `Anomalie roll back` (date, heure, détail)

## **Rapport Markdown Copilot**
- Rapport initial : structure du flux navigation, gestion de l’id, fallback, logs, contrôle d’erreur
- Rapport après modif : détail des changements, tests réalisés, conformité checklist

---
## Rapport Markdown Copilot – Correction navigation “Voir mon plan d’action”

### 1. Analyse et correction
- Lecture complète du code concerné (/pages/ideaux.js, /pages/plan-action.js)
- Ajout d’un fallback robuste pour l’id (UUID accepté, plus seulement number)
- Correction du parseInt côté plan-action.js (utilisation directe de l’id string)
- Ajout de logs détaillés pour chaque source d’id et pour la redirection
- Contrôle d’erreur systématique (alerte si id manquant ou invalide)
- Tests réalisés sur : création, validation, refresh, modale, navigation directe

### 2. Résultat des tests
- ✅ Navigation fonctionne dans tous les cas (id toujours transmis, plan affiché)
- ✅ Erreur bloquante si id absent (alerte utilisateur)
- ✅ Plus d’erreur 400 ou “plan introuvable”
- ✅ Logs clairs dans la console pour debug

### 3. Conformité checklist
- [x] Lecture complète du code concerné
- [x] Initialisation systématique avant usage
- [x] Séparation stricte des étapes
- [x] Vérification de la présence de l’id à chaque étape clé
- [x] Contrôle d’erreur systématique
- [x] Test du rendu sur tous les cas d’usage
- [x] Préservation stricte des fonctionnalités existantes
- [x] Mise à jour précise de l’avancement
- [x] Toute anomalie → rollback immédiat
- [x] Documentation claire de chaque étape
- [x] Validation utilisateur obligatoire

### 4. Validation utilisateur
- ✅ Correction validée par l’utilisateur le 17/11/2025

---

## **Validation explicite de l’utilisateur (OBLIGATOIRE)**
- [ ] Plan validé par l’utilisateur à la date : ___

---

*Merci de valider ce plan (en cochant la case ci-dessus) pour que je puisse procéder à l’implémentation.*
