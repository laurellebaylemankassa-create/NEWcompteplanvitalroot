# 🎯 VISION GLOBALE & PRIORITÉS - Mon Plan Vital
**Date : 15 novembre 2025**

---

## 📍 OÙ ON EST ACTUELLEMENT ?

### ✅ CE QUI FONCTIONNE
- ✅ Page `/ideaux.js` : Paliers, séances, validation plan
- ✅ Page `/plan-action.js` : Affichage séances, suppression bonus
- ✅ Couleurs semaines (bleu/vert/gris)
- ✅ Boutons validation et navigation
- ✅ Structure database Supabase opérationnelle

### ⚠️ CE QUI MANQUE (BLOQUANT)
1. **Séances bonus** : Type (supplémentaire/remplacement) non géré
2. **Séances bonus** : Inputs distance/vitesse manquants dans plan-action.js
3. **Calcul stats** : Logique proratisée absente (impact tableaux de bord)
4. **Image motivante** : Défloutage progressif non implémenté
5. **Page jeûne** : Contenus J6-J10 manquants
6. **Page jeûne** : Données mockées (poids 72.4kg, faux repas)

---

## 🧭 PRINCIPES DE TRAVAIL (RÈGLES PERSONNELLES)

> **"Définir un temps de travail et un objectif du jour"**  
> **"Prioriser les grandes lignes - Ne pas s'attarder sur les détails"**  
> **"Ne pas chercher à tout finaliser d'un coup"**  
> **"Éviter d'être submergé·e - Valoriser l'exécution concrète"**  
> **"L'essentiel avant les détails"**

### 🎯 APPLICATION À CE PROJET
1. ✅ **Finir ce qui est commencé** (séances bonus)
2. ✅ **Consolider l'existant** (jeûne.js fonctionnel)
3. ✅ **Avancer étape par étape** (pas tout en même temps)
4. ❌ **Ne PAS se perdre dans la perfection** (80% suffisant)
5. ❌ **Ne PAS concevoir sans fin** (exécuter > planifier)

---

## 🔥 PRIORITÉS HIÉRARCHISÉES (3 NIVEAUX)

### 🔴 NIVEAU 1 - URGENT & ESSENTIEL (À FAIRE MAINTENANT)
**Durée totale : ~12h**  
**Objectif : Finir ce qui est en cours**

#### 📌 TÂCHE 1.1 - Gestion avancée séances bonus (6h)
**Pourquoi c'est urgent ?** Bloque les statistiques et l'expérience utilisateur actuelle

**Sous-tâches** :
- [ ] **A. Type de bonus dans ideaux.js** (2h)
  - Ajouter radio buttons "Supplémentaire" / "Remplacement"
  - Enregistrer `type_bonus` en BDD lors de l'ajout
  - Fichier : `/pages/ideaux.js` (modale ligne ~701)

- [ ] **B. Inputs distance/vitesse dans plan-action.js** (2h)
  - Rendre les champs modifiables pour bonus existants
  - Sauvegarder modifications en BDD
  - Fichier : `/pages/plan-action.js`

- [ ] **C. Calcul statistiques proratisé** (2h)
  - Formule : `(séances_réelles / séances_prévues) * 100`
  - Bonus "supplémentaire" → augmente numérateur
  - Bonus "remplacement" → remplace séance prévue
  - Impact : `/pages/statistiques.js` et `/pages/tableau-de-bord.js`

**Test de validation** :
- [ ] Type bonus enregistré et affiché correctement
- [ ] Distance/vitesse modifiables depuis plan-action.js
- [ ] Stats affichent % correct (ex: 10 séances prévues, 12 faites dont 2 bonus supplémentaires = 120%)

---

#### 📌 TÂCHE 1.2 - Défloutage image motivante (4h)
**Pourquoi c'est urgent ?** Fonctionnalité core de l'ancrage psychologique

**Sous-tâches** :
- [ ] **A. Ajouter colonne `progression_palier` dans table `ideaux`** (30min)
```sql
ALTER TABLE ideaux ADD COLUMN IF NOT EXISTS progression_palier NUMERIC(5,2) DEFAULT 0;
```

- [ ] **B. Calcul progression lors validation séance** (1h30)
  - Formule : `progression = (seances_validees / seances_totales_palier) * 100`
  - Sauvegarder dans BDD à chaque validation
  - Fichier : `/pages/ideaux.js` (fonction validation séance)

- [ ] **C. Appliquer blur dynamique sur image** (2h)
  - Formule CSS : `filter: blur(${100 - progression}px)`
  - Afficher dans `/pages/ideaux.js` (card idéaux)
  - Afficher dans `/pages/plan-action.js` (en-tête)

**Test de validation** :
- [ ] Image 100% floue au démarrage palier
- [ ] Défloutage progressif à chaque séance validée
- [ ] Refloutage si progression baisse (séances manquées)

---

#### 📌 TÂCHE 1.3 - Compléter contenus J6-J10 de jeune.js (2h)
**Pourquoi c'est urgent ?** Page incomplète = expérience utilisateur cassée

**Sous-tâches** :
- [ ] Copier contenus depuis `/docs/Complement info page jeune`
- [ ] Restructurer jours 6-10 avec sections complètes :
  - 🧠 Esprit (neurosciences)
  - 🧬 Corps (autophagie, cétose)
  - 🌀 Ressenti
  - 💡 Astuce
  - 🙏 Parole inspirante
  - ❤️ Résumé
- [ ] Fichier : `/pages/jeune.js` (objet `JEUNE_DAYS_CONTENT`)

**Test de validation** :
- [ ] Jour 6-10 affichent contenu détaillé (pas "Contenu à compléter")
- [ ] Toutes les sections présentes pour chaque jour

---

### 🟡 NIVEAU 2 - IMPORTANT (APRÈS NIVEAU 1)
**Durée totale : ~10h**  
**Objectif : Consolider l'existant pour qu'il soit 100% fonctionnel**

#### 📌 TÂCHE 2.1 - Intégration Supabase dans jeune.js (5h)
**Pourquoi c'est important ?** Remplacer données mockées par vraies données utilisateur

**Sous-tâches** :
- [ ] **A. Poids réel** (2h)
  - Remplacer `getPoidsDepart()` mocké (72.4kg) par requête Supabase
  - Récupérer depuis `profils.poids_actuel` ou `suivi_poids`
  - Fichier : `/pages/jeune.js`

- [ ] **B. Repas réels** (3h)
  - Remplacer `getRepasRecents()` mocké par vraie requête
  - Adapter analyse comportementale au vrai profil
  - Fichier : `/pages/jeune.js`

**Test de validation** :
- [ ] Poids affiché = dernier poids saisi par utilisateur
- [ ] Analyse J1 affiche les VRAIS 3 derniers repas
- [ ] Messages personnalisés selon vrai profil

---

#### 📌 TÂCHE 2.2 - Stockage jeûne en BDD (5h)
**Pourquoi c'est important ?** localStorage = volatile, non synchronisé

**Sous-tâches** :
- [ ] **A. Créer table `parcours_jeune`** (2h)
```sql
CREATE TABLE parcours_jeune (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(20), -- 'jeune', 'reprise', 'consolidation'
  date_debut DATE NOT NULL,
  duree_jours INTEGER,
  statut VARCHAR(20) DEFAULT 'en_cours',
  progression JSONB DEFAULT '{}'::jsonb,
  message_perso TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

- [ ] **B. Sauvegarder jeûne en BDD** (3h)
  - Créer jeûne au démarrage
  - Sauvegarder jours validés, outils, message perso
  - Garder localStorage comme cache
  - Fichier : `/pages/jeune.js`

**Test de validation** :
- [ ] Jeûne persiste après rechargement
- [ ] Consultation possible depuis autre appareil
- [ ] Historique accessible

---

### 🟢 NIVEAU 3 - AMÉLIORATIONS (APRÈS NIVEAU 2)
**Durée totale : ~45h (à étaler sur plusieurs semaines)**  
**Objectif : Créer le parcours jeûne complet**

#### 📌 TÂCHE 3.1 - Page préparation-jeune.js (15h)
Voir détails dans `/docs/TODO_PARCOURS_JEUNE_PRIORITE.md` (P1.1)

#### 📌 TÂCHE 3.2 - Page reprise-alimentaire.js (10h)
Voir détails dans `/docs/TODO_PARCOURS_JEUNE_PRIORITE.md` (P1.2)

#### 📌 TÂCHE 3.3 - Page consolidation-45-jours.js (20h)
Voir détails dans `/docs/TODO_PARCOURS_JEUNE_PRIORITE.md` (P2.1)

---

## 📅 PLANNING PAS À PAS (NEXT 4 WEEKS)

### 🗓️ SEMAINE 1 (18-22 nov 2025) - NIVEAU 1 COMPLET
**Objectif : Finir ce qui est en cours**  
**Temps disponible : ~3-4h/jour = 15-20h total**

#### Jour 1 (lun 18 nov) - 3h
- [ ] **Session 1** (1h30) : TÂCHE 1.1A - Type bonus dans ideaux.js
  - Ajouter radio buttons "Supplémentaire/Remplacement"
  - Enregistrer `type_bonus` en BDD
- [ ] **Session 2** (1h30) : TÂCHE 1.1A suite
  - Tester ajout bonus avec type
  - Vérifier enregistrement BDD

#### Jour 2 (mar 19 nov) - 3h
- [ ] **Session 1** (2h) : TÂCHE 1.1B - Inputs dans plan-action.js
  - Rendre distance/vitesse modifiables
  - Sauvegarder modifications
- [ ] **Session 2** (1h) : TÂCHE 1.1B suite
  - Tester modifications depuis plan-action.js

#### Jour 3 (mer 20 nov) - 3h
- [ ] **Session 1** (2h) : TÂCHE 1.1C - Calcul stats proratisé
  - Implémenter formule calcul
  - Distinguer bonus supplémentaire vs remplacement
- [ ] **Session 2** (1h) : TÂCHE 1.1C suite
  - Vérifier affichage stats dans tableaux de bord

#### Jour 4 (jeu 21 nov) - 4h
- [ ] **Session 1** (1h) : TÂCHE 1.2A - Colonne progression_palier
  - Exécuter SQL Supabase
- [ ] **Session 2** (2h) : TÂCHE 1.2B - Calcul progression
  - Implémenter calcul à chaque validation séance
- [ ] **Session 3** (1h) : TÂCHE 1.2C début - Blur dynamique
  - Appliquer CSS blur dans ideaux.js

#### Jour 5 (ven 22 nov) - 3h
- [ ] **Session 1** (1h) : TÂCHE 1.2C suite - Blur dans plan-action.js
- [ ] **Session 2** (2h) : TÂCHE 1.3 - Contenus J6-J10
  - Copier contenus depuis doc
  - Restructurer jours 6-10

**🎉 FIN SEMAINE 1 : NIVEAU 1 TERMINÉ (100%)**

---

### 🗓️ SEMAINE 2 (25-29 nov 2025) - NIVEAU 2 DÉBUT
**Objectif : Intégration Supabase**  
**Temps disponible : ~3-4h/jour**

#### Jour 1 (lun 25 nov) - 3h
- [ ] **Session 1** (2h) : TÂCHE 2.1A - Poids réel Supabase
  - Remplacer fonction mockée
  - Récupérer depuis profils/suivi_poids
- [ ] **Session 2** (1h) : Tests poids réel

#### Jour 2 (mar 26 nov) - 4h
- [ ] **Session 1** (3h) : TÂCHE 2.1B - Repas réels Supabase
  - Remplacer fonction mockée
  - Adapter analyse comportementale
- [ ] **Session 2** (1h) : Tests repas réels

#### Jour 3 (mer 27 nov) - 3h
- [ ] **Session 1** (2h) : TÂCHE 2.2A - Créer table parcours_jeune
  - Exécuter SQL Supabase
  - Créer indexes et RLS
- [ ] **Session 2** (1h) : Tester table BDD

#### Jour 4 (jeu 28 nov) - 4h
- [ ] **Session 1** (3h) : TÂCHE 2.2B - Stockage jeûne BDD
  - Créer jeûne au démarrage
  - Sauvegarder progression
- [ ] **Session 2** (1h) : Tests stockage

#### Jour 5 (ven 29 nov) - 2h
- [ ] **Session finale** : Tests complets NIVEAU 2
  - Vérifier poids/repas réels
  - Vérifier stockage BDD
  - Corriger bugs éventuels

**🎉 FIN SEMAINE 2 : NIVEAU 2 TERMINÉ (100%)**

---

### 🗓️ SEMAINE 3-4 (2-13 déc 2025) - PAUSE & DÉCISION
**Objectif : Profiter de l'app fonctionnelle, décider de la suite**

#### Option A : Continuer vers NIVEAU 3 (préparation jeûne)
→ Suivre planning dans `/docs/TODO_PARCOURS_JEUNE_PRIORITE.md`

#### Option B : Travailler sur autres améliorations
- Référentiel alimentaire avec quantités
- Lier ideaux avec suivi jour
- Créer ses propres défis
- Gérer fast food

#### Option C : Utiliser l'app et observer les besoins réels
→ **RECOMMANDÉ selon principe "Ne pas concevoir sans fin"**

---

## 📊 RÉCAPITULATIF VISUEL

```
┌──────────────────────────────────────────────────────────────┐
│ OÙ ON EST : 60% FONCTIONNEL                                  │
│ ████████████░░░░░░░░░░ 60%                                   │
│                                                               │
│ ✅ Structure OK                                              │
│ ✅ Pages principales OK                                      │
│ ⚠️ Séances bonus incomplet (BLOQUANT)                       │
│ ⚠️ Image motivante manquante (BLOQUANT)                     │
│ ⚠️ Jeûne.js incomplet (BLOQUANT)                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ PLAN D'ACTION (NEXT 2 WEEKS)                                 │
│                                                               │
│ SEMAINE 1 : NIVEAU 1 (12h)                                   │
│ ├─ Séances bonus complètes (6h)                              │
│ ├─ Image motivante défloutage (4h)                           │
│ └─ Jeûne.js contenus J6-J10 (2h)                             │
│                                                               │
│ SEMAINE 2 : NIVEAU 2 (10h)                                   │
│ ├─ Poids/repas réels Supabase (5h)                           │
│ └─ Stockage jeûne BDD (5h)                                   │
│                                                               │
│ RÉSULTAT : APP 100% FONCTIONNELLE                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ APRÈS (OPTIONNEL - NIVEAU 3)                                 │
│                                                               │
│ Parcours jeûne complet (~45h étalés sur 6-8 semaines)       │
│ ├─ Page préparation-jeune.js (15h)                           │
│ ├─ Page reprise-alimentaire.js (10h)                         │
│ └─ Page consolidation-45j.js (20h)                           │
│                                                               │
│ ⚠️ NE PAS COMMENCER AVANT D'AVOIR FINI NIVEAU 1 & 2         │
└──────────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST QUOTIDIENNE

### 🌅 DÉBUT DE SESSION
- [ ] Définir durée session (ex: 2h)
- [ ] Identifier 1 SEULE tâche à compléter
- [ ] Relire objectif de la tâche
- [ ] Ouvrir fichier(s) concerné(s)

### 💻 PENDANT LE TRAVAIL
- [ ] Se concentrer sur les grandes lignes
- [ ] Ne pas se perdre dans les détails
- [ ] Tester régulièrement (toutes les 30min)
- [ ] Sauvegarder fréquemment

### 🎯 FIN DE SESSION
- [ ] Tester ce qui a été fait
- [ ] Cocher tâche(s) terminée(s)
- [ ] Noter blocage éventuel
- [ ] Préparer prochaine session

---

## 🚨 RÈGLES D'OR (À RELIRE CHAQUE JOUR)

1. **"Définir un temps de travail et un objectif du jour"**
   → ✅ Sessions de 2-3h max
   → ✅ 1 tâche = 1 session

2. **"Prioriser les grandes lignes"**
   → ✅ Finir NIVEAU 1 avant NIVEAU 2
   → ❌ Ne pas sauter d'étape

3. **"Ne pas chercher à tout finaliser d'un coup"**
   → ✅ 80% fonctionnel > 100% parfait
   → ❌ Ne pas coder des jours sans tester

4. **"Éviter d'être submergé·e"**
   → ✅ Si tâche trop grosse : découper en 2
   → ❌ Ne jamais travailler sur 2 tâches en parallèle

5. **"L'essentiel avant les détails"**
   → ✅ Séances bonus > Animation fancy
   → ✅ Jeûne fonctionnel > Export PDF

---

## 📞 QUAND DEMANDER DE L'AIDE À COPILOT

### ✅ SITUATIONS OÙ DEMANDER
- ❓ Bloqué > 30 min sur même problème
- ❓ Erreur BDD incompréhensible
- ❓ Code ne fonctionne pas après 3 tentatives
- ❓ Besoin de clarifier une tâche

### ❌ SITUATIONS À ÉVITER
- ❌ "Fais-moi toute la page" (trop gros, risque d'erreur)
- ❌ "Explique-moi React" (trop théorique, perte de temps)
- ❌ Demander 10 choses en même temps (confusion)

### 💡 MEILLEURE FAÇON DE DEMANDER
```
"Je suis sur la TÂCHE 1.1A (type bonus dans ideaux.js).
J'ai ajouté les radio buttons mais le type_bonus ne s'enregistre pas en BDD.
Voici mon code : [coller code]
Qu'est-ce qui ne va pas ?"
```

---

## 🎯 OBJECTIF FINAL (FIN NOVEMBRE 2025)

```
✅ APP 100% FONCTIONNELLE
├─ ✅ Séances bonus complètes (type + stats)
├─ ✅ Image motivante défloutage opérationnel
├─ ✅ Page jeûne.js complète (J1-J10 + vraies données)
├─ ✅ Stockage BDD (plus de localStorage)
└─ ✅ Expérience utilisateur fluide

📱 PRÊT À UTILISER AU QUOTIDIEN
└─ Décision : continuer dev OU profiter de l'app
```

---

**🌙 "Dès que le jeûne commence, début d'une nouvelle ère. Je ne veux plus être celle d'avant. On dit, on fait. Être rigide dans cet aspect, en s'appuyant à chaque instant sur Dieu. I can do it !"**

**🔥 NEXT ACTION : Commencer TÂCHE 1.1A (lundi 18 nov, 2h)**
