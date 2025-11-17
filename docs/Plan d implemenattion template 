# 🟢 TEMPLATE — PLAN D’IMPLÉMENTATION COPILOT (À REMPLIR ET VALIDER AVANT TOUTE MODIF CODE)

**⚠️  AUCUNE modification de code ne doit être produite tant que l’utilisateur n’a pas validé explicitement ce plan d’implémentation rempli par Copilot.**

─────────────────────────────────────────────────────────────

## Titre de la tâche  
_Ex : Enrichir la page préparation jeûne (`/pages/preparation-jeune.js`)_

## **Description précise de la modification attendue**  
_Décrire exactement ce qui est attendu (fonctionnalité, écran, comportement, objectif)_  

## **Fichiers concernés**
- `/chemin/vers/fichier1`
- `/chemin/vers/fichier2`

## **Audit des risques préalable**
- _Lister tous les risques : technique, UX, sécurité, conflit, régression, perte de données, robustesse, accessibilité, etc._
- _Détection de tout risque déclenche une proposition immédiate de rollback, documentée dans le fichier Anomalie avec date et heure_

## **Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)  
- [ ] **Séparation stricte des étapes** : d’abord initialisation (useState, useEffect…), puis logique calculée, puis handlers/fonctions, puis rendu
- [ ] Vérification : toute fonction ou handler utilisé dans le rendu est présent et initialisé avant usage  
- [ ] Ordre et portée logiques stricts (jamais déclaration, appel ou usage prématuré)  
- [ ] Pas de doublons ni de déclarations superflues  
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)  
- [ ] Test du rendu sur tous les cas d’usage et cas limites  
- [ ] Préservation stricte des fonctionnalités existantes : aucune suppression destructrice, aucune perte de comportement  
- [ ] Mise à jour précise et justifiée du pourcentage d’avancement  
- [ ] Toute anomalie ou erreur ➔ rollback immédiat, rapport d’anomalie avec contexte, date et heure (cf. fichier ANOMALIE)  
- [ ] Documentation claire de chaque étape, chaque validation, et toute action automatisée (Copilot/IA)  
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation
- [ ] Toutes les cases ci-dessus doivent être cochées et documentées avant de poursuivre.

## **Contrôles qualité à prévoir**  
_Ex : tests de sauvegarde/restauration, accessibilité, non-régression, performance, multi-device, compatibilité, échappement, robustesse, cas limites_

## **Mise à jour de l’avancement**  
- [ ] Non commencé | [ ] En cours | [ ] Terminé  
- Avancement précis/Pourcentage réel (**à MAJ à chaque étape**) : ____ %
- Historique des mises à jour : ___

## **Proposition de rollback**  
- Tout risque ou anomalie détecté :  
  - Décrire l’action de rollback, son contexte (fichier, modification en cause), l’alternative sûre proposée.
  - a Ajouter dans le fichier ANOMALIE roll back : date, heure, détail complet pour traçabilité.

## **Rapport Markdown Copilot**  
- Générer un rapport structuré AVANT et APRÈS toute modification (structure, fonctions, hooks, changements, etc.).
- Ce rapport doit permettre une validation éclairée, claire et synthétique.
- À valider par l'utilisateur avant code.

## **Validation explicite de l’utilisateur (OBLIGATOIRE)**
- [ ] Plan validé par l’utilisateur à la date : ___

---

## 📝 **EXEMPLE DE TÂCHE DÉTAILLÉE**

### Titre de la tâche  
Enrichir `/pages/preparation-jeune.js` pour intégrer la progression réelle et une synthèse personnalisée

**Description**  
Permettre à l’utilisateur de suivre sa progression, valider chaque critère, personnaliser le message final, et voir une synthèse claire à la fin (respect stricte de la séparation initialisation/logique/handler/rendu).

**Fichiers**
- `/pages/preparation-jeune.js`
- `/components/SynthesePreparation.js`

**Audit des risques**
- Régression sur la logique d’éligibilité
- Perte de données ou de notifications
- Conflit avec l’existant sur les hooks de sauvegarde
- Potentiel problème SSR si useEffect mal placé  
- Non-respect du flow initialisation ➔ logique ➔ handler ➔ rendu  
- [En cas de risque] : rollback automatique, rapport détaillé dans `ANOMALIE roll back`, avec heure

**Checklist stricte**  
- [ ] Lecture complète du composant et de tous les hooks actuels
- [ ] Initialisation de tous les nouveaux hooks/états en début de composant
- [ ] Ajout de la logique métier (synthèse) après initialisation, sans écraser l’existant
- [ ] Handlers/fonctions (onChange, onComplete) déclarés avant leur utilisation dans le rendu
- [ ] Zéro doublon, tout hook déclaré une fois
- [ ] Vérification compilation/console et test sur cas limites (ex : progression à 100% dès le début, pas de progression…)
- [ ] Aucun comportement supprimé ou modifié sans relecture intégrale et rapport
- [ ] Rapport Markdown avant/après code généré
- [ ] Validation utilisateur explicitement requise avant commit

**Contrôles qualité**
- Test sauvegarde, restauration, accessibilité, non-régression, cohérence UI, test multi-device

**Mise à jour de l’avancement**
- [x] Non commencé | [ ] En cours | [ ] Terminé
- Progression : 0 %
- Historique des mises à jour : 17/11/2025, démarrage

**Rollback automatique (si nécessaire)**
- Inversion immédiate du code (rollback Git)
- Signalement fichier ANOMALIE roll back (date/heure), détail impact
- Proposition alternative si risque

**Rapport Markdown Copilot** specifiant date et heure 
- Rapport initial, et rapport après modif, détaillant changements dans chaque section (initialisation, logique, handlers, rendu)

**Validation**
- [ ] Plan validé par l’utilisateur à la date : ___

---

**⚠️ Copilot NE PEUT PAS générer de code avant validation explicite du plan, et doit se conformer à cette checklist/detail à CHAQUE tâche.**