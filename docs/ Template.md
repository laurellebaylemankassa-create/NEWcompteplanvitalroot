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

Etape 1
## **Audit des risques préalable**
- 1 _Lister tous les risques : technique, UX, sécurité, conflit, régression, perte de données, robustesse, accessibilité, etc._
- 2 Identifier l’ordre de tous les hooks React (useState, useEffect, etc.) afin de s’assurer qu’ils sont déclarés uniquement en haut du corps du composant fonctionnel, et jamais dans une fonction, une boucle, un map, un if, etc. (respect strict des règles officielles des hooks)
- 3 documenter ces risque en point de vigilance et a integrer dans la cheklist du controle qualité
Etape 2 
1- **Sous-checklist à valider systématiquement :**
- [ ] Vérification de la présence/import de toutes les fonctions, hooks et variables utilisées dans le code modifié

Etape3 ## **Checklist stricte sécurité & qualité (à cocher AVANT toute modification)**
- [ ] Lecture complète du code concerné (dépendances, hooks, variables, fonctions…)
- [ ] Initialisation systématique avant usage (hooks, variables, handlers) 
 - [ ] Tous les hooks React (useState, useEffect, etc.) sont déclarés uniquement en haut du corps du composant fonctionnel, jamais dans une fonction, une boucle, un map, un if, etc. (respect strict des règles officielles des hooks) 
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

Etape 4 ## **Contrôles conformité à réaliser en suivant les etapes suivantes**  
_Ex : tests de sauvegarde/restauration, accessibilité, non-régression, performance, multi-device, compatibilité, échappement, robustesse, cas limites_
- 1  Lire toutes les entrées d'anomalies enregistrées dans le fichier anomalies Roll back afin d identifier les points de vigilance pour anticiper le risque d'erreur similaire lors du codage de cette modification, 
2 Suite à cette analyse créer une checklist de contrôle a appliquer avant le codage pour s'assurer d'un codage conforme a ajouter dans la section Point de vigilance.
3 ici ajouter analyse de l audit des risque et s assurer qu il n a aucune anomalie pour garantir la conformité de la modification
 4 _ si a ce stade anoamie bug identifié alors proposition immédiate de rollback a l endroit ou l'anomalie a ete detecté ( pour revenir a l etat ou il n yavait pas de bug) a confirmé avec utilisateur ou revenir a l etat initial du code avant  modification , tjr documenter les anomalies rencontres dans le fichier Anomalie roll back avec date et heure_

Etape 5 ## **Mise à jour de l’avancement**  
- [ ] Non commencé | [ ] En cours | [ ] Terminé  
- Avancement précis/Pourcentage réel (**à MAJ à chaque étape**) : ____ %
- Historique des mises à jour : ___

Etape 6 ## **Point de vigilance**  
1 ici mettre le rapport lié a la lecture des entrées du fichier anomalie roll back adapté a la maj actuelle il s agit ici d'identifier les erreurs similaire que la modification de ce code pourrait generer suit au retour experience documenté dans le fichier afin de permettre de les eviter dans cette section en créant la cheklist de verification point de vigilance, informer l utilisateur quand cette etape a ete realisé et informer de l impact de cette action 
Etape 7 ## **Proposition de rollback**  
-Pour tout risque ou anomalie détecté :  
  - Décrire l’action de rollback, son contexte (fichier, modification en cause), l’alternative sûre proposée.
  - Cette donnée doit être ajouter dans le fichier ANOMALIE roll back : date, heure, détail complet pour traçabilité.

## Etape 8 **Rapport Markdown Copilot**  
1 - Générer un rapport structuré AVANT et APRÈS toute modification (structure, fonctions, hooks, changements, etc.).
2 - Ce rapport doit permettre une validation éclairée, claire et synthétique.
3 - À valider par l'utilisateur avant code.

## Etape 9 **Validation explicite de l’utilisateur (OBLIGATOIRE)**
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

## 🟢 Amélioration continue (Copilot)

- Toujours relier explicitement chaque action utilisateur (ex : validation de la modale) à la mise à jour des états métier (activation, initialisation des critères, affichage dynamique).
- Vérifier systématiquement que chaque étape du plan est traduite en code et testée dans le workflow réel (affichage, activation, réinitialisation, feedback).
- Après chaque modification, tester le parcours complet utilisateur et documenter le résultat (capture, rapport d’exécution).
- Ne jamais supposer qu’un état est synchronisé sans vérification concrète (affichage, console, tests).
- Ajouter un contrôle visuel ou un feedback à chaque action clé pour garantir la conformité UX et métier.
- Documenter toute anomalie ou écart dans le fichier dédié et proposer immédiatement une correction ou un rollback.
- Relire le plan et le template avant chaque implémentation pour s’assurer que toutes les étapes sont respectées.
- Se parler à soi-même (Copilot) : « Ai-je bien relié chaque étape du plan au code ? Ai-je testé le workflow complet ? Ai-je documenté chaque action et chaque anomalie ? »

**Rollback automatique (si nécessaire)**
- Inversion immédiate du code (rollback Git)
- Signalement fichier ANOMALIE roll back (date/heure), détail impact
- Proposition alternative si risque

**Rapport Markdown Copilot** specifiant date et heure 
- Rapport initial, et rapport après modif, détaillant changements dans chaque section (initialisation, logique, handlers, rendu)

- Toujours relier explicitement chaque action utilisateur (ex : validation de la modale) à la mise à jour des états métier (activation, initialisation des critères, affichage dynamique).
- Vérifier systématiquement que chaque étape du plan est traduite en code et testée dans le workflow réel (affichage, activation, réinitialisation, feedback).
- Après chaque modification, tester le parcours complet utilisateur et documenter le résultat (capture, rapport d’exécution).
- Ne jamais supposer qu’un état est synchronisé sans vérification concrète (affichage, console, tests).
- Ajouter un contrôle visuel ou un feedback à chaque action clé pour garantir la conformité UX et métier.
- Documenter toute anomalie ou écart dans le fichier dédié et proposer immédiatement une correction ou un rollback.
- Relire le plan et le template avant chaque implémentation pour s’assurer que toutes les étapes sont respectées.
- Se parler à soi-même (Copilot) : « Ai-je bien relié chaque étape du plan au code ? Ai-je testé le workflow complet ? Ai-je documenté chaque action et chaque anomalie ? »

---**Validation**
- [ ] Plan validé par l’utilisateur à la date : ___


**⚠️ Copilot NE PEUT PAS générer de code avant validation explicite du plan, et doit se conformer à cette checklist/detail à CHAQUE tâche.**