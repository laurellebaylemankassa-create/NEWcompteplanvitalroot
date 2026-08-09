# 📋 BRIEFING — PÉRIMÈTRE « PRÉPARATION JEÛNE »
> Ce document permet à un nouvel intervenant de comprendre immédiatement l'état du module et d'être opérationnel sans lire toute la codebase.

---

## 1. PÉRIMÈTRE EN UN COUP D'ŒIL

Le module **Préparation jeûne** couvre le parcours de l'utilisateur de **J-30 à J-0** (la veille du jeûne). Il est **distinct** du module jeûne lui-même (`/pages/jeune.js`) et du module reprise alimentaire.

---

## 2. FICHIERS DU PÉRIMÈTRE (lire dans cet ordre)

### Pages (UI)
| Fichier | Rôle |
|---|---|
| `pages/preparation-jeune.js` | **Page principale** — Source de vérité de l'UI. Contient les 3 phases, les 9 critères, la timeline J-30 à J-0, la validation manuelle et la synthèse. |
| `pages/start-preparation.js` | Page de démarrage — Affiche `StartPreparationModal`, sauvegarde les données dans le localStorage et redirige vers `/preparation-jeune`. |

### Composants
| Fichier | Rôle |
|---|---|
| `components/StartPreparationModal.js` | Modal de démarrage — Saisie date du jeûne, durée, objectif, message personnel, projection réussite. Importe depuis `preparationJeuneMetier.js` pour afficher la phase et les critères du jour selon la date choisie. |
| `components/PhaseCard.js` | Carte d'une phase — Affiche les critères, leurs statuts (À VENIR / ACTIF / DÉPASSÉ), les boutons de validation. Gère l'engagement sur le critère 3 (action après repas) et la configuration du critère 6 (jeûnes plein). |
| `components/HeaderPreparation.js` | Bandeau de la page préparation. |
| `components/FeedbackPreparation.js` | Feedback utilisateur sur la préparation. |
| `components/DetailPreparationJeune.js` | Affichage détaillé d'une préparation. |
| `components/CartePreparationJeune.js` | Carte d'aperçu d'une préparation terminée (pour l'historique). |

### Lib (logique métier partagée)
| Fichier | Rôle | ⚠️ Alerte |
|---|---|---|
| `lib/preparationJeuneMetier.js` | Module partagé — Contient `PHASES_PREPARATION`, `getPhaseDuJour`, `getCriteresDuJour`, `validerCriteresDuJour`, `getPhasesPreparation`. | **DÉSYNCHRONISÉ** : ce fichier utilise encore l'ancien modèle J-14/J-7/J0 (2 phases + 1 pré-jeûne, 2 critères par phase). Ce n'est **pas** la version active. |
| `lib/validerCriterePreparation.js` | Validation des critères — `isPeriodeActive`, `getFenetreValidation`, `getStatutCritere`, `validerCriterePreparation`, `validerCritereAuto`, `getStatutCritereAuto`, fonctions d'analyse des repas (portions, féculents, hydratation, heure repas, durée repas). |  |
| `lib/preparationsJeune.js` | CRUD historique préparations — localStorage + Supabase (`preparations_jeune`). |  |
| `lib/phasesPreparation.js` | Vide dans la branche courante (fichier présent, aucune logique). |  |
| `lib/parcoursJeuneAPI.js` | API du parcours jeûne complet — Détection J-3 fin de jeûne, génération automatique du programme de reprise, transitions préparation→jeûne→reprise. |  |
| `lib/jeuneUtils.js` | Utilitaires jeûne. |  |
| `lib/notesPreparationJeune.js` | Notes liées à la préparation. |  |
| `lib/statistiquesPreparationsJeune.js` | Statistiques. |  |
| `lib/comparePreparationsJeune.js` | Comparaison entre deux préparations. |  |

---

## 3. LE MODÈLE CANONIQUE (source de vérité = `preparation-jeune.js`)

### 3 phases avec jalons réels
```
Phase 1 : Allègement      →  de J-30 à J-18  (critères jalons 30)
Phase 2 : Végétalisation  →  de J-17 à J-9   (critères jalons 17, 14, 12)
Phase 3 : Pré-jeûne       →  de J-7  à J-0   (critères jalons 7)
```

### 9 critères métier avec jalons
```
id  jalon  label
1   J-30   Respect strict des quantités à chaque repas
2   J-17   Supprimer les féculents le soir (lun-dim)
3   J-17   Action immédiate après le repas (marche/ménage)
4   J-14   Éliminer tous produits transformés
5   J-14   Éliminer toutes sucreries
6   J-12   2 jours de jeûne plein (préparation métabolique)
7   J-7    2 litres d'eau par jour
8   J-7    Pas de repas après 19h00
9   J-7    Plage alimentaire limitée à 45 minutes par repas
```

### Fenêtres de validation (dans `validerCriterePreparation.js`)
```
jalon -30         → validable jusqu'à J-18 (12 jours)
jalons -17/-14/-12 → validables jusqu'à J-8
jalon -7          → validable jusqu'à J-0
```

---

## 4. ANOMALIE MAJEURE : `preparationJeuneMetier.js` DÉSYNCHRONISÉ

**Problème** : `preparationJeuneMetier.js` contient encore l'**ancien** modèle :
- Phase 1 : J-14 à J-8, 2 critères (repas sans protéines animales, aucun repas après 19h)
- Phase 2 : J-7 à J-1, 2 critères
- Phase 3 : J-0, 2 critères

Ce fichier est **importé** par `StartPreparationModal.js` (`getPhaseDuJour`, `getCriteresDuJour`, `validerCriteresDuJour`) et par `preparation-jeune.js` (`getPhasesPreparation`, `getPhaseDuJour`, `getCriteresDuJour`, `validerCriteresDuJour`).

**Impact** : La modale de démarrage affiche une phase/des critères issus de l'ancien modèle — pas du modèle à 9 critères que l'utilisateur voit sur `/preparation-jeune`.

**Ce qu'il faut faire** : Aligner `preparationJeuneMetier.js` sur le modèle canonique de `preparation-jeune.js` (3 phases, 9 critères, jalons J-30 à J-7).

---

## 5. FLUX UTILISATEUR ACTUEL

```
Tableau de bord
  → [Démarrer préparation]
  → /start-preparation (pop-up ou page pleine)
      → StartPreparationModal.js
          Saisie: date jeûne, durée jeûne, objectif, message, projection
          Sauvegarde localStorage: dateJeune, dureeJeune, goal, preparationActive, preparationData
  → Redirection vers /preparation-jeune
      Affiche: 3 phases, 9 critères, timeline, progression
      Calcule: jCourant = -(jours avant J0)
      Statut critères: À VENIR / ACTIF / DÉPASSÉ selon jCourant et fenêtre
      Validation: manuelle (bouton) ou auto (analyse repas 7 derniers jours)
```

---

## 6. STOCKAGE (localStorage)

| Clé | Contenu |
|---|---|
| `preparationActive` | `'true'` si préparation en cours |
| `preparationData` | JSON complet de la préparation (date, durée, objectif…) |
| `dateJeune` | Date du jeûne (ISO string) |
| `dureeJeune` | Durée du jeûne en jours |
| `goal` | Objectif de l'utilisateur |
| `messagePersoPreparation` | Message personnel |
| `preparationJeuneCriteres` | `{ [critereId]: { validé, dateValidation, typeValidation } }` |
| `criteresPreparation` | Liste des critères avec leur statut (utilisé par `/preparation-jeune.js`) |
| `critere3Engagement` | Config engagement critère 3 (action après repas) |
| `critere6Config` | Config critère 6 (jeûnes plein : dates prévues, effectués) |
| `historiquePreparationsJeune` | Tableau des préparations terminées |

---

## 7. SUPABASE

| Table | Utilisation |
|---|---|
| `preparations_jeune` | Sauvegarde/sync des préparations (lib/preparationsJeune.js) |
| `parcours_jeune` | **Non encore créée** — prévue pour lier préparation → jeûne → reprise |

---

## 8. CE QUI FONCTIONNE AUJOURD'HUI ✅

- Affichage des 3 phases avec dates calculées dynamiquement
- 9 critères avec jalons, statuts et fenêtres de validation
- Validation manuelle via bouton (avec verrouillage hors période)
- Validation automatique partielle : critères 1, 2, 7 (via analyse repas 7j)
- Barre de progression globale
- Historique des préparations (localStorage + Supabase)
- Bannière "Lever de soleil" + timer minuit pour mise à jour automatique

---

## 9. CE QUI RESTE À FAIRE ❌

1. **Aligner `preparationJeuneMetier.js`** sur le modèle à 9 critères (priorité haute — anomalie actuelle)
2. **Compléter la validation auto** pour critères 3, 4, 5, 6, 8, 9
3. **Créer la table `parcours_jeune`** et lier préparation → jeûne → reprise
4. **Mini-préparation** pour démarrage tardif (< J-10)
5. **Résumé final à J-0** (score de préparation, conseils personnalisés)
6. **Barre de progression par phase** + badge "Phase terminée"

---

## 10. RÈGLES À RESPECTER POUR TOUTE MODIFICATION

1. **Ne pas toucher** à `preparation-jeune.js` sans avoir compris l'ensemble (c'est la page critique en production)
2. **La source de vérité des critères et phases est `preparation-jeune.js`** — toute modification du modèle métier part de là
3. **Corriger `preparationJeuneMetier.js` par convergence** : aligner sur `preparation-jeune.js`, pas l'inverse
4. **Tester sur la page `/preparation-jeune`** après chaque changement dans les lib partagées
5. **Ne pas supprimer les données localStorage** existantes des utilisateurs lors d'une migration de modèle
6. **Valider que `StartPreparationModal.js` affiche bien les bonnes phases** après tout changement dans `preparationJeuneMetier.js`
