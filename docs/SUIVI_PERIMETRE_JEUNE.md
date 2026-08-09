# 🌙 SUIVI PÉRIMÈTRE JEÛNE — MON PLAN VITAL
> **Fichier de continuité** — Quiconque lit ce document connaît immédiatement le but de l'app, le cycle jeûne, ce qui a été fait, ce qui est en cours et ce qui reste à faire. Si une conversation est coupée, le développement peut reprendre ici.

**Dernière mise à jour** : 09 août 2026  
**Périmètre** : Cycle jeûne complet (Préparation → Jeûne → Reprise → Consolidation)  
**Responsable périmètre actuel** : Agent Copilot (branche `copilot/fix-preparation-jeune`)

---

## 1. 🎯 BUT DE L'APPLICATION : MON PLAN VITAL

**Mon Plan Vital** est une **webapp mobile-first (PWA)** d'accompagnement nutritionnel personnalisé et bienveillant.

### L'idée centrale
Aider l'utilisateur à :
- Suivre un plan alimentaire structuré mensuellement
- Saisir facilement ses repas réels et ses extras
- Gérer un quota d'extras avec des règles précises
- Se reconnecter à sa faim réelle et à sa satiété
- Progresser vers une **autonomie totale** (sans dépendance à l'app)
- Réaliser des **cycles de jeûne** complets et sécurisés, avec suivi de bout en bout

### Créatrice
Gendra — l'app est construite sur la base de ses propres pratiques alimentaires et de jeûne.

### Stack technique
- **Next.js** (webapp mobile-first, pages dans `/pages/`)
- **Supabase** (base de données cloud, authentification)
- **localStorage** (persistance locale, fallback)
- Hébergement : Vercel

---

## 2. 🔄 LE CYCLE JEÛNE COMPLET (vision cible)

Le cycle jeûne est le **cœur métier le plus riche** de l'application. Il se déroule en 6 étapes enchaînées :

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PARCOURS COMPLET CYCLE JEÛNE                     │
└─────────────────────────────────────────────────────────────────────┘

ÉTAPE 1 — PRÉPARATION (30 jours avant le jeûne)     ✅ IMPLÉMENTÉE
  → /pages/preparation-jeune.js
  → 9 critères progressifs, 3 phases (J-30 à J-0)

ÉTAPE 2 — JEÛNE (durée variable : 3 à 14 jours)     🟡 PARTIELLEMENT IMPLÉMENTÉE
  → /pages/jeune.js
  → Comportement quotidien, suivi ressenti, poids, émotions

ÉTAPE 3 — REPRISE ALIMENTAIRE (2× durée du jeûne)   ✅ IMPLÉMENTÉE
  → /pages/reprise-alimentaire-apres-jeune.js
  → Phases progressives, aliments autorisés par jour

ÉTAPE 4 — CONSOLIDATION 45 JOURS                    ❌ NON IMPLÉMENTÉE
  → /pages/consolidation-45-jours.js (À CRÉER)
  → Conservation des gains, jeûne hebdomadaire progressif

ÉTAPE 5 — PORTES DE CONSTANCE                        ❌ NON IMPLÉMENTÉE
  → Intégré au tableau de bord
  → 3 portes symboliques, messages d'ancrage

ÉTAPE 6 — ROUTINE DE VIE (récurrente)               ❌ NON IMPLÉMENTÉE
  → Jeûne 1j/semaine (lundi)
  → Jeûne 7j tous les 45-60 jours
  → Jeûne 10-14j 1x/trimestre
```

---

## 3. 📁 MON PÉRIMÈTRE : ÉTAPE 1 — LA PRÉPARATION JEÛNE

Le périmètre de cette conversation est **l'étape 1 uniquement** : la préparation au jeûne, de J-30 à J-0.

### Ce que ça couvre
- L'utilisateur saisit la date de son jeûne futur (J0)
- L'app calcule automatiquement où il en est (ex : J-17, J-10, J-3)
- 3 phases s'affichent avec leurs critères à valider
- Chaque critère a un jalon d'activation et une fenêtre de validation
- L'utilisateur valide ses critères au fil des jours (manuellement ou automatiquement via ses repas)
- À J-0, un résumé/score de préparation est affiché avant de démarrer le jeûne

---

## 4. 🗂️ CARTOGRAPHIE DES FICHIERS — PÉRIMÈTRE PRÉPARATION

### Pages (UI)
| Fichier | Rôle |
|---|---|
| `pages/preparation-jeune.js` | **Page principale active** — Source de vérité UI. 3 phases, 9 critères, timeline, progression, résumé. |
| `pages/start-preparation.js` | Page de démarrage — Affiche la modal, sauvegarde localStorage, redirige vers `/preparation-jeune`. |

### Composants
| Fichier | Rôle |
|---|---|
| `components/StartPreparationModal.js` | Modal de démarrage — saisie date, durée, objectif, message personnel, projection réussite. |
| `components/PhaseCard.js` | Carte d'une phase — affiche critères, statuts (À VENIR / ACTIF / DÉPASSÉ), boutons validation. |
| `components/HeaderPreparation.js` | Bandeau de la page préparation. |
| `components/FeedbackPreparation.js` | Feedback utilisateur. |
| `components/DetailPreparationJeune.js` | Affichage détaillé d'une préparation. |
| `components/CartePreparationJeune.js` | Carte d'une préparation terminée (historique). |

### Lib (logique métier partagée)
| Fichier | État | Rôle |
|---|---|---|
| `lib/preparationJeuneMetier.js` | ⚠️ **DÉSYNCHRONISÉ** | Module partagé — phases, critères, jalons. Contient encore l'**ancien modèle** (J-14/J-7/J0, 6 critères). À corriger. |
| `lib/validerCriterePreparation.js` | ✅ OK | Validation critères — `isPeriodeActive`, `getFenetreValidation`, `validerCritereAuto`, `getStatutCritereAuto`, analyses repas (portions, féculents, hydratation, heure, durée). |
| `lib/preparationsJeune.js` | ✅ OK | CRUD historique — localStorage + Supabase (`preparations_jeune`). |
| `lib/phasesPreparation.js` | ⚠️ VIDE | Fichier présent mais sans logique. À surveiller. |
| `lib/parcoursJeuneAPI.js` | ✅ OK | API parcours jeûne complet — détection J-3 fin de jeûne, génération programme de reprise. |
| `lib/notesPreparationJeune.js` | ✅ OK | Notes liées à la préparation. |
| `lib/statistiquesPreparationsJeune.js` | ✅ OK | Statistiques préparations. |
| `lib/comparePreparationsJeune.js` | ✅ OK | Comparaison entre deux préparations. |

---

## 5. 📐 LE MODÈLE CANONIQUE (source de vérité = `preparation-jeune.js`)

### 3 phases avec jalons réels
```
Phase 1 : Allègement      →  J-30 à J-18  (critères jalon 30)
Phase 2 : Végétalisation  →  J-17 à J-9   (critères jalons 17, 14, 12)
Phase 3 : Pré-jeûne       →  J-7  à J-0   (critères jalon 7)
```

### 9 critères métier avec jalons
```
id  jalon  Description
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

### Fenêtres de validation
```
jalon -30              → validable jusqu'à J-18 (12 jours de marge)
jalons -17, -14, -12   → validables jusqu'à J-8
jalon -7               → validable jusqu'à J-0
```

> **Règle d'or** : La source de vérité est `preparation-jeune.js`. Tout fichier lib qui s'en écarte est à corriger par **convergence vers cette référence**, pas en remplaçant la page.

---

## 6. 🔑 STOCKAGE (localStorage + Supabase)

### localStorage — clés utilisées par le module préparation
| Clé | Contenu |
|---|---|
| `preparationActive` | `'true'` si une préparation est en cours |
| `preparationData` | JSON complet (date, durée, objectif, messages…) |
| `dateJeune` | Date du jeûne (ISO string) |
| `dureeJeune` | Durée du jeûne en jours |
| `goal` | Objectif de l'utilisateur |
| `messagePersoPreparation` | Message personnel |
| `preparationJeuneCriteres` | `{ [critereId]: { validé, dateValidation, typeValidation } }` |
| `criteresPreparation` | Liste des critères avec statut (utilisé par `/preparation-jeune.js`) |
| `critere3Engagement` | Config critère 3 (action après repas) |
| `critere6Config` | Config critère 6 (jeûnes plein : dates prévues/effectués) |
| `historiquePreparationsJeune` | Tableau des préparations terminées |

### Supabase — tables du module préparation
| Table | État | Rôle |
|---|---|---|
| `preparations_jeune` | ✅ EXISTE | Sauvegarde/sync des préparations (lib/preparationsJeune.js) |
| `parcours_jeune` | ❌ À CRÉER | Lien préparation → jeûne → reprise (continuum du parcours) |

---

## 7. ✅ CE QUI EST FAIT ET FONCTIONNE

### Page préparation-jeune.js
- ✅ Affichage des 3 phases (Allègement, Végétalisation, Pré-jeûne) avec dates calculées dynamiquement
- ✅ 9 critères métier avec jalons corrects
- ✅ Fenêtres de validation implémentées (J-30→J-18, J-17/14/12→J-8, J-7→J-0)
- ✅ 3 états des critères : À VENIR / ACTIF / DÉPASSÉ
- ✅ Messages pédagogiques pour critères dépassés
- ✅ Validation manuelle via bouton (verrouillée hors période)
- ✅ Barre de progression globale (X/9 critères)
- ✅ Timer minuit pour mise à jour automatique de la date (jCourant recalculé chaque nuit)
- ✅ Bannière "Lever de soleil" avec date/heure du jour
- ✅ Pattern client-only respecté (isMounted + localStorage)

### Validation automatique des critères (via repas saisis dans /suivi)
- ✅ Critère 1 : Portions respectées (détecté via repères visuels dans quantité saisie)
- ✅ Critère 2 : Pas de féculents le soir (détecté via catégorie + type de repas)
- ✅ Critère 7 : Hydratation ≥ 2L/jour (compté via mots-clés eau/tisane)
- ❌ Critères 3, 4, 5, 6, 8, 9 : non encore auto-détectés

### Historique des préparations
- ✅ Sauvegarde locale (localStorage `historiquePreparationsJeune`)
- ✅ Sync Supabase (`preparations_jeune`)
- ✅ Page `/historique-preparations-jeune.js` fonctionnelle

### Modal de démarrage (StartPreparationModal.js)
- ✅ Saisie date du jeûne, durée, objectif
- ✅ Message personnel (texte ou audio — audio à venir)
- ✅ Projection sur la réussite (texte ou audio)
- ✅ Analyse comportementale des 3 derniers jours de repas
- ✅ Affichage de la phase du jour selon date choisie
- ⚠️ Importe depuis `preparationJeuneMetier.js` → affiche l'**ancien modèle** (bug actif)

### Composant PhaseCard
- ✅ Affichage critères avec états visuels colorés
- ✅ Bouton "Valider" actif/inactif selon période
- ✅ Messages explicatifs pour critères À VENIR et DÉPASSÉ
- ✅ Guidances détaillées pour chaque critère
- ✅ Config spéciale critère 3 (engagement action après repas)
- ✅ Config spéciale critère 6 (planification des jeûnes plein)

---

## 8. 🚨 ANOMALIE EN COURS — À CORRIGER EN PRIORITÉ

### `lib/preparationJeuneMetier.js` est DÉSYNCHRONISÉ

**Problème** : Ce fichier contient l'**ancien modèle** :
- Phase 1 : J-14 à J-8, 2 critères (repas sans protéines animales, pas de repas après 19h)
- Phase 2 : J-7 à J-1, 2 critères
- Phase 3 : J-0, 2 critères

**Impact** : `StartPreparationModal.js` importe ce fichier pour afficher la "phase du jour" → l'utilisateur voit de mauvais critères dans la modal de démarrage.

**Ce qu'il faut faire** :
1. Remplacer le contenu de `PHASES_PREPARATION` dans `preparationJeuneMetier.js` par le modèle à 3 phases / 9 critères / jalons J-30
2. Conserver les mêmes noms de fonctions exportées (elles sont importées partout)
3. Ajouter le champ `objectif` sur chaque phase (affiché dans la modal)
4. Vérifier que `StartPreparationModal.js` affiche bien les nouvelles phases après correction
5. Vérifier que `preparation-jeune.js` continue à fonctionner identiquement

> ⚠️ Ne pas modifier `preparation-jeune.js` — c'est la référence active en production.

---

## 9. 🔧 CE QUI EST EN COURS

### Travail de cette conversation (branche `copilot/fix-preparation-jeune`)
- [x] Lecture complète de tous les fichiers du périmètre
- [x] Création du fichier `docs/BRIEFING_PERIMETRE_PREPARATION_JEUNE.md` (briefing technique)
- [x] Création de ce fichier `docs/Suivi perimetre Jeûne.md` (suivi de continuité)
- [ ] **Correction de `lib/preparationJeuneMetier.js`** (anomalie prioritaire — à faire en prochain)

---

## 10. 📋 CE QUI RESTE À FAIRE (par priorité)

### 🔴 PRIORITÉ 1 — À faire dès la prochaine session
| # | Tâche | Fichiers impactés |
|---|---|---|
| 1 | **Corriger `preparationJeuneMetier.js`** : aligner sur le modèle à 3 phases / 9 critères | `lib/preparationJeuneMetier.js`, vérifier `StartPreparationModal.js` |
| 2 | **Compléter la validation auto** des critères 3, 4, 5, 6, 8, 9 | `lib/validerCriterePreparation.js`, `pages/preparation-jeune.js` |
| 3 | **Créer table Supabase `parcours_jeune`** pour lier préparation → jeûne → reprise | Script SQL + `lib/parcoursJeuneAPI.js` |

### 🟡 PRIORITÉ 2 — Court terme (3-5 sessions)
| # | Tâche | Fichiers impactés |
|---|---|---|
| 4 | Bouton "Démarrer mon jeûne" à J-0 dans `/preparation-jeune.js` avec transition vers `/jeune` | `pages/preparation-jeune.js` |
| 5 | Résumé/score de préparation final à J-0 (score sur 9, critères validés/manqués, conseils) | `pages/preparation-jeune.js` |
| 6 | Mini-préparation pour démarrage tardif (si user commence après J-10 : modal d'avertissement + options) | `pages/preparation-jeune.js`, `components/StartPreparationModal.js` |

### 🟢 PRIORITÉ 3 — Moyen terme (amélioration UX)
| # | Tâche | Fichiers impactés |
|---|---|---|
| 7 | Barre de progression par phase (ex : "2/3 critères validés en Phase 1") | `components/PhaseCard.js` |
| 8 | Badge "Phase terminée ✅" quand tous les critères d'une phase sont validés | `components/PhaseCard.js`, `pages/preparation-jeune.js` |
| 9 | Animation confettis lors de la validation d'un critère | `pages/preparation-jeune.js` |
| 10 | Message audio/vidéo personnel (enregistrement vocal) — bouton audio déjà UI | `components/StartPreparationModal.js` |

### ⬛ PRIORITÉ 4 — Long terme (autres étapes du cycle jeûne)
| # | Tâche |
|---|---|
| 11 | Implémenter **Étape 4 : Consolidation 45 jours** (`/pages/consolidation-45-jours.js`) |
| 12 | Implémenter **Étape 5 : Portes de constance** (intégré tableau de bord) |
| 13 | Implémenter **Étape 6 : Routine de vie** (jeûnes récurrents) |
| 14 | Dashboard unifié affichant tout le parcours (préparation → jeûne → reprise) |
| 15 | Export PDF du bilan complet de cycle |
| 16 | Système de badges de motivation |

---

## 11. 🧭 RÈGLES À RESPECTER POUR TOUTE MODIFICATION

1. **Ne jamais modifier `preparation-jeune.js` sans raison précise** — c'est la page active en production
2. **La source de vérité des critères et phases EST `preparation-jeune.js`** — tout écart dans les lib est un bug
3. **Corriger par convergence** : aligner les lib sur la page, jamais l'inverse
4. **Tester sur `/preparation-jeune`** après chaque changement de lib partagée
5. **Ne pas supprimer les données localStorage** lors d'une migration (compatibilité montante obligatoire)
6. **Valider `StartPreparationModal.js`** après tout changement dans `preparationJeuneMetier.js`
7. **Ne pas créer de logique métier dans les pages** — la mettre dans les lib
8. **Tout changement dans un fichier lib partagé** doit être tracé ici dans ce fichier de suivi

---

## 12. 🔁 FLUX UTILISATEUR COMPLET (état actuel)

```
Tableau de bord / Accueil
  → Bouton dynamique selon état :
      - Pas de préparation : [Démarrer ma préparation]
      - Préparation en cours : [Continuer ma préparation]
      - Jeûne en cours : [Continuer mon jeûne]
  ↓
/start-preparation (page dédiée ou pop-up)
  → StartPreparationModal.js
      Saisie : date jeûne, durée, objectif, message perso, projection réussite
      Sauvegarde : localStorage (preparationActive, dateJeune, preparationData...)
  ↓
Redirection vers /preparation-jeune
  → Calcul jCourant = -(jours avant J0, mis à jour chaque nuit à minuit)
  → Affiche 3 phases avec dates réelles
  → Affiche 9 critères avec statuts (À VENIR / ACTIF / DÉPASSÉ)
  → Validation manuelle ou automatique (via repas saisis dans /suivi)
  → Sauvegarde critères dans localStorage + Supabase
  ↓
À J-0 (jour du jeûne) :
  → [À implémenter] Résumé/score de préparation
  → [À implémenter] Bouton [Démarrer mon jeûne] → /jeune
  ↓
/jeune → /reprise-alimentaire-apres-jeune → /consolidation-45-jours → routine de vie
```

---

## 13. 📅 HISTORIQUE DES SESSIONS DE TRAVAIL

| Date | Travail effectué |
|---|---|
| Nov 2025 | Mise en place du workflow interactif préparation-jeune.js (bouton démarrer, états, handlers) |
| Nov 2025 | Correction anomalie handler `handleStartPreparation` hors du useEffect |
| Déc 2025 | Consolidation des 9 critères — analyse des écarts, jalons alignés |
| Déc 2025 | Implémentation fenêtres de validation (J-30→J-18, J-17/14/12→J-8, J-7→J-0) |
| Déc 2025 | Validation automatique partielle (critères 1, 2, 7) via analyse repas |
| Déc 2025 | PhaseCard — guidances détaillées, critères 3 et 6 avec configs spéciales |
| Déc 2025 | Analyse écarts cycle jeûne complet (étapes 1→6 cartographiées) |
| 27 Déc 2025 | Rapport d'état complet — 80% fonctionnel, points restants documentés |
| 08 Août 2026 | Création `BRIEFING_PERIMETRE_PREPARATION_JEUNE.md` — briefing technique complet |
| 09 Août 2026 | Création de ce fichier `Suivi perimetre Jeûne.md` — document de continuité |

---

## 14. ⚡ POUR REPRENDRE LE TRAVAIL IMMÉDIATEMENT

Si tu lis ce fichier pour la première fois et que tu veux être opérationnel :

1. **Lis** `docs/BRIEFING_PERIMETRE_PREPARATION_JEUNE.md` pour le détail technique
2. **Ouvre** `pages/preparation-jeune.js` — c'est la référence centrale
3. **Compare** avec `lib/preparationJeuneMetier.js` — note les écarts (ancien vs nouveau modèle)
4. **La prochaine tâche** est : aligner `lib/preparationJeuneMetier.js` sur le modèle de `preparation-jeune.js`
5. **Ne touche pas** `preparation-jeune.js` — ça marche, c'est la référence
6. **Teste** toujours sur `/preparation-jeune` et `/start-preparation` après chaque modif lib

> **Règle de survie** : En cas de doute, `preparation-jeune.js` a toujours raison.
