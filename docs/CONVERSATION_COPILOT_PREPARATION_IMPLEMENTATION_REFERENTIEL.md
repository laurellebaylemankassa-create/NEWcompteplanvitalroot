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

---

═══════════════════════════════════════════════════════════════════════════════
📋 TODO - RÉFÉRENTIEL ALIMENTAIRE & SAISIE (Mise à jour : 15 nov 2025)
═══════════════════════════════════════════════════════════════════════════════

## ✅ **PHASE 1 - ENRICHISSEMENT RÉFÉRENTIEL** [TERMINÉE - 15h30-17h30]

### ✅ 1.1 Structure de base enrichie (15h30)
- ✅ Ajout champs : `portionDefaut`, `unite`, `kcalParUnite`, `mesureRecommandee`
- ✅ Ajout champ : `qn` (Qualité Nutritionnelle 1-5)
- ✅ Structure testée et validée

### ✅ 1.2 Enrichissement massif (15h45-17h00)
- ✅ Féculents : 28 aliments (Riz, Pâtes, Quinoa, Pommes de terre, Pain, etc.)
- ✅ Légumineuses : 10 aliments (Lentilles, Pois chiches, Haricots, etc.)
- ✅ Protéines : 25 aliments (Œuf, Poulet, Poissons, Tofu, Fromages, etc.)
- ✅ Légumes : 22 aliments (Courgettes, Carottes, Tomates, Brocoli, etc.)
- ✅ Fruits : 19 aliments (Banane, Pomme, Raisin, Mangue, etc.)
- ✅ Gras végétal : 12 aliments (Avocat, Huiles, Noix, Graines, etc.)
- ✅ Extras : 48 aliments détaillés (Bonbons, Biscuits, Viennoiseries, Fast-food, etc.)
- ✅ Mini-viennoiseries : 5 aliments (Mini croissant 150 kcal, Mini pain chocolat 180 kcal, etc.)
- ✅ Frites maison : 3 types (Friteuse 300 kcal, Four 200 kcal, Fraîches 250 kcal)

**📊 TOTAL : 187 aliments** (vs 11 initialement)

### ✅ 1.3 Script automatisation QN (17h00-17h15)
- ✅ Script `scripts/add-qn-scores.js` créé
- ✅ Backup référentiel : `data/referentiel.js.backup`
- ✅ Scores QN ajoutés automatiquement (177 aliments traités)
- ✅ Distribution : QN 1=64, QN 2=22, QN 3=23, QN 4=37, QN 5=31

**Commits** :
- `c4f0a45` : Enrichissement référentiel +95 aliments
- `efb4710` : Mini-viennoiseries + msg aide décimales
- `b491d86` : Frites maison dans féculents

---

## ✅ **PHASE 2 - CALCUL AUTOMATIQUE** [TERMINÉE - 17h15-18h30]

### ✅ 2.1 Correction doublon référentiel (17h15)
- ✅ Suppression doublon local dans `RepasBloc.js` (lignes 7-14)
- ✅ Import référentiel central : `import referentielAliments from '../data/referentiel'`
- ✅ Référentiel unique et synchronisé

### ✅ 2.2 Calcul automatique kcal (17h20-17h40)
- ✅ useEffect lignes 251-264 : Calcul avec `kcalParUnite`
- ✅ Formule : `quantite × kcalParUnite = kcal total`
- ✅ Fallback pour anciens aliments sans `kcalParUnite`
- ✅ Champ kcal en lecture seule avec "✨ Calculé automatiquement"

### ✅ 2.3 Autocomplete intelligent (17h40-18h00)
- ✅ Remplacement `<datalist>` par composant custom (bug caractères spéciaux)
- ✅ Filtrage temps réel avec normalisation (Œ → oe)
- ✅ Dropdown visuel avec :
  - Nom aliment
  - Portion par défaut (ex: "2 CS")
  - Score QN avec couleur (🟢 5-4, 🟠 3, 🔴 2-1)
- ✅ États : `suggestionsFiltrees`, `afficherSuggestions`

### ✅ 2.4 UX améliorée (18h00-18h30)
- ✅ Message portion recommandée sous champ aliment
- ✅ Label quantité dynamique selon unité (CS/pièce(s)/gramme(s))
- ✅ Message aide décimales : "⚠️ Utilisez un point (0.5 et non 0,5)"
- ✅ Masquage conditionnel en mode Jeûne (categorie === 'Jeûne')
  - Aliment, Quantité, Kcal, Extra, Satiété, Ressenti → masqués
  - Seuls Type, Date, Heure, Catégorie affichés

**Commits** :
- `43dedb7` : Debug vérification référentiel
- `a432d9c` : Fix mode Jeûne (masquer champs inutiles)

---

## 🟢 **PHASES 3-4 - FONCTIONNALITÉS AVANCÉES** [OPTIONNEL - Non prioritaire]

**⚠️ Note importante** : Ces phases sont des **enrichissements** qui peuvent être faits **plus tard**. Elles ne bloquent PAS le fonctionnement de base du référentiel et de la saisie alimentaire.

### 🟢 Phase 3 - Conscience alimentaire (2h - Optionnel)
**Objectif** : Afficher bienfaits physiques/spirituels des aliments pendant la saisie

**Actions** :
- [ ] Créer table Supabase `aliments_conscience` avec colonnes :
  - `aliment`, `categorie`, `bienfait_physique`, `bienfait_spirituel`
  - `effet_perte_poids`, `effet_satiete`, `a_savoir`
- [ ] Insérer données base "Conscience alimentaire" (Tomate, Banane, Pomme, etc.)
- [ ] Ajouter affichage dans `RepasBloc.js` : encadré violet avec infos

**Pourquoi optionnel ?** : Enrichissement culturel, pas nécessaire pour calcul kcal

---

### 🟢 Phase 4 - Aliments personnalisés (2h - Optionnel)
**Objectif** : Permettre à l'utilisateur d'ajouter ses propres aliments au référentiel

**Actions** :
- [ ] Créer table Supabase `aliments_custom` avec colonnes :
  - `user_id`, `nom`, `categorie`, `kcal`, `portion_defaut`, `unite`, `kcal_par_unite`
- [ ] Détecter aliment non trouvé dans `RepasBloc.js`
- [ ] Afficher bouton "➕ Ajouter cet aliment"
- [ ] Modal formulaire pour créer aliment perso
- [ ] Fusionner référentiel + aliments custom dans autocomplete

**Pourquoi optionnel ?** : 187 aliments couvrent 90% des besoins, customisation est un plus

---

## ❌ **PHASE 5 - STATISTIQUES RÉELLES DANS TABLEAU DE BORD** [À FAIRE - Estimation 2h]

**⚠️ IMPORTANT** : Les statistiques sont affichées dans `/pages/tableau-de-bord.js`, PAS dans `/pages/statistiques.js`

**Problème actuel** : Le tableau de bord utilise des **vraies requêtes Supabase** (lignes 102-291 `handleRefresh()`), donc les stats affichent déjà les vraies données utilisateur pour :
- ✅ Poids (graphique évolution)
- ✅ Humeurs (répartition)
- ✅ Satiété (taux par faim réelle)
- ✅ Extras (quota semaine)

**Ce qui manque** : Stats détaillées par **catégorie d'aliments** et **quantités standardisées**

---

### ❌ 5.1 Migration BDD quantités standardisées (30 min)
**Fichier** : Migration Supabase

**Actions** :
- [ ] Ajouter colonnes dans table `repas_reels` :
  ```sql
  ALTER TABLE repas_reels 
  ADD COLUMN IF NOT EXISTS quantite_nombre NUMERIC(6,2),  -- Nombre pur pour calculs
  ADD COLUMN IF NOT EXISTS quantite_unite VARCHAR(20),    -- "CS", "piece", "g"
  ADD COLUMN IF NOT EXISTS quantite_affichage VARCHAR(50); -- "2,5 CS" pour UI
  ```
- [ ] Créer indexes pour performances :
  ```sql
  CREATE INDEX IF NOT EXISTS idx_repas_reels_user_date ON repas_reels(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_repas_reels_categorie ON repas_reels(categorie);
  ```
- [ ] Tester migration en dev

**Pourquoi ?** : Permet requêtes agrégées fiables (SUM, AVG) pour statistiques détaillées par catégorie

---

### ❌ 5.2 Adapter enregistrement RepasBloc (30 min)
**Fichier** : `/components/RepasBloc.js` (fonction handleSubmit, lignes ~300-315)

**Actions** :
- [ ] Modifier insert Supabase pour enregistrer 3 champs :
  ```javascript
  quantite_nombre: parseFloat(quantite),           // 2.5
  quantite_unite: found?.unite || 'portion',       // "CS", "piece", "g"
  quantite_affichage: `${quantite} ${found?.unite || ''}` // "2,5 CS"
  ```
- [ ] Tester enregistrement : vérifier données en BDD Supabase
- [ ] Vérifier compatibilité avec mode Jeûne (ne pas enregistrer quantité si Jeûne)

**Pourquoi ?** : Standardisation pour calculs statistiques fiables

---

### ❌ 5.3 Ajouter stats par catégorie dans Tableau de Bord (1h)
**Fichier** : `/pages/tableau-de-bord.js`

**Actions** :
- [ ] **Ajouter dans fonction `handleRefresh()` (après ligne 291)** :
  ```javascript
  // Stats par catégorie d'aliments
  const statsCat = {};
  ['féculent', 'protéine', 'légume', 'fruit', 'légumineuse', 'gras_vegetal', 'extra'].forEach(cat => {
    const repasCat = repasReels.filter(r => r.categorie === cat);
    statsCat[cat] = {
      nbRepas: repasCat.length,
      totalKcal: repasCat.reduce((sum, r) => sum + (r.kcal || 0), 0),
      totalCS: repasCat
        .filter(r => r.quantite_unite === 'CS')
        .reduce((sum, r) => sum + (r.quantite_nombre || 0), 0)
    };
  });
  ```
- [ ] **Créer nouvel état** :
  ```javascript
  const [statsByCategorie, setStatsByCategorie] = useState({});
  ```
- [ ] **Ajouter section UI (après ligne 998)** :
  ```jsx
  <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginTop: 20 }}>
    <h2>📊 Détails par catégorie alimentaire</h2>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>Catégorie</th>
          <th>Nb repas</th>
          <th>Calories</th>
          <th>Total CS</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(statsByCategorie).map(([cat, data]) => (
          <tr key={cat}>
            <td>{cat === 'féculent' ? '🍚 Féculents' : '...'}</td>
            <td>{data.nbRepas}</td>
            <td>{data.totalKcal} kcal</td>
            <td>{data.totalCS > 0 ? `${data.totalCS} CS` : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  ```

**Pourquoi ?** : Permettre à l'utilisateur de voir :
- Combien de féculents il a mangé cette semaine (en nb de repas ET en CS)
- Répartition calorique par catégorie
- Identifier déséquilibres (ex: trop de féculents, pas assez de légumes)

---

## 📊 **RÉCAPITULATIF PHASES**

| Phase | Description | Durée | Statut | Priorité |
|-------|-------------|-------|--------|----------|
| Phase 1 | Enrichissement référentiel | 2-3h | ✅ FAIT (15h30-17h30) | 🔴 CRITIQUE |
| Phase 2 | Calcul automatique + UX | 3h | ✅ FAIT (17h15-18h30) | 🔴 CRITIQUE |
| **Phase 3** | **Conscience alimentaire** | **2h** | **🟢 OPTIONNEL** | **🟢 BONUS** |
| **Phase 4** | **Aliments personnalisés** | **2h** | **🟢 OPTIONNEL** | **🟢 BONUS** |
| **Phase 5** | **Stats détaillées tableau-de-bord** | **2h** | **❌ À FAIRE** | **🟡 IMPORTANT** |

**Total accompli** : ✅ 6h / 11h (55%)  
**Reste prioritaire** : ❌ 2h (Phase 5 - Stats détaillées)  
**Optionnel** : 🟢 4h (Phases 3-4 - Peut attendre)

---

## 📊 **RÉCAPITULATIF PROGRESSION**

| Phase | Description | Durée estimée | Statut | Horodatage |
|-------|-------------|---------------|--------|------------|
| Phase 1 | Enrichissement référentiel | 2-3h | ✅ FAIT | 15h30-17h30 |
| Phase 2 | Calcul automatique + UX | 3h | ✅ FAIT | 17h15-18h30 |
| **Phase 5** | **Statistiques réelles** | **2h** | **❌ À FAIRE** | - |
| Phase 3 | Conscience alimentaire | 2h | 🟢 Optionnel | - |
| Phase 4 | Aliments personnalisés | 2h | 🟢 Optionnel | - |

**Total accompli** : ✅ 6h / 11h (55%)  
**Reste prioritaire** : ❌ 2h (Phase 5 - Stats réelles)  
**Optionnel** : 🟢 4h (Phases 3-4)

---

## 🎯 **PROCHAINE ACTION RECOMMANDÉE**

**Priority #1** : Phase 5 - Statistiques réelles (2h)

**Pourquoi prioritaire ?** :
- Les stats actuelles affichent des données **FAUSSES** (mockées)
- Utilisateur ne peut pas voir sa **vraie progression**
- Calcul automatique fonctionne, mais stats ne reflètent pas les vraies calories
- Bloque l'utilité réelle de l'app pour suivi alimentaire

**Ordre d'implémentation** :
1. Migration BDD (30 min) → fondations
2. Adapter RepasBloc (30 min) → enregistrement correct
3. Réécrire Statistiques (1h) → affichage réel

**Alternative si pas le temps** :
- Garder Phases 3-4 pour plus tard (nice-to-have)
- Se concentrer sur Phase 5 pour avoir une app **fonctionnelle à 100%**

═══════════════════════════════════════════════════════════════════════════════
