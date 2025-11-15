# 🤖 CONVERSATION COPILOT - PRÉPARATION IMPLÉMENTATION RÉFÉRENTIEL

**Date** : 15 novembre 2025  
**Contexte** : Préparation de l'implémentation du référentiel alimentaire enrichi avec calcul automatique des calories

---

## 📊 ANALYSE COMPLÈTE : DIFFÉRENCE ENTRE `/pages/plan.js` ET `/components/RepasBloc.js`

### **1️⃣ `/pages/plan.js` - PLANIFICATION DES REPAS À L'AVANCE**

**Objectif** : Planifier les repas FUTURS (ex: planning de la semaine/mois)

**Référentiel utilisé** : `/data/referentiel.js` (11 aliments) ✅

**Utilisation actuelle** :
```javascript
// Ligne 4 : Import
import referentielAliments from "../data/referentiel";

// Ligne 127 : Recherche aliment → récupère catégorie automatiquement
const found = referentielAliments.find(a => a.nom === aliment);
if (found) {
  setCategorie(found.categorie);
  setRegle(reglesGestion[found.categorie] || "");
}

// Ligne 172 : Suggestions selon type de repas
const suggestionsRef = referentielAliments.filter(a => a.typeRepas === type);
```

**Expérience utilisateur** :
- 📅 User **PLANIFIE** ses repas à l'avance
- 🔍 App suggère aliments selon type de repas (Petit-déjeuner, Déjeuner, etc.)
- 📝 App remplit automatiquement la catégorie quand user sélectionne un aliment
- ✅ Enregistrement dans table `repas_planifies`

**Table BDD** : `repas_planifies`

---

### **2️⃣ `/components/RepasBloc.js` - SAISIE REPAS RÉELS (APRÈS AVOIR MANGÉ)**

**Objectif** : Enregistrer les repas RÉELS (ce que l'utilisateur a effectivement mangé)

**Référentiel utilisé** : **DOUBLON LOCAL** (lignes 7-14) ❌ - Seulement 5 aliments hardcodés

**Référentiel doublon** :
```javascript
const referentielAliments = [
  { nom: "Poulet", categorie: "protéine", kcal: 120 },
  { nom: "Haricots verts", categorie: "légume", kcal: 30 },
  { nom: "Riz", categorie: "féculent", kcal: 110 },  // ❌ 110 kcal (incohérent avec 180 dans référentiel principal)
  { nom: "Banane", categorie: "fruit", kcal: 90 },
  { nom: "Chocolat", categorie: "extra", kcal: 150 }
];
```

**Utilisation actuelle** :
- ❌ **AUCUNE** : Le référentiel local n'est **PAS utilisé** pour l'instant
- User saisit **MANUELLEMENT** : aliment, catégorie, quantité, calories
- Pas de calcul automatique
- Pas de suggestions

**Où RepasBloc est utilisé** :
```javascript
// pages/suivi.js ligne 29
import RepasBloc from "../components/RepasBloc";

// pages/suivi.js ligne 925
<RepasBloc
  type={selectedType}
  date={selectedDate}
  planCategorie={repasPlan[selectedType]?.categorie}
  extrasRestants={extrasRestants}
  onSave={handleSaveRepas}
  repasSemaine={repasSemaine}
/>
```

**Expérience utilisateur** :
- 🍽️ User **DÉCLARE** ce qu'il vient de manger
- 📝 Saisie MANUELLE de tous les champs (aliment, catégorie, quantité, kcal)
- 💡 Feedback dynamique (messages motivationnels, alertes si quota extras dépassé)
- 🎯 Suivi satiété, ressenti, signaux de faim
- ✅ Enregistrement dans table `repas_reels`

**Table BDD** : `repas_reels`

---

## 🔄 DIFFÉRENCE CLÉS : PLAN vs REPAS RÉELS

| Critère | `/pages/plan.js` | `/components/RepasBloc.js` |
|---------|------------------|---------------------------|
| **Quand** | AVANT le repas (planification) | APRÈS le repas (déclaration) |
| **Action** | Planifier | Déclarer ce qui a été mangé |
| **Référentiel** | ✅ `/data/referentiel.js` (11 aliments) | ❌ Doublon local (5 aliments) |
| **Calcul auto kcal** | ❌ Non | ❌ Non |
| **Suggestions** | ✅ Oui (selon type repas) | ❌ Non |
| **Table BDD** | `repas_planifies` | `repas_reels` |
| **Expérience UX** | Aide à planifier | Aide à suivre |

---

## 🎯 CE QUE L'IMPLÉMENTATION VA CHANGER

### **AVANT (actuellement)**

#### **Plan.js** :
- ✅ Suggestions d'aliments selon type de repas
- ✅ Catégorie remplie automatiquement
- ❌ Pas de calcul automatique calories
- ❌ Seulement 11 aliments disponibles

#### **RepasBloc.js** :
- ❌ Aucune suggestion
- ❌ User saisit tout manuellement (aliment, catégorie, quantité, kcal)
- ❌ Référentiel doublon inutilisé (5 aliments incohérents)
- ❌ Risque d'erreurs de saisie

---

### **APRÈS (avec implémentation du plan d'action)**

#### **Phase 1 : Enrichir référentiel** ✅
**Fichier** : `/data/referentiel.js`

**Modifications** :
- Ajouter `portionDefaut`, `unite`, `kcalParUnite` aux 11 aliments existants
- Enrichir de 11 à 60+ aliments

**Exemple** :
```javascript
{
  nom: "Riz basmati",
  categorie: "féculent",
  kcal: 180,
  portionDefaut: "2 CS",       // ✅ NOUVEAU
  unite: "CS",                 // ✅ NOUVEAU
  kcalParUnite: 90,            // ✅ NOUVEAU (1 CS = 90 kcal)
  typeRepas: "Déjeuner"
}
```

**Impact Plan.js** :
- ✅ Plus d'aliments disponibles (60+)
- ✅ Suggestions enrichies
- ✅ Préparation pour calcul auto (pas encore implémenté dans Plan.js)

**Impact RepasBloc.js** :
- ⏸️ Aucun changement pour l'instant (Phase 1 seulement prépare les données)

---

#### **Phase 2 : Implémenter calcul automatique dans RepasBloc.js** ✅
**Fichier** : `/components/RepasBloc.js`

**Action 2.1** : Supprimer doublon local (lignes 7-14)
```javascript
// ❌ SUPPRIMER CES LIGNES
const referentielAliments = [
  { nom: "Poulet", categorie: "protéine", kcal: 120 },
  // ...
];

// ✅ REMPLACER PAR
import referentielAliments from '../data/referentiel';
```

**Action 2.2** : Ajouter calcul automatique
```javascript
// Nouveaux états
const [quantiteNombre, setQuantiteNombre] = useState(''); // Ex: "2.5"
const [alimentRef, setAlimentRef] = useState(null);

// Fonction calcul automatique
function calculerKcalAutomatique(aliment, quantiteNombre) {
  const ref = referentielAliments.find(a => a.nom === aliment);
  if (!ref) return 0;
  return Math.round(ref.kcalParUnite * parseFloat(quantiteNombre));
}

// Recalcul auto quand quantité change
useEffect(() => {
  if (alimentRef && quantiteNombre) {
    const kcalCalcule = calculerKcalAutomatique(aliment, quantiteNombre);
    setKcal(kcalCalcule.toString());
  }
}, [quantiteNombre, alimentRef]);
```

**Action 2.3** : Interface utilisateur
```javascript
{/* Autocomplete aliments */}
<input 
  type="text"
  placeholder="Chercher un aliment..."
  value={aliment}
  list="aliments-suggestions"
/>
<datalist id="aliments-suggestions">
  {referentielAliments.map(a => (
    <option key={a.nom} value={a.nom} />
  ))}
</datalist>

{/* Quantité avec unité */}
<input 
  type="number" 
  step="0.5"
  value={quantiteNombre}
  onChange={(e) => setQuantiteNombre(e.target.value)}
/>
<span>{alimentRef?.unite === "CS" ? "cuillère(s) à soupe" : "..."}</span>

{/* Calories calculées auto (lecture seule) */}
<input 
  type="number" 
  value={kcal} 
  readOnly 
  style={{ background: "#f0f0f0" }}
/>
<span>✨ Calculé automatiquement</span>
```

**Impact RepasBloc.js** :
- ✅ **Suggestions d'aliments** (60+ aliments via datalist)
- ✅ **Calcul automatique calories** quand user saisit quantité
- ✅ **Cohérence** : même référentiel que Plan.js
- ✅ **Moins d'erreurs** : plus besoin de calculer mentalement

**Expérience utilisateur TRANSFORMÉE** :
```
AVANT :
1. User tape "Riz" → rien ne se passe
2. User tape catégorie manuellement : "féculent"
3. User tape quantité : "3"
4. User CALCULE MENTALEMENT : 3 CS × 90 kcal = 270 kcal
5. User tape kcal : "270"

APRÈS :
1. User tape "R" → suggestions apparaissent (Riz blanc, Riz basmati, Raisin...)
2. User sélectionne "Riz blanc" → catégorie remplie AUTO "féculent"
3. User tape quantité : "3" → kcal calculé AUTO "270 kcal" ✨
4. FIN
```

---

#### **Phase 5 : Statistiques réelles** ✅
**Fichier** : `/pages/statistiques.js`

**Modifications** :
- Supprimer données mockées
- Requêtes Supabase réelles sur `repas_reels`
- Calculs dynamiques (total kcal semaine/mois, par catégorie, etc.)

**Impact** :
- ✅ Stats VRAIES de l'utilisateur (plus de 1500 kcal hardcodé)
- ✅ Évolution visible dans le temps

---

## 🤔 CES APPROCHES SE COMPLÈTENT OU S'ANNULENT ?

### **RÉPONSE : ELLES SE COMPLÈTENT 100%** ✅

#### **Plan.js** = INTENTION (ce que je VAIS manger)
- User planifie ses repas à l'avance
- Aide à l'organisation
- Prévention (éviter les extras non planifiés)

#### **RepasBloc.js** = RÉALITÉ (ce que j'AI mangé)
- User déclare ce qu'il a réellement consommé
- Suivi précis
- Feedback immédiat (satiété, ressenti, quota extras)

#### **Workflow complet** :
```
📅 DIMANCHE SOIR : Plan.js
└─ User planifie ses repas de la semaine
   ├─ Lundi Déjeuner : Poulet + Riz + Haricots verts
   ├─ Lundi Dîner : Saumon + Quinoa + Courgettes
   └─ ...

🍽️ LUNDI 12H30 : RepasBloc.js
└─ User déclare son repas réel
   ├─ A-t-il suivi le plan ? Oui/Non
   ├─ Quantités réelles : 3 CS de Riz (au lieu de 2 CS prévues)
   ├─ Calcul auto : 270 kcal (au lieu de 180 kcal prévues)
   ├─ Satiété ? Oui
   └─ Ressenti ? Satisfait

📊 DIMANCHE SOIR SUIVANT : Statistiques
└─ Bilan de la semaine
   ├─ 85% de conformité au plan
   ├─ 1800 kcal/jour en moyenne
   ├─ 2 extras consommés (quota : 3)
   └─ Objectifs atteints ✅
```

---

## 🔄 FLUX DE DONNÉES APRÈS IMPLÉMENTATION

```
┌──────────────────────────────────────────────────┐
│          /data/referentiel.js                    │
│  (60+ aliments enrichis avec kcalParUnite)       │
└────────────────┬─────────────────────────────────┘
                 │
                 ├─────────────────┬────────────────┐
                 ▼                 ▼                ▼
         ┌───────────────┐  ┌──────────────┐  ┌─────────────┐
         │  plan.js      │  │ RepasBloc.js │  │ stats.js    │
         │ (planification)│  │ (saisie réel)│  │ (analyse)   │
         └───────┬───────┘  └──────┬───────┘  └─────┬───────┘
                 │                 │                  │
                 ▼                 ▼                  │
         ┌──────────────┐  ┌──────────────┐         │
         │repas_planifies│  │ repas_reels  │◄────────┘
         │  (intention)  │  │  (réalité)   │
         └───────────────┘  └──────────────┘
                                   │
                                   ▼
                           ┌──────────────┐
                           │ Statistiques │
                           │   réelles    │
                           └──────────────┘
```

---

## 📋 RÉCAPITULATIF : CE QUI CHANGE

### **Plan.js** (planification)
- **AVANT** : 11 aliments, catégorie auto, pas de calcul kcal
- **APRÈS** : 60+ aliments, catégorie auto, **prêt pour calcul kcal auto** (si implémenté)
- **Impact** : Plus de choix, meilleure planification

### **RepasBloc.js** (saisie réelle)
- **AVANT** : Saisie 100% manuelle, aucune aide, référentiel doublon inutilisé
- **APRÈS** : 
  - ✅ Suggestions d'aliments (autocomplete)
  - ✅ Catégorie remplie automatiquement
  - ✅ **Calcul automatique calories** quand user entre quantité
  - ✅ Cohérence avec Plan.js (même référentiel)
- **Impact** : **Expérience transformée**, gain de temps massif, moins d'erreurs

### **Statistiques.js**
- **AVANT** : Données mockées (1500 kcal fixe)
- **APRÈS** : Vraies données utilisateur, calculs dynamiques
- **Impact** : Suivi réel, motivation

---

## ✅ CONCLUSION

### **Question 1 : Ce que ça change ?**
- ✅ **Plan.js** : Plus d'aliments disponibles (60+), prêt pour calcul auto
- ✅ **RepasBloc.js** : **TRANSFORMATION COMPLÈTE** - calcul auto calories, suggestions, UX améliorée

### **Question 2 : Différence entre les deux ?**
- **Plan.js** = PLANIFIER (avant de manger)
- **RepasBloc.js** = DÉCLARER (après avoir mangé)
- Deux usages complémentaires

### **Question 3 : Se complètent ou s'annulent ?**
- ✅ **SE COMPLÈTENT 100%**
- Plan.js aide à PLANIFIER
- RepasBloc.js aide à SUIVRE la réalité
- Stats comparent INTENTION vs RÉALITÉ

### **Expérience utilisateur finale** :
```
📅 Je planifie → 🍽️ Je mange → 📊 J'analyse
   (Plan.js)     (RepasBloc.js)  (Statistiques)
```

---

## 🎯 PROCHAINE ÉTAPE

**Phase 1.1** : Enrichir `/data/referentiel.js` avec `kcalParUnite` pour les 11 aliments existants

**Durée** : 1h

**Impact immédiat** :
- Préparation des données pour calcul auto
- Pas de changement visible pour l'utilisateur (préparation backend)

**Validation nécessaire avant de continuer** : ✅ OUI

---

## 🚨 CLARIFICATION IMPORTANTE : ON N'AJOUTE PAS, ON MODIFIE AUSSI !

### **❓ Question utilisateur : "Si on part sur référentiel, faudra tout recoder ?"**

**RÉPONSE** : NON, pas "tout recoder" - voici EXACTEMENT ce qui change :

---

## 📍 OÙ SE PASSE LA SAISIE ALIMENTAIRE ACTUELLEMENT ?

### **Composant principal : `/components/RepasBloc.js`**

**Utilisé par** : `/pages/suivi.js` (ligne 925)

**Comportement actuel (lignes 240-258)** :

#### **1. Remplissage automatique catégorie (lignes 240-246)** ✅ EXISTE DÉJÀ
```javascript
useEffect(() => {
  const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.toLowerCase())
  if (found) {
    setCategorie(found.categorie)  // ✅ Catégorie auto selon aliment
  }
}, [aliment])
```

**Ce qui se passe** : Quand user tape un aliment, l'app cherche dans le référentiel local (5 aliments) et remplit la catégorie automatiquement.

#### **2. Calcul automatique kcal (lignes 248-258)** ✅ EXISTE DÉJÀ (MAIS INCOMPLET)
```javascript
useEffect(() => {
  const found = referentielAliments.find(a => a.nom.toLowerCase() === aliment.toLowerCase())
  if (found && quantite) {
    const quantiteNum = parseFloat(quantite)
    setKcal((quantiteNum * found.kcal).toFixed(0))  // ✅ Calcul auto kcal
  }
}, [aliment, quantite])
```

**Ce qui se passe** : Quand user tape une quantité, l'app calcule automatiquement les calories.

**PROBLÈME** : 
- ❌ Ne fonctionne QUE pour 5 aliments hardcodés
- ❌ Valeurs kcal incohérentes (Riz 110 kcal au lieu de 180)
- ❌ Pas de notion d'unité (CS, pièce, grammes)

---

## ✅ CE QUI VA CHANGER AVEC L'IMPLÉMENTATION

### **Phase 1 : Enrichir référentiel (AUCUN changement code RepasBloc)**
**Fichier** : `/data/referentiel.js`
**Action** : Ajouter champs `portionDefaut`, `unite`, `kcalParUnite`

**Impact RepasBloc.js** : ❌ **AUCUN** (Phase 1 prépare seulement les données)

---

### **Phase 2.1 : Supprimer doublon (1 modification simple)**
**Fichier** : `/components/RepasBloc.js`
**Action** : Remplacer lignes 7-14

**AVANT (lignes 7-14)** :
```javascript
const referentielAliments = [
  { nom: "Poulet", categorie: "protéine", kcal: 120 },
  { nom: "Haricots verts", categorie: "légume", kcal: 30 },
  { nom: "Riz", categorie: "féculent", kcal: 110 },
  { nom: "Banane", categorie: "fruit", kcal: 90 },
  { nom: "Chocolat", categorie: "extra", kcal: 150 }
];
```

**APRÈS** :
```javascript
import referentielAliments from '../data/referentiel';
```

**Impact** : 
- ✅ Plus de doublon
- ✅ 60+ aliments disponibles (au lieu de 5)
- ✅ Valeurs kcal cohérentes

**Code existant (lignes 240-258)** : ✅ **CONTINUE DE FONCTIONNER** (aucune modification)

---

### **Phase 2.2 : Améliorer calcul auto (modification du calcul existant)**
**Fichier** : `/components/RepasBloc.js`
**Action** : Modifier la logique lignes 248-258

**AVANT (ligne 253)** :
```javascript
setKcal((quantiteNum * found.kcal).toFixed(0))  // ❌ Multiplie quantité brute par kcal total
```

**Problème actuel** :
- User tape "3" dans quantité
- App calcule : `3 × 110 kcal = 330 kcal` ❌ FAUX
- Pourquoi ? Car `found.kcal` = calories TOTALES de la portion, pas par unité

**APRÈS (avec kcalParUnite)** :
```javascript
// Utiliser kcalParUnite au lieu de kcal
setKcal((quantiteNum * found.kcalParUnite).toFixed(0))  // ✅ Multiplie quantité par kcal/unité
```

**Exemple** :
- Référentiel enrichi : `{ nom: "Riz", kcalParUnite: 90 }` (90 kcal par CS)
- User tape "3" → App calcule : `3 × 90 = 270 kcal` ✅ CORRECT

**Impact** :
- ✅ Calculs corrects
- ✅ Fonctionne pour TOUTES les unités (CS, pièces, grammes)

---

### **Phase 2.3 : Améliorer interface (ajout autocomplete + affichage unité)**
**Fichier** : `/components/RepasBloc.js`
**Action** : Améliorer les inputs (lignes ~350-400)

**AJOUT 1 : Autocomplete sur input aliment**
```javascript
{/* AVANT : input basique */}
<input 
  type="text" 
  value={aliment}
  onChange={(e) => setAliment(e.target.value)}
/>

{/* APRÈS : input avec suggestions */}
<input 
  type="text" 
  value={aliment}
  onChange={(e) => setAliment(e.target.value)}
  list="aliments-suggestions"  // ✅ AJOUT
/>
<datalist id="aliments-suggestions">  {/* ✅ AJOUT */}
  {referentielAliments.map(a => (
    <option key={a.nom} value={a.nom} />
  ))}
</datalist>
```

**AJOUT 2 : Affichage unité selon aliment**
```javascript
{/* AVANT : input quantité basique */}
<input 
  type="number"
  value={quantite}
  onChange={(e) => setQuantite(e.target.value)}
/>

{/* APRÈS : input avec indication unité */}
<input 
  type="number"
  value={quantite}
  onChange={(e) => setQuantite(e.target.value)}
/>
{alimentRef && (  {/* ✅ AJOUT */}
  <span style={{ marginLeft: 8, color: "#666" }}>
    {alimentRef.unite === "CS" && "cuillère(s) à soupe"}
    {alimentRef.unite === "piece" && "pièce(s)"}
    {alimentRef.unite === "g" && "gramme(s)"}
  </span>
)}
```

**AJOUT 3 : Input kcal en lecture seule**
```javascript
{/* AVANT : input kcal modifiable */}
<input 
  type="number"
  value={kcal}
  onChange={(e) => setKcal(e.target.value)}
/>

{/* APRÈS : input kcal calculé auto (lecture seule) */}
<input 
  type="number"
  value={kcal}
  readOnly  {/* ✅ AJOUT */}
  style={{ background: "#f0f0f0" }}  {/* ✅ Visuellement différent */}
/>
<span style={{ fontSize: 12, color: "#4caf50" }}>
  ✨ Calculé automatiquement  {/* ✅ AJOUT */}
</span>
```

---

## 📊 RÉCAPITULATIF : QU'EST-CE QUI CHANGE VRAIMENT ?

### **Code à MODIFIER (pas recoder)** :

| Fichier | Lignes | Action | Type |
|---------|--------|--------|------|
| `/data/referentiel.js` | Toutes | Ajouter champs `portionDefaut`, `unite`, `kcalParUnite` | ✏️ ENRICHIR |
| `/components/RepasBloc.js` | 7-14 | Supprimer doublon, importer référentiel principal | 🔄 REMPLACER |
| `/components/RepasBloc.js` | 253 | Modifier `found.kcal` → `found.kcalParUnite` | ✏️ CORRIGER |
| `/components/RepasBloc.js` | ~350-400 | Ajouter autocomplete + affichage unité + kcal readonly | ➕ AMÉLIORER UX |

**Total lignes modifiées** : ~50 lignes (sur 722)

**Total nouveau code** : ~30 lignes (autocomplete + affichage unité)

---

## 🎯 CE QUI NE CHANGE PAS

- ✅ Structure générale de RepasBloc.js
- ✅ Props reçues (type, date, planCategorie, etc.)
- ✅ États existants (aliment, categorie, quantite, kcal, satiete, etc.)
- ✅ Logique de feedback (rules, reactBloc)
- ✅ Enregistrement Supabase (lignes 300-315)
- ✅ Fast Food logic
- ✅ Jeûne logic

---

## 💡 RÉPONSE FINALE À LA QUESTION

### **"Si on part sur référentiel, faudra tout recoder ?"**

**NON** ❌

**Ce qu'on fait** :
1. ✅ **Enrichir** le référentiel existant (Phase 1)
2. ✅ **Corriger** le doublon (1 import à changer)
3. ✅ **Améliorer** le calcul existant (1 ligne à modifier : `kcal` → `kcalParUnite`)
4. ✅ **Ajouter** autocomplete + affichage unité (~30 lignes)

**Ce qu'on NE fait PAS** :
- ❌ Recoder toute la logique de RepasBloc
- ❌ Changer la structure des états
- ❌ Modifier l'enregistrement Supabase (sauf Phase 5 optionnelle)
- ❌ Toucher au feedback/rules
- ❌ Modifier la logique Fast Food/Jeûne

---

## 🚀 COMPORTEMENT UTILISATEUR : AVANT vs APRÈS

### **AVANT (actuellement)**

**Saisie dans RepasBloc** :
```
1. User tape "Riz" dans aliment
   → Catégorie remplie AUTO "féculent" (si trouvé dans 5 aliments)
   → Sinon, rien ne se passe

2. User tape "3" dans quantité
   → Kcal calculé AUTO "330 kcal" (si trouvé)
   → MAIS calcul FAUX (3 × 110 = 330 au lieu de 3 CS × 90 = 270)

3. User peut modifier kcal manuellement si erreur
```

**Limitations** :
- Seulement 5 aliments reconnus
- Calculs incorrects
- Pas d'indication d'unité

---

### **APRÈS (avec implémentation)**

**Saisie dans RepasBloc** :
```
1. User tape "R" dans aliment
   → Liste suggestions apparaît : "Riz blanc", "Riz basmati", "Riz complet", "Raisin"...
   → User sélectionne "Riz blanc"
   → Catégorie remplie AUTO "féculent" ✅

2. User voit indication "cuillère(s) à soupe" à côté du champ quantité

3. User tape "3" dans quantité
   → Kcal calculé AUTO "270 kcal" ✅ CORRECT (3 CS × 90 kcal/CS)
   → Champ kcal en lecture seule (grisé) avec "✨ Calculé automatiquement"

4. User continue avec satiété, ressenti, etc. (inchangé)
```

**Améliorations** :
- ✅ 60+ aliments reconnus
- ✅ Calculs corrects
- ✅ Indication unité claire
- ✅ Moins d'erreurs de saisie

---

## ✅ VALIDATION NÉCESSAIRE

**Tu valides cette approche** :
1. ✅ Enrichir référentiel (Phase 1)
2. ✅ Corriger doublon RepasBloc (Phase 2.1)
3. ✅ Améliorer calcul existant (Phase 2.2 - 1 ligne)
4. ✅ Ajouter autocomplete + unité (Phase 2.3 - ~30 lignes)

**Ou tu veux une autre approche ?**
