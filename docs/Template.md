# 🟢 TEMPLATE — PLAN D’IMPLÉMENTATION COPILOT ( — À REMPLIR & VALIDER AVANT TOUTE MODIF CODE)

**⚠️  AUCUNE modification de code ne doit être produite tant que l’utilisateur n’a pas validé explicitement ce plan d’implémentation rempli et relu par Copilot.**

─────────────────────────────────────────────────────────────

## Titre de la tâche  
_EXEMPLE : Enrichir la page préparation jeûne (`/pages/preparation-jeune.js`)_

---

## **Description précise de la modification attendue**  
_Décrire exactement ce qui est attendu (fonctionnalité, écran, comportement, objectif)_

_EXEMPLE : Ajouter un indicateur de progression et une synthèse utilisateur à la fin du formulaire._

---

## **Fichiers concernés**
- `/chemin/vers/fichier1`
- `/chemin/vers/fichier2`

_EXEMPLE :_
- `/pages/preparation-jeune.js`
- `/components/SynthesePreparation.js`

---

### Etape 1 — **Audit des risques préalable**
1. _Lister tous les risques : technique, UX, sécurité, conflit, régression, perte de données, robustesse, accessibilité, etc._
2. _Identifier l’ordre de tous les hooks React (useState, useEffect, etc.) afin de s’assurer qu’ils sont déclarés uniquement en haut du corps du composant fonctionnel, et jamais dans une fonction, une boucle, un map, un if, etc. (respect strict des règles officielles des hooks)_
3. _Documenter ces risques en points de vigilance à intégrer dans la checklist du contrôle qualité_
4. _Consulter le fichier d’anomalies rollback avant toute modification_

_EXEMPLE :_
- Risque : Runtime TypeError si un hook est utilisé avant import ou initialisation.
- Risque UX : Perte de fonction d’enregistrement si la déclaration est déplacée.
- Risque robustesse : Oubli d’un useEffect ➔ Non mise à jour d’état.

---

### Etape 2 — **Sous-checklist à valider systématiquement**
- [ ] Vérification de la présence/import de toutes les fonctions, hooks et variables utilisées dans le code modifié

_EXEMPLE :_
- [ ] useState importé ?
- [ ] useEffect importé ?
- [ ] Toutes les variables présentes AVANT leur usage ?

---

### Etape 3 — **Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers)
- [ ] Tous les hooks React (useState, useEffect, etc.) sont déclarés uniquement en haut du corps du composant fonctionnel, jamais dans une fonction, une boucle, un map, un if, etc. (respect des règles officielles des hooks)
- [ ] Séparation stricte des étapes : d’abord initialisation (useState, useEffect…), puis logique calculée, puis handlers/fonctions, puis rendu
- [ ] Vérification : toute fonction ou handler utilisé dans le rendu est présent et initialisé avant usage  
- [ ] Ordre et portée logiques stricts (jamais déclaration, appel ou usage prématuré)  
- [ ] Pas de doublons ni de déclarations superflues  
- [ ] Contrôle d’erreur systématique (compilation, runtime, SSR, rendu, accessibilité)  
- [ ] Test du rendu sur tous les cas d’usage et cas limites  
- [ ] Préservation stricte des fonctionnalités existantes : aucune suppression destructrice, aucune perte de comportement  
- [ ] Mise à jour précise et justifiée du pourcentage d’avancement  
- [ ] Toute anomalie ou erreur ➔ rollback immédiat, rapport d’anomalie avec contexte, date et heure (cf. fichier ANOMALIE)  
- [ ] Documentation claire de chaque étape, chaque validation, et toute action automatisée (Copilot/IA)
- [ ] Relecture **manuelle obligatoire** des déclarations de tous les hooks, variables et fonctions AVANT chaque utilisation. NE PAS se baser sur la mémoire du modèle Copilot.
- [ ] Validation utilisateur OBLIGATOIRE avant toute implémentation
- [ ] Toutes les cases ci-dessus doivent être cochées et documentées avant de poursuivre.

_EXEMPLE :_
- [ ] J’ai relu, ligne par ligne et **manuellement**, la déclaration de tous les useState et useEffect AVANT chaque appel.

---

### Etape 4 — **Contrôles conformité à réaliser (en suivant l’ordre ci-dessous)**
_Ex : tests de sauvegarde/restauration, accessibilité, non-régression, performance, multi-device, compatibilité, échappement, robustesse, cas limites_

1. Lire toutes les entrées d'anomalies enregistrées dans le fichier anomalies rollback afin d’identifier les points de vigilance pour anticiper le risque d’erreur similaire lors du codage de cette modification.  
   **ATTENTION : aucune suppression ne doit être effectuée sur le fichier rollback lors de l’ajout d’une entrée, tout doit être ajouté à la suite, la traçabilité doit être totale.**
2. Suite à cette analyse, créer une checklist de contrôle à appliquer avant le codage pour s'assurer d'un codage conforme, à ajouter dans la section Point de vigilance.
3. Ajouter l’analyse de l’audit des risques et s’assurer qu'il n’y a aucune anomalie bloquante avant d’implémenter la modification.
4. _Si à ce stade une anomalie/bug est identifié, proposition immédiate de rollback à l’endroit où l'anomalie a été détectée (pour revenir à l’état où il n’y avait pas de bug) à confirmer avec l’utilisateur (ou revenir à l’état initial du code avant modification), documenter automatiquement dans le fichier Anomalie rollback avec date et heure._

_EXEMPLE :_
- 21/11/2025 — Entrée rollback : erreur SSR car useEffect appelé dans une boucle
- Checklist créée : vérifier appel de tous les hooks en haut du composant

---

### Etape 5 — **Mise à jour de l’avancement**
- [ ] Non commencé | [ ] En cours | [ ] Terminé  
- Avancement précis/Pourcentage réel (**à MAJ à chaque étape**) : ____ %
- Historique des mises à jour : ___

_EXEMPLE :_
- 22/11/2025, Avancement 30 % — Checklist d’import réalisée

---

### Etape 6 — **Point de vigilance**
1. Mettre ici le rapport lié à la lecture des entrées du fichier anomalies rollback adapté à la mise à jour actuelle (cf. Etape 4).
2. Lister les erreurs similaires que la modification pourrait générer, suite au retour d’expérience documenté dans le fichier, afin de les éviter.
3. Créer la checklist de vérification/point de vigilance, informer l’utilisateur que l’étape a été réalisée et indiquer l’impact attendu.

_EXEMPLE :_
- Problème potentiel useState appelé dans un if : vérifier partout qu’aucun hook ne l’est.
- Anomalie rollback 20/11/2025 : double déclaration de useEffect ➔ contrôle obligatoire.

---

### Etape 7 — **Proposition de rollback**
_Pour tout risque ou anomalie détecté :_
- Décrire l’action de rollback, son contexte (fichier, modification en cause), l’alternative sûre proposée.
- Ajouter cette donnée dans le fichier ANOMALIE rollback : date, heure, détail complet pour traçabilité.
- **Aucune suppression dans le fichier, toujours ajouter à la suite.**

_EXEMPLE :_
- Rollback déclenché le 22/11/2025, 12h41 — raison : apparition erreur SSR sur composant, retour à la version taguée v1.7.0.

---

### Etape 8 — **Rapport Markdown Copilot**
1. Générer un rapport structuré AVANT et APRÈS toute modification (structure, fonctions, hooks, changements, etc.).
2. Ce rapport doit permettre une validation éclairée, claire et synthétique.
3. À valider par l’utilisateur avant code.

_EXEMPLE :_
#### AVANT
- useState non importé, déclaration dans bloc conditionnel
- debugInfo non initialisé

#### APRÈS
- useState importé en haut
- debugInfo initialisé avant tout usage
- Plus d’erreur de compilation

---

### Etape 9 — **Validation explicite de l’utilisateur (OBLIGATOIRE)**
- [ ] Plan validé par l’utilisateur à la date : ___

---

## 📝 **EXEMPLE DE TÂCHE DÉTAILLÉE**

### Titre de la tâche  
Enrichir `/pages/preparation-jeune.js` pour intégrer la progression réelle et une synthèse personnalisée

**Description**  
Permettre à l’utilisateur de suivre sa progression, valider chaque critère, personnaliser le message final, et voir une synthèse claire à la fin (respect stricte de la séparation initialisation/logique/handler/rendu).

**Fichiers concernés**
- `/pages/preparation-jeune.js`
- `/components/SynthesePreparation.js`

**Audit des risques**
- Régression sur la logique d’éligibilité
- Perte de données ou de notifications
- Conflit avec l’existant sur les hooks de sauvegarde
- Potentiel problème SSR si useEffect mal placé  
- Non-respect du flow initialisation ➔ logique ➔ handler ➔ rendu  
- [En cas de risque] : rollback automatique, rapport détaillé dans `ANOMALIE rollback`, avec heure

**Checklist stricte**  
- [ ] Lecture complète du composant et de tous les hooks actuels
- [ ] Initialisation de tous les nouveaux hooks/états en début de composant
- [ ] Ajout de la logique métier (synthèse) après initialisation, sans écraser l’existant
- [ ] Handlers/fonctions (onChange, onComplete) déclarés avant leur utilisation dans le rendu
- [ ] Zéro doublon, tout hook déclaré une fois
- [ ] Test sur tous les cas limites (ex : progression à 100 % dès le début, pas de progression…)
- [ ] Aucun comportement supprimé ou modifié sans relecture intégrale et rapport
- [ ] Rapport Markdown avant/après code généré
- [ ] Validation utilisateur explicitement requise avant commit

**Contrôles qualité**
- Test sauvegarde, restauration, accessibilité, non-régression, cohérence UI, test multi-device

**Mise à jour de l’avancement**
- [x] Non commencé | [ ] En cours | [ ] Terminé
- Progression : 0 %
- Historique : 22/11/2025, démarrage

---

# 🟢 Amélioration continue Copilot

- Toujours relier explicitement chaque action utilisateur (ex : validation de la modale) à la mise à jour des états métier (activation, initialisation des critères, affichage dynamique).
- **Relecture manuelle obligatoire** à chaque étape : ne pas supposer que la mémoire Copilot suffit, lecture ligne à ligne humaine imposée.
- Vérifier systématiquement que chaque étape du plan est traduite en code et testée dans le workflow réel (affichage, activation, réinitialisation, feedback).
- Après chaque modification, tester le parcours complet utilisateur et documenter le résultat (capture, rapport d’exécution).
- Ne jamais supposer qu’un état est synchronisé sans vérification concrète (affichage, console, tests).
- Ajouter un contrôle visuel ou un feedback à chaque action clé pour garantir la conformité UX et métier.
- Documenter toute anomalie ou écart dans le fichier dédié et proposer immédiatement une correction ou un rollback (ajout à la fin du fichier, jamais suppression).
- Relire le plan et le template avant chaque implémentation pour s’assurer que toutes les étapes sont respectées.
- Se parler à soi-même (Copilot/humain) : « Ai-je bien relié chaque étape du plan au code ? Ai-je testé le workflow complet ? Ai-je documenté chaque action et chaque anomalie ? »

**Rollback automatique (si nécessaire)**
- Inversion immédiate du code (rollback Git)
- Signalement fichier ANOMALIE rollback (date/heure), détail impact, **ajout en fin de fichier uniquement**
- Proposition alternative si risque

**Rapport Markdown Copilot** (date/heure)
- Rapport initial, et rapport après modif, détaillant changements dans chaque section (initialisation, logique, handlers, rendu)
- Toujours relier explicitement chaque action utilisateur (ex : validation de la modale) à la mise à jour des états métier (activation, initialisation des critères, affichage dynamique).
- Vérifier systématiquement que chaque étape du plan est traduite en code et testée dans le workflow réel (affichage, activation, réinitialisation, feedback).
- Après chaque modification, tester le parcours complet utilisateur et documenter le résultat (capture, rapport d’exécution).
- Ne jamais supposer qu’un état est synchronisé sans vérification concrète (affichage, console, tests).
- Ajouter un contrôle visuel ou un feedback à chaque action clé pour garantir la conformité UX et métier.
- Documenter toute anomalie ou écart dans le fichier dédié et proposer immédiatement une correction ou un rollback (ajout à la fin du fichier, jamais suppression).
- Relire le plan et le template avant chaque implémentation pour s’assurer que toutes les étapes sont respectées.
- **Relecture manuelle systématique, pas de confiance "mémoire IA".**

---

**Validation**
- [ ] Plan validé par l’utilisateur à la date : ___

**⚠️ Copilot NE PEUT PAS générer de code avant validation explicite du plan, et doit se conformer à cette checklist/détail à CHAQUE tâche.**