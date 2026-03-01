# 🆕 À PRÉVOIR — Bilan hebdomadaire alimentaire (ajouts futurs)

## ⚠️ RÉFLEXION CRITIQUE : Gestion périodes de jeûne dans bilans
**Date identification :** 2026-02-14  
**Priorité :** 🔴 CRITIQUE (impacte cohérence statistiques)  
**Statut :** 🤔 Réflexion en cours  
**Temps estimé :** 8-10h (analyse + conception + implémentation)

### Problématique identifiée

**Situation actuelle :**
Le système de calcul du bilan hebdomadaire ne différencie pas :
- ❌ **Jours non saisis** (oubli utilisateur, données manquantes)
- ❌ **Jours de jeûne intentionnel** (protocole préparation jeûne, mode jeûne activé)

**Exemple concret - Semaine préparation jeûne :**
```
Lundi-Mardi      : Alimentation normale (1700 kcal/jour) = 3400 kcal
Mercredi-Vendredi: JEÛNE INTENTIONNEL (fenêtre 3 jours) = 0 kcal
Samedi-Dimanche  : Reprise alimentation (1700 kcal/jour) = 3400 kcal

Total semaine : 6800 kcal sur 7 jours
```

**Calcul actuel (FAUX) :**
```javascript
nbJoursSaisis = 4 jours (lun/mar/sam/dim)
apportsTotaux = 6800 kcal
objectifHebdo = 1730 × 4 = 6920 kcal
Écart = -120 kcal

⚠️ Message affiché : "Semaine en déficit, tu es sous ton objectif"
```

**Calcul attendu (CORRECT) :**
```javascript
nbJoursAlimentation = 4 jours
nbJoursJeuneIntentionnel = 3 jours
nbJoursNonSaisis = 0 jour

apportsTotaux = 6800 kcal (sur 4 jours alimentation)
objectifHebdo = 1730 × 4 = 6920 kcal (calculé sur jours alimentation uniquement)
Écart = -120 kcal

✓ Message adapté : "Semaine mixte : 4j alimentation + 3j jeûne.
   Phase alimentation : 6800/6920 kcal (objectif respecté)"
```

---

### Impacts actuels (bugs silencieux)

1. **Bilan hebdomadaire faussé**
   - Stats calculées sur jours saisis sans tenir compte du contexte jeûne
   - Messages inadaptés ("tu es en déficit" alors que c'est un jeûne planifié)
   - Objectif hebdo mal calculé

2. **Bilan mensuel incohérent**
   - Semaines de jeûne comptent comme "semaines incomplètes"
   - Moyenne mensuelle biaisée
   - Tendances faussées

3. **Moyenne 14j incorrecte**
   - Calcul sur tous les jours sans distinction jeûne/alimentation
   - Comparaison N/N-1 invalide si une semaine est en mode jeûne

4. **Encouragements inappropriés**
   - "Données insuffisantes" affiché alors que jeûne intentionnel
   - Pas de reconnaissance du protocole suivi
   - Démotivant pour utilisateur

---

### Solution architecturale proposée

#### **1. Marqueur type de journée en base**

**Nouvelle table : `calendrier_utilisateur`**
```sql
CREATE TABLE calendrier_utilisateur (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  type_journee TEXT CHECK (type_journee IN (
    'alimentation_normale',
    'jeune_intentionnel',
    'preparation_jeune',
    'reprise_alimentaire',
    'non_saisi'
  )),
  mode_app TEXT CHECK (mode_app IN ('normal', 'jeune', 'preparation_jeune', 'reprise')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

**OU ajout colonne dans table existante `semaines_validees` :**
```sql
ALTER TABLE semaines_validees 
ADD COLUMN jours_jeune_intentionnel INTEGER DEFAULT 0,
ADD COLUMN jours_alimentation INTEGER DEFAULT 0,
ADD COLUMN mode_semaine TEXT CHECK (mode_semaine IN ('normal', 'mixte_jeune', 'jeune_complet'));
```

#### **2. Détection automatique mode jeûne**

Dans `pages/suivi.js` lors de la validation :
```javascript
// Récupérer mode app actuel (depuis contexte ou localStorage)
const modeApp = getModeApp(); // 'normal' | 'jeune' | 'preparation_jeune'

// Compter jours par type
const joursAlimentation = new Set();
const joursJeune = [];

// Si mode préparation jeûne, identifier fenêtres de jeûne
if (modeApp === 'preparation_jeune') {
  const fenetresJeune = getFenetresJeunePlanifiees(selectedWeekStart);
  joursJeune = fenetresJeune; // Ex: ['2026-02-12', '2026-02-13', '2026-02-14']
}

repasData.forEach(r => {
  if (!joursJeune.includes(r.date)) {
    joursAlimentation.add(r.date);
  }
});

const nbJoursAlimentation = joursAlimentation.size;
const nbJoursJeune = joursJeune.length;
const nbJoursNonSaisis = 7 - nbJoursAlimentation - nbJoursJeune;
```

#### **3. Calcul objectif adapté**

```javascript
// Objectif calculé UNIQUEMENT sur jours alimentation
const objectifHebdo = objectifJour × nbJoursAlimentation;

// Sauvegarde en base
const bilanToInsert = {
  // ... champs existants
  nb_jours_alimentation: nbJoursAlimentation,
  nb_jours_jeune: nbJoursJeune,
  nb_jours_non_saisis: nbJoursNonSaisis,
  mode_semaine: nbJoursJeune > 0 ? 'mixte_jeune' : 'normal',
  objectif_hebdo: objectifHebdo // Ajusté sur jours alimentation
};
```

#### **4. Messages contextuels dans bilan**

**BilanHebdoModal.js - Bandeau adapté :**
```javascript
{bilan?.nb_jours_jeune > 0 && (
  <div style={{
    background: '#e0f2fe',
    border: '2px solid #0284c7',
    borderRadius: 8,
    padding: '1rem 1.5rem',
    marginBottom: '1.5rem',
    color: '#075985'
  }}>
    <div style={{fontWeight: 700, marginBottom: '0.3rem'}}>
      🧘 Semaine avec protocole jeûne
    </div>
    Cette semaine incluait <b>{bilan.nb_jours_jeune} jour(s) de jeûne intentionnel</b>.
    Les statistiques portent sur les <b>{bilan.nb_jours_alimentation} jours d'alimentation</b> uniquement.
  </div>
)}

{bilan?.nb_jours_non_saisis > 0 && bilan?.nb_jours_jeune === 0 && (
  <div style={{background: '#fff3cd', ...}}>
    ⚠️ Données insuffisantes : {bilan.nb_jours_non_saisis} jour(s) non saisi(s).
  </div>
)}
```

**Résumé données principales adapté :**
```javascript
<li>
  Jours avec alimentation : <b>{bilan.nb_jours_alimentation}</b>
  {bilan.nb_jours_jeune > 0 && (
    <span style={{color: '#0284c7', marginLeft: '0.5rem'}}>
      (+ {bilan.nb_jours_jeune} jour(s) jeûne)
    </span>
  )}
</li>
```

#### **5. Moyenne 14j adaptée**

**Moyenne14jBlock.js - Filtrer jours de jeûne :**
```javascript
// Récupérer jours de jeûne sur période 14j
const { data: joursJeune } = await supabase
  .from('calendrier_utilisateur')
  .select('date')
  .eq('user_id', user_id)
  .eq('type_journee', 'jeune_intentionnel')
  .gte('date', fmt(start14))
  .lte('date', fmt(end));

const datesJeune = new Set(joursJeune?.map(j => j.date) || []);

// Calculer total sur jours alimentation uniquement
let totalAlimentation = 0;
let nbJoursAlimentation = 0;

for (let i=0; i<14; ++i) {
  const d = new Date(start14); d.setDate(start14.getDate()+i);
  const key = d.toISOString().slice(0,10);
  
  if (!datesJeune.has(key)) {
    totalAlimentation += jours[key] || 0;
    if (jours[key]) nbJoursAlimentation++;
  }
}

const objectifAlimentation = objectifJour × nbJoursAlimentation;
const surplus14j = totalAlimentation - objectifAlimentation;
```

---

### Cas d'usage à gérer

| Cas | Semaine | Calcul attendu |
|-----|---------|----------------|
| **1. Normal** | 7j alimentation, 0j jeûne | Actuel OK (objectif × 7) |
| **2. Prépa jeûne** | 4j alim + 3j jeûne | Objectif × 4 seulement |
| **3. Jeûne complet** | 0j alim + 7j jeûne | Message "Semaine de jeûne" |
| **4. Données partielles** | 3j alim + 0j jeûne + 4j non saisis | Bandeau avertissement |
| **5. Mixte complexe** | 2j alim + 3j jeûne + 2j non saisis | Combiner bandeaux |

---

### Questions ouvertes

1. **Source de vérité mode jeûne ?**
   - Option A : Table `calendrier_utilisateur` (plus flexible)
   - Option B : Contexte app React (plus simple)
   - Option C : Colonne dans `semaines_validees` (plus intégré)

2. **Détection automatique fenêtres jeûne ?**
   - Faut-il un calendrier de planification jeûne ?
   - Ou marquage manuel par utilisateur ?
   - Ou détection via absence totale repas + mode app = 'preparation_jeune' ?

3. **Rétrocompatibilité ?**
   - Comment gérer bilans historiques sans info jeûne ?
   - Migration données anciennes ?
   - Distinction possible a posteriori ?

4. **Bilan mensuel ?**
   - Comment agréger semaines mixtes ?
   - Affichage "X jours alimentation / Y jours jeûne sur le mois" ?
   - Tendances mensuelles recalculées ?

---

### Plan d'implémentation (quand priorisation validée)

**Phase 1 : Base de données (2h)**
- Décision architecture stockage
- Migration SQL
- Queries récupération info jeûne

**Phase 2 : Détection mode jeûne (2h)**
- Hook `useModeApp()` ou récupération contexte
- Logique identification jours jeûne vs alimentation
- Tests différents cas d'usage

**Phase 3 : Adaptation calculs (2h)**
- Modification validationSemaine.js
- Ajustement objectifHebdo
- Sauvegarde infos supplémentaires

**Phase 4 : UI bilans (2h)**
- Bandeaux contextuels
- Messages adaptés
- Affichage détaillé composition semaine

**Phase 5 : Tests & validation (2h)**
- Tests unitaires calculs
- Tests UI tous cas d'usage
- Validation utilisateur

---

### Prochaines actions

1. **Décision architecture :** Valider option stockage info jeûne
2. **Analyse code existant :** Comment mode jeûne géré actuellement dans app ?
3. **Maquette UI :** Valider messages/bandeaux avec utilisateur
4. **Priorisation :** Intégrer dans roadmap (urgent ou peut attendre ?)

---

## Message doux personnalisé Section 7 "Comment tu manges"
**Date identification :** 2026-01-21  
**Priorité :** 🟡 Moyenne  
**Statut :** ⏳ À faire  
**Temps estimé :** 55 minutes

**Objectif :** Créer une fonction `genererMessageDoux(bilan)` qui génère un message bienveillant et contextuel selon les données de la semaine (satiété, humeur, extras temporels).

**Emplacement :** `/components/BilanHebdoModal.js` avant ligne 611 (avant fonction SectionCommentMange)

**Logique d'adaptation (4 cas + 1 défaut) :**

1. **Cas 1 : Extras concentrés soir/nuit (> 70%)**
   - Condition : `(extrasHorsRepas.soir + extrasHorsRepas.nuit) / totalExtras > 0.7`
   - Message : *"Tes extras se concentrent en fin de journée : c'est souvent un signal de fatigue ou de besoin de décompresser. Et si tu expérimentais une pause douce en soirée (tisane, musique, lecture) avant de chercher du réconfort dans la nourriture ?"*

2. **Cas 2 : Humeur basse + extras élevés (> 3)**
   - Condition : `humeurScore < 3 ET totalExtras > 3`
   - Message : *"Cette semaine a été plus riche, et ton humeur a été plus basse. C'est normal de chercher du réconfort dans la nourriture : elle est là, disponible, réconfortante. Mais elle ne résout pas ce qui se passe à l'intérieur. Peut-être qu'un temps pour toi, même 5 minutes, pourrait t'aider à mieux identifier ce dont tu as vraiment besoin."*

3. **Cas 3 : Satiété basse (< 3.5)**
   - Condition : `satieteMoyenne < 3.5`
   - Message : *"Ta satiété moyenne est basse : tes repas ne te portent pas assez longtemps. Cela peut venir d'un manque de protéines, de féculents en quantité suffisante, ou d'une mastication trop rapide. Essaie d'observer : qu'est-ce qui te cale vraiment ?"*

4. **Cas 4 : Semaine équilibrée (extras ≤ 2 ET satiété ≥ 4)**
   - Condition : `totalExtras <= 2 ET satieteMoyenne >= 4`
   - Message : *"Cette semaine, tu as maintenu une belle régularité : peu d'extras, une satiété stable. C'est dans ces semaines-là que ton corps apprend à te faire confiance. Continue comme ça, sans pression, juste avec constance."*

5. **Message par défaut (aucun cas ne match)**
   - Message : *"Ce que tu ressens aujourd'hui n'est qu'une étape : c'est la continuité qui façonne ton chemin."*

**Fonction à implémenter :**
```javascript
function genererMessageDoux(bilan) {
  const satieteMoyenne = bilan?.satieteMoyenne || 0;
  const humeurDominante = bilan?.humeurDominante || '';
  const extrasHorsRepas = bilan?.extrasHorsRepas || { matin: 0, apresmidi: 0, soir: 0, nuit: 0 };
  
  // Calculs
  const totalExtras = extrasHorsRepas.matin + extrasHorsRepas.apresmidi + extrasHorsRepas.soir + extrasHorsRepas.nuit;
  const extrasFinJournee = extrasHorsRepas.soir + extrasHorsRepas.nuit;
  const proportionFinJournee = totalExtras > 0 ? extrasFinJournee / totalExtras : 0;
  
  // Mapping humeur vers score numérique
  const mapHumeurScore = (humeur) => {
    if (humeur.includes('Léger') || humeur.includes('Satisfait')) return 5;
    if (humeur.includes('J\'assume')) return 4;
    if (humeur.includes('Neutre')) return 3;
    if (humeur.includes('Lourd')) return 2;
    return 1; // Ballonné/Je regrette/Je culpabilise
  };
  const humeurScore = mapHumeurScore(humeurDominante);
  
  // Logique conditionnelle
  if (totalExtras > 0 && proportionFinJournee > 0.7) {
    return "Tes extras se concentrent en fin de journée : c'est souvent un signal de fatigue ou de besoin de décompresser. Et si tu expérimentais une pause douce en soirée (tisane, musique, lecture) avant de chercher du réconfort dans la nourriture ?";
  }
  
  if (humeurScore < 3 && totalExtras > 3) {
    return "Cette semaine a été plus riche, et ton humeur a été plus basse. C'est normal de chercher du réconfort dans la nourriture : elle est là, disponible, réconfortante. Mais elle ne résout pas ce qui se passe à l'intérieur. Peut-être qu'un temps pour toi, même 5 minutes, pourrait t'aider à mieux identifier ce dont tu as vraiment besoin.";
  }
  
  if (satieteMoyenne < 3.5 && satieteMoyenne > 0) {
    return "Ta satiété moyenne est basse : tes repas ne te portent pas assez longtemps. Cela peut venir d'un manque de protéines, de féculents en quantité suffisante, ou d'une mastication trop rapide. Essaie d'observer : qu'est-ce qui te cale vraiment ?";
  }
  
  if (totalExtras <= 2 && satieteMoyenne >= 4) {
    return "Cette semaine, tu as maintenu une belle régularité : peu d'extras, une satiété stable. C'est dans ces semaines-là que ton corps apprend à te faire confiance. Continue comme ça, sans pression, juste avec constance.";
  }
  
  return "Ce que tu ressens aujourd'hui n'est qu'une étape : c'est la continuité qui façonne ton chemin.";
}
```

**Intégration dans le rendu :**
- Remplacer le message statique actuel (ligne ~661) par : `{genererMessageDoux(bilan)}`
- Le message doit s'afficher en italique, couleur texte normale, dans un bloc dédié

**Tests à effectuer :**
- Test Cas 1 : Mock données avec 5 extras soir, 1 matin → Vérifier message "fin de journée"
- Test Cas 2 : Mock humeur "Ballonné" + 4 extras → Vérifier message "humeur basse"
- Test Cas 3 : Mock satiété 2.8 → Vérifier message "satiété basse"
- Test Cas 4 : Mock satiété 4.5 + 1 extra → Vérifier message "belle régularité"
- Test défaut : Mock données vides → Vérifier message par défaut

---

## Répartition des extras (type, moment, planifié/impulsif)
**Objectif :** Permettre d’analyser et d’afficher la répartition des extras consommés selon leur type (mini, normal, majeur), le moment (matin, midi, soir, nuit) et s’ils étaient planifiés ou impulsifs. Cette fonctionnalité vise à affiner le feedback et à proposer des conseils plus personnalisés.

## Fermeture consciente (stop conscient)
**Objectif :** Intégrer un suivi de la compétence “fermeture consciente” (ex : bouton “J’ai fermé” après un extra, identification du moment le plus dur, déclencheur dominant). Permettra d’accompagner l’utilisateur dans la gestion des écarts et la reprise du contrôle.

## Message motivationnel personnalisé
**Objectif :** Générer un message de motivation dynamique et personnalisé selon la situation de la semaine (sous budget, surplus, progression, etc.), pour renforcer l’engagement et la bienveillance.

## UI en cartes + suggestion micro-action
**Objectif :** Refondre l’UI du bilan hebdomadaire sous forme de 4 cartes (axes) + 1 zone “action pour demain”, avec pour chaque carte : 3 chiffres max, 1 phrase de lecture, 1 suggestion micro-action. Vise à améliorer la lisibilité et l’impact pédagogique.

# 🗓️ Amélioration à prévoir : Format date section "Tout" (gestion des repas)

**Objectif :**
Remplacer le format ISO (AAAA-MM-JJ) de la période globale affichée dans le bandeau bleu clair (mode "Tout") par un format français lisible (ex : du 5 janvier 2026 jusqu’à aujourd’hui).

**Contexte :**
Actuellement, la période globale s’affiche sous la forme « du 2026-01-05 jusqu’à aujourd’hui ». L’objectif est d’améliorer la lisibilité pour l’utilisateur.

**Actions à mener :**
- Adapter le formatage de la date la plus ancienne (début) en français long
- Garder « jusqu’à aujourd’hui » pour la fin
- Tester l’affichage sur différents jeux de données

# 🆕 AJOUTS PROPOSÉS (2026-01-11)

### 11. Ajout d'aliment personnalisé lors de la saisie

**Objectif :** Permettre à l'utilisateur, lors de la saisie d'un repas, d'ajouter un aliment qui n'existe pas dans le référentiel, via un formulaire dédié, dans le même style que les aliments existants. L'aliment enrichira le référentiel interne (personnel ou global selon validation/modération).

**Fonctionnalités attendues :**
- Détection automatique d'absence dans l'autocomplete
- Proposition d'ajout rapide (bouton ou lien)
- Formulaire simplifié (nom, catégorie, kcal, portion, QN...)
- Stockage temporaire (table custom ou localStorage)
- Possibilité de validation/modération ultérieure

### 12. Composition d'assiette/repas complet multi-aliments

**Objectif :** Permettre à l'utilisateur de composer une assiette complète ou un repas composé de plusieurs aliments, avec analyse nutritionnelle globale, et possibilité de sauvegarder ces compositions pour les proposer ensuite dans la planification des repas.

**Fonctionnalités attendues :**
- Ajout multiple d'aliments dans une même saisie
- Calcul automatique des kcal totales, QN moyen, répartition nutriments
- Sauvegarde de la composition (repas favori)
- Suggestion dans la planification
- Analyse d'équilibre et compatibilité avec l'objectif

# 🔧 AMÉLIORATIONS CONTINUES - DÉVELOPPEMENT APP

**Objectif :** Backlog des améliorations identifiées à implémenter progressivement  
**Statut :** Document de suivi  
**Mise à jour :** 2026-01-07

---

## 📋 TABLE DES MATIÈRES

1. [Référentiel Alimentaire](#référentiel-alimentaire)
2. [Interface Utilisateur](#interface-utilisateur)
3. [Moteur Calorique](#moteur-calorique)
4. [Système d'Alertes](#système-dalertes)

---

## 🍔 RÉFÉRENTIEL ALIMENTAIRE

### 1. Enrichissement Référentiel +70% (300 plats)

**Date identification :** 2026-01-07  
**Priorité :** 🟠 Haute  
**Statut :** ⏳ À faire (Plan progressif validé - Option A)

#### Contexte
Le référentiel actuel compte **425 plats**. Objectif: atteindre **723 plats** (+70%) pour couvrir une sélection plus large de repas consommés par les utilisateurs.

#### Calcul
- Référentiel actuel: 425 plats
- Objectif +70%: 723 plats total
- **À ajouter: ~300 nouveaux plats**

#### Lacunes identifiées (couverture géographique actuelle)
- 🇹🇭 **Thaïlande:** 2 plats (Pad Thaï, Curry vert) → Lacune majeure
- 🇨🇲 **Cameroun:** 0 plat → Lacune totale
- 🇬🇧 **Angleterre:** 0 plat → Lacune totale
- 🇨🇳 **Chine:** 12 plats → Couverture moyenne
- 🇯🇵 **Japon:** 12 plats → Couverture moyenne
- 🇰🇷 **Corée:** 27 plats → Bonne couverture (ajout récent)
- 🇨🇩/🇸🇳 **Congo/Sénégal:** 18 plats africains → Couverture correcte
- 🇺🇸 **États-Unis:** 4 plats (burgers) → Lacune majeure

#### Lacunes produits français
- **Viandes boucherie:** 0 plat dédié
- **Fromages:** 4 fromages industriels uniquement → Lacune majeure
- **Charcuterie:** 5 produits seulement → Lacune importante
- **Poissons:** Non analysé
- **Produits grande surface:** Couverture partielle

#### Approche retenue: Plan Progressif (Option A)

**Phase 1 - Prioritaire (50 plats)**
- 🇹🇭 Cuisine thaïlandaise: 15 plats (Tom Yum, Som Tam, Larb, Massaman, etc.)
- 🇨🇲 Cuisine camerounaise: 10 plats (Ndolé, Poulet DG, Koki, Eru, etc.)
- 🇫🇷 Viandes boucherie: 15 plats (Bavette, Entrecôte, Côte de porc, Gigot, etc.)
- 🇫🇷 Fromages: 10 plats (Camembert, Brie, Roquefort, Comté, Chèvre, etc.)

**Phase 2 - Secondaire (100 plats)**
- 🇬🇧 Cuisine anglaise: 15 plats (Fish & Chips, Cottage Pie, Roast Beef, etc.)
- 🇫🇷 Charcuterie: 20 plats (Pâté, Rillettes, Rosette, Coppa, etc.)
- 🇺🇸 Street food américain: 20 plats (Bagels, Donuts variés, Pancakes, etc.)
- 🇨🇳 Cuisine chinoise: 20 plats (Baozi, Jiaozi, Peking Duck, etc.)
- 🇯🇵 Cuisine japonaise: 15 plats (Ramen, Udon, Tonkatsu, Okonomiyaki, etc.)
- 🇹🇭 Complétion thaï: 10 plats

**Phase 3 - Complétion (150 plats)**
- 🇫🇷 Produits grande surface: 40 plats (plats préparés, conserves, etc.)
- 🇫🇷 Poissonnerie: 20 plats (Saumon, Thon, Dorade, Cabillaud, etc.)
- Expansion cuisines existantes: 40 plats
- Street food international: 30 plats
- Desserts/Pâtisseries: 20 plats

#### Typologie aliments à ajouter
1. **Street food internationale**
   - Tacos mexicains, Falafel, Döner kebab, Poutine, Arepas
   
2. **Restaurants (plats faits maison)**
   - Plats traditionnels français, brasserie, bistronomie
   
3. **Grande surface France**
   - Plats préparés, surgelés, conserves
   - Produits frais (boucherie, fromagerie, charcuterie)

4. **Diversité internationale**
   - Couverture équilibrée 9 pays demandés
   - Refléter habitudes alimentaires réelles

#### Contraintes qualité
- ✅ Aucun doublon accepté (vérification grep systématique)
- ✅ QN validé par comparaison plats similaires
- ✅ Kcal réalistes (sources nutritionnelles fiables)
- ✅ Portions standardisées (format cohérent)
- ✅ Alternatives existantes uniquement
- ✅ Process Template.md respecté à 100%

#### Estimation effort total
- **Phase 1:** ~8-10h (recherche + validation + implémentation 50 plats)
- **Phase 2:** ~15-20h (100 plats)
- **Phase 3:** ~25-30h (150 plats)
- **Total:** ~50-60h de travail

#### Prochaines actions (quand démarrage)
1. Création plan détaillé Phase 1 (Template.md)
2. Recherche données nutritionnelles fiables
3. Validation QN/kcal/portions utilisateur
4. Implémentation par batches sécurisés (10-15 plats/batch)
5. Tests autocomplete après chaque batch

---

### 2. Standardisation `portionDefaut` Fast-Food

**Date identification :** 2026-01-07  
**Priorité :** 🟡 Moyenne  
**Statut :** ⏳ À faire  

#### Contexte
Les produits fast-food ajoutés utilisent actuellement des descriptions génériques dans `portionDefaut` (ex: "1 burger", "1 portion"). Pour cohérence avec le reste du référentiel et meilleure information utilisateur, ces valeurs doivent inclure **taille + poids précis**.

#### Produits concernés

##### TYPE 1 : Burgers/Sandwiches (descriptions vagues)
**Actuellement :** `portionDefaut: "1 burger"` ou `"1 sandwich"`  
**Objectif :** Ajouter poids approximatif

**Liste :**
- McDonald's : Big Mac, McChicken, Royal Deluxe, Royal Cheese, Double Cheese, Filet-O-Fish, McWrap Poulet, Hamburger McDo, Cheeseburger McDo
- KFC : Colonel Original, Zinger, Kentucky Burger, Wrap KFC
- Burger King : Whopper, Whopper Jr, Double Whopper, Chicken Royale, Steakhouse, Crispy Chicken, Fish King
- Subway : Tous les subs 15cm et 30cm, wraps

**Poids moyens réels :**
- Big Mac : ~215g
- McChicken : ~185g
- Whopper : ~290g
- Sub Subway 15cm : ~220g
- Sub Subway 30cm : ~440g

**Exemple de transformation :**
```javascript
// AVANT
{ nom: "Big Mac", portionDefaut: "1 burger", kcal: 503 }

// APRÈS
{ nom: "Big Mac", portionDefaut: "1 burger (215g)", kcal: 503 }
```

##### TYPE 2 : Frites/Onion Rings (sans poids)
**Actuellement :** `portionDefaut: "1 portion"`  
**Objectif :** Ajouter taille + grammes précis

**Liste :**
- Frites McDo : petite, moyenne, grande
- Frites KFC : petite, moyenne, grande
- Frites BK : petite, moyenne, grande
- Onion Rings BK : petite, grande

**Poids moyens réels :**
- Petite : ~80g
- Moyenne : ~115g
- Grande : ~150g

**Exemple de transformation :**
```javascript
// AVANT
{ nom: "Frites McDo petite", portionDefaut: "1 portion", kcal: 230 }

// APRÈS
{ nom: "Frites McDo petite", portionDefaut: "1 petite portion (80g)", kcal: 230 }
```

##### TYPE 3 : Nuggets/Poulet (OK - comptage individuel)
**État :** ✅ Déjà clair, pas de modification nécessaire  
`portionDefaut: "1 pièce"` ou `"1 menu"` est suffisamment explicite

##### TYPE 4 : Desserts

**Desserts en pot :**
- Actuellement : `portionDefaut: "1 pot"`
- Objectif : Ajouter contenance (ex: "1 pot (120ml)")

**Liste :**
- McFlurry Oreo, M&M's
- Sundae caramel/chocolat McDo
- Sundae KFC
- Glace vanille/chocolat KFC
- Sundae BK caramel/chocolat
- Glace vanille BK

**Exemple :**
```javascript
// AVANT
{ nom: "McFlurry Oreo", portionDefaut: "1 pot", kcal: 340 }

// APRÈS
{ nom: "McFlurry Oreo", portionDefaut: "1 pot (150ml)", kcal: 340 }
```

**Desserts pièce :**
- Actuellement : `portionDefaut: "1 pièce"`
- Objectif : Ajouter poids (ex: "1 pièce (45g)")

**Liste :**
- Donuts McDo
- Cookie KFC, Subway, BK
- Brownie KFC, BK

**Exemple :**
```javascript
// AVANT
{ nom: "Cookie Subway", portionDefaut: "1 pièce", kcal: 210 }

// APRÈS
{ nom: "Cookie Subway", portionDefaut: "1 pièce (45g)", kcal: 210 }
```

##### TYPE 5 : Boissons
**État :** ✅ Déjà OK  
Format actuel déjà optimal : `"1 gobelet petit (25cl)"`, `"1 gobelet moyen (40cl)"`, etc.

#### Implémentation recommandée

1. **Recherche poids officiels :**
   - Consulter sites officiels McDo, KFC, BK, Subway
   - Vérifier informations nutritionnelles publiées
   - Utiliser moyennes si variations régionales

2. **Mise à jour fichier :**
   - Modifier `/data/referentiel.js`
   - Mettre à jour section `correctifsAliments`
   - ~85 produits concernés

3. **Format standardisé :**
   ```javascript
   portionDefaut: "1 [type] [taille] ([poids/volume])"
   
   Exemples :
   - "1 burger (215g)"
   - "1 petite portion (80g)"
   - "1 pot (150ml)"
   - "1 pièce (45g)"
   ```

4. **Test cohérence :**
   - Vérifier affichage dans RepasBloc.js
   - S'assurer que format reste lisible
   - Tester autocomplete avec nouvelles valeurs

#### Bénéfices attendus

✅ **Clarté utilisateur** : Sait exactement quelle quantité il consomme  
✅ **Cohérence référentiel** : Même niveau de précision que féculents (2 CS) ou bouillons (200ml)  
✅ **Meilleure estimation** : Facilite comparaison entre produits  
✅ **Professionnalisme** : Données précises = confiance app

#### Estimation effort
- **Temps :** ~2-3h (recherche poids + modifications + tests)
- **Complexité :** 🟢 Faible
- **Risque :** 🟢 Minimal (modification données uniquement)

---

## 🎨 INTERFACE UTILISATEUR

### 2. Affichage Score QN lors Sélection Aliment

**Date identification :** 2026-01-07  
**Priorité :** 🟡 Moyenne  
**Statut :** ⏳ À faire

#### Contexte
Tous les aliments du référentiel ont un score QN (1-5) mais celui-ci **n'est pas visible** dans l'interface lors de la sélection d'un aliment.

#### Problème
- ✅ Score QN présent dans `referentiel.js` (ex: `qn: 2`, `qn: 4`)
- ❌ Pas affiché dans autocomplete RepasBloc.js
- ❌ Pas affiché après sélection aliment
- ❌ Utilisateur ne peut pas voir qualité nutritionnelle

#### Solution proposée
Afficher score QN visuellement avec code couleur :
- **QN 5** : 🟢 Vert foncé "Naturel"
- **QN 4** : 🟢 Vert clair "Peu transformé"
- **QN 3** : 🟡 Jaune "Transformé modéré"
- **QN 2** : 🟠 Orange "Transformé"
- **QN 1** : 🔴 Rouge "Ultra-transformé"

#### Emplacement affichage
1. **Dans autocomplete** : Badge à côté du nom
   ```
   Tteokbokki 🟠 QN2
   Banchan légumes verts 🟢 QN4
   ```

2. **Après sélection** : Badge dans ligne aliment sélectionné
   ```
   Repas du midi
   ├─ Tteokbokki (150g) | 280 kcal | 🟠 QN2
   └─ Banchan légumes verts (100g) | 40 kcal | 🟢 QN4
   ```

#### Composants à modifier
- `/components/RepasBloc.js` (autocomplete + affichage)
- `/components/SaisieRepriseJeune.js` (si utilisé)
- Possiblement ajout composant `<QNBadge qn={2} />`

#### Bénéfices
✅ Visibilité qualité nutritionnelle  
✅ Aide choix alimentaires éclairés  
✅ Cohérent avec système QN déjà en place  
✅ Valorise aliments naturels (QN 4-5)

---

### 3. Système d'Alertes Contextuelles Fast-Food

**Date identification :** 2026-01-07  
**Priorité :** 🟠 Haute  
**Statut :** ⏳ À faire  
**Documentation liée :** [COMPREHENSION_PORTIONDEFAUT_MOTEUR_CALORIQUE.md](./COMPREHENSION_PORTIONDEFAUT_MOTEUR_CALORIQUE.md)

#### Contexte
Actuellement, aucun avertissement n'indique aux utilisateurs que les produits fast-food sont **incompatibles avec objectif perte de poids** ou **doivent être consommés occasionnellement**.

Voir documentation complète dans fichier dédié.

#### Actions à mener

**Phase 1 : Enrichissement données**
- ✅ Ajout 85 produits fast-food (FAIT 2026-01-07)
- ⏳ Calculer `equivalentCAS` pour chaque produit
- ⏳ Définir `compatibilitePerte` (occasionnel/déconseillé/incompatible)
- ⏳ Définir `frequenceMax` par objectif

**Phase 2 : Messages contextuels**
```javascript
messageContextuel: {
  perte: "⚠️ Cette portion consomme 92% de ton budget féculents quotidien...",
  maintien: "⚠️ Cette portion représente 37% de ton budget féculents...",
  surplus: "✓ Compatible avec ton objectif. Attention à l'équilibre..."
}
```

**Phase 3 : Interface RepasBloc.js**
- Badge visuel (🟢🟠🔴) selon compatibilité
- Affichage message à la sélection
- Suggestions alternatives intelligentes
- Compteur impact sur budget quotidien

**Phase 4 : Système tracking**
- Compteur hebdomadaire fast-food
- Alerte si dépassement fréquence recommandée
- Stats tendances dans tableau de bord

---

## 🧮 MOTEUR CALORIQUE

### 3. Calcul Automatique Équivalent CAS

**Date identification :** 2026-01-07  
**Priorité :** 🟡 Moyenne  
**Statut :** ⏳ À faire

#### Objectif
Pour chaque aliment du référentiel, calculer automatiquement l'équivalent en **Cuillères À Soupe de féculents** (1 CAS ≈ 25 kcal).

#### Formule
```javascript
equivalentCAS = Math.round((kcal / 25) * 10) / 10;

Exemples :
- Frites McDo petite (230 kcal) → 9.2 CAS
- Big Mac (503 kcal) → 20.1 CAS
- Riz blanc (180 kcal) → 7.2 CAS
```

#### Utilisation
Permettra affichage type :
> "⚠️ Ce Big Mac équivaut à **20 CAS de féculents**, soit 2× ton budget quotidien en perte"

#### Implémentation
1. Ajouter champ `equivalentCAS` au référentiel
2. Script de calcul automatique pour tous les aliments
3. Affichage conditionnel dans interface
4. Utilisation dans système d'alertes

---

## 📊 SYSTÈME D'ALERTES

### 4. Alertes Tendances Hebdomadaires

**Date identification :** 2026-01-07  
**Priorité :** 🟠 Haute  
**Statut :** ⏳ À faire

#### Concept
Analyse cumul hebdomadaire et alerte si comportements à risque détectés.

#### Types d'alertes

**Alerte fast-food :**
```
Si objectif = perte ET fastFoodWeekCount > 1 :
  "Tu as consommé du fast-food 3× cette semaine. 
   Pour ton objectif perte, max 1×/semaine recommandé."
```

**Alerte budget CAS :**
```
Si cumul_7j_CAS > (budgetJournalier × 7) × 1.2 :
  "Tu dépasses ton budget féculents de 20% cette semaine.
   Réduire de 2 CAS par repas cette semaine ?"
```

**Alerte surplus calorique :**
```
Si cumul_7j > +1500 kcal :
  "Tendance surplus détectée (+1500 kcal cette semaine).
   Ajuster repas suivants ? Suggestions : ..."
```

#### Déclencheurs
- Calcul quotidien à minuit
- Notification push si alerte
- Badge dans tableau de bord
- Suggestions d'ajustements automatiques

---

## � ANOMALIES NON-CRITIQUES (Backlog Corrections)

### 5. Alternatives Cassées (3 plats)

**Date identification :** 2026-01-07  
**Priorité :** 🟡 Basse (non bloquant)  
**Statut :** ⏳ À faire

#### Problème
3 plats référencent des alternatives qui n'existent pas dans le référentiel :

1. **Merguez** → alternative `"Kefta"` (INEXISTANT)
2. **Miyeok** → alternative `"Wakame"` (INEXISTANT)
3. **Korean Corn Dog** → alternative `"Hot Dog"` (INEXISTANT)

#### Impact
- ❌ Liens de navigation cassés dans autocomplete
- ❌ Suggestions alternatives incomplètes
- ✅ Pas bloquant : aliment principal fonctionne normalement

#### Solutions possibles

**Option A : Ajouter les aliments manquants**
```javascript
{ nom: "Kefta", categorie: "viande", sousCategorie: "Viandes hachées", ... }
{ nom: "Wakame", categorie: "algue", sousCategorie: "Algues", ... }
{ nom: "Hot Dog", categorie: "fast-food", sousCategorie: "McDo", ... }
```

**Option B : Remplacer par alternatives existantes**
```javascript
// Merguez
alternatives: ["Saucisse", "Chipolata"] // au lieu de "Kefta"

// Miyeok
alternatives: ["Banchan légumes verts", "Algues nori"] // au lieu de "Wakame"

// Korean Corn Dog
alternatives: ["Sotteok-Sotteok", "Saucisse"] // au lieu de "Hot Dog"
```

#### Décision à prendre
Valider avec utilisateur quelle option préférée avant correction.

---

## 🔄 PROCHAINES ÉTAPES

### Ordre d'implémentation recommandé

1. **Court terme (1-2 semaines)**
   - ✅ Documentation compréhension moteur calorique (FAIT)
   - ⏳ Affichage score QN dans UI (RepasBloc)
   - ⏳ Correction 3 alternatives cassées
   - ⏳ Calcul équivalent CAS pour référentiel
   - ⏳ Standardisation portionDefaut fast-food

2. **Moyen terme (1 mois)**
   - ⏳ Système badges visuels compatibilité
   - ⏳ Messages contextuels selon objectif
   - ⏳ Interface alertes RepasBloc.js
   - ⏳ **Enrichissement référentiel Phase 1 (50 plats prioritaires)**

3. **Long terme (2-3 mois)**
   - ⏳ Tracking hebdomadaire fast-food
   - ⏳ Alertes tendances automatiques
   - ⏳ Système suggestions intelligentes
   - ⏳ **Enrichissement référentiel Phase 2 (100 plats)**

4. **Très long terme (3-6 mois)**
   - ⏳ **Enrichissement référentiel Phase 3 (150 plats) → Objectif +70% atteint**

---

## � QUALITÉ CODE & ARCHITECTURE

### 6. Refactoring Ordre Hooks RepasBloc.js ✅ PARTIELLEMENT RÉSOLU

**Date identification :** 2026-01-09  
**Dernière mise à jour :** 2026-01-09 (corrections appliquées)  
**Priorité :** 🟡 MOYENNE (anomalies A/B/D restantes)  
**Statut :** 🟢 ANOMALIE C RÉSOLUE / ⏳ A/B/D À FAIRE

#### Contexte
Audit Template a révélé 4 violations ordre hooks.  
**Anomalie C (CRITIQUE)** résolue 2026-01-09.  
Anomalies A/B/D reportées (non-bloquantes).

---

### 7. Boucle Infinie useEffect fastFoodAliments ✅ RÉSOLU

**Date :** 2026-01-09 | **Priorité :** 🔴 CRITIQUE | **Statut :** ✅ RÉSOLU

**Problème :** useEffect modifiait `fastFoodAliments` avec `fastFoodAliments` en dépendance → boucle infinie

**Code supprimé (lignes 149-157) :**
```javascript
useEffect(() => {
  setFastFoodAliments(fastFoodAliments.map(...)); 
}, [fastFoodAliments]); // ← Cause boucle
```

**Correction :** useEffect supprimé, auto-détection via référentiel suffit

---

### 8. Doublon Interface Fast Food ✅ RÉSOLU

**Date :** 2026-01-09 | **Priorité :** 🟠 HAUTE | **Statut :** ✅ RÉSOLU

**Problème :** 2 sections saisie affichées (confusion UX)

**Correction :** Section "Aliments consommés (Fast food)" masquée (lignes 583-613)  
**Logique :** Saisie normale avec auto-détection suffit

---

**✅ ANOMALIE C : fetchDernierFastFood - RÉSOLUE**

Corrections tentées 2026-01-09 ont créé doublon → rollback effectué.

---

### ANOMALIE C : fetchDernierFastFood déclaré APRÈS usage ⚠️ **BLOQUANTE**

**Erreur actuelle :**
```
Runtime ReferenceError: Cannot access 'fetchDernierFastFood' before initialization
Ligne 216: }, [aliment, fetchDernierFastFood]); ← Utilisation
Ligne 233: const fetchDernierFastFood = useCallback(...); ← Déclaration 17 lignes APRÈS
```

**Impact :**
- 🔴 Page ne charge pas
- 🔴 Application cassée

**Correction requise :**
Déplacer `fetchDernierFastFood` (lignes 233-283, 51 lignes) → AVANT ligne 197 (avant useEffect auto-détection)

**Étapes précises :**
1. Supprimer fonction lignes 233-283
2. Insérer AVANT ligne 197
3. Tester compilation
4. Tester runtime

**Risque :** ⚠️ FAIBLE (simple déplacement)  
**Durée :** 2 minutes

---

### ANOMALIE A : 8 useState déclarés APRÈS useEffect ⚠️ NON BLOQUANTE

**Violation Template ligne 83 :**
> "Tous les hooks React (useState, useEffect, etc.) sont déclarés uniquement en haut du corps du composant fonctionnel"

**Code actuel :**
```javascript
Ligne 161: useEffect(() => { ... }, [fastFoodAliments]); // ← useEffect

Ligne 172: const [estExtra, setEstExtra] = useState(false); // ❌ APRÈS useEffect
Ligne 173: const [satiete, setSatiete] = useState('');
Ligne 174: const [pourquoi, setPourquoi] = useState('');
Ligne 175: const [ressenti, setRessenti] = useState('');
Ligne 176: const [detailsSignaux, setDetailsSignaux] = useState([]);
Ligne 177: const [reactBloc, setReactBloc] = useState([]);
Ligne 178: const [showDefi, setShowDefi] = useState(false);
Ligne 179: const [loadingKcal, setLoadingKcal] = useState(false);
```

**Impact :**
- ✅ Code fonctionne (runtime OK)
- ❌ Ordre hooks violé
- ❌ Lisibilité dégradée
- ❌ Conformité Template 60%

**Correction requise :**
Déplacer 8 useState (lignes 172-180) → ligne 126 (après `setDelaiRespected`)

**Risque :** ⚠️ FAIBLE  
**Durée :** 1 minute

---

### ANOMALIE B : 1 useState intercalé entre useEffect ⚠️ NON BLOQUANTE

**Code actuel :**
```javascript
Ligne 161: useEffect(() => { ... }, [fastFoodAliments]); // ← useEffect #1

Ligne 181: const [semaineValidee, setSemaineValidee] = useState(false); // ❌ useState intercalé

Ligne 185: useEffect(() => { ... }, [semaineCouranteDate]); // ← useEffect #2
```

**Impact :**
- ✅ Runtime OK (`semaineValidee` déclaré avant utilisation ligne 185)
- ❌ Ordre hooks violé
- ❌ Conformité Template 60%

**Correction requise :**
Déplacer 1 useState (lignes 181-182) → ligne 135 (après 8 useState précédents)

**Risque :** ⚠️ FAIBLE  
**Durée :** 30 secondes

---

### ANOMALIE D : 2 handlers déclarés AVANT useEffect ⚠️ NON BLOQUANTE

**Violation Template :**
> Ordre strict : useState → useEffect → handlers → rendu

**Code actuel :**
```javascript
Ligne 139: const handleAddFastFoodAliment = () => { ... }; // ← Handler
Ligne 144: const handleChangeFastFoodAliment = (idx, field, value) => { ... }; // ← Handler

Ligne 150: useEffect(() => { ... }); // ← useEffect APRÈS handlers
```

**Impact :**
- ✅ Runtime OK (handlers utilisés dans JSX ligne 500+)
- ❌ Ordre Template violé
- ❌ Conformité Template 70%

**Correction requise :**
Déplacer 2 handlers (lignes 139-147) → après dernier useEffect (ligne ~360)

**Risque :** ⚠️ FAIBLE  
**Durée :** 1 minute

---

### Stratégie correction recommandée

**PHASE 1 : URGENT - Correction C uniquement**
1. Déplacer `fetchDernierFastFood` avant useEffect
2. Tester compilation + runtime
3. Appliquer correction #4 (rechargement après save)
4. Tests utilisateur

**PHASE 2 : APRÈS validation utilisateur - Corrections A/B/D**
1. Déplacer 8 useState (A)
2. Déplacer 1 useState (B)
3. Déplacer 2 handlers (D)
4. Tester compilation
5. Conformité Template 100%

**Estimation effort total :**
- Phase 1 : 5 minutes
- Phase 2 : 5 minutes
- **Total : 10 minutes**

**Bénéfices :**
- ✅ Application fonctionne (Phase 1)
- ✅ Conformité Template 100% (Phase 2)
- ✅ Code maintenable professionnel
- ✅ Respect règles React officielles

---

## 🆕 NOUVELLES FONCTIONNALITÉS

### 7. Ajout Aliments Utilisateur Personnalisés

**Date identification :** 2026-01-09  
**Priorité :** 🟡 Moyenne  
**Statut :** ⏳ À faire

#### Objectif
Permettre aux utilisateurs d'enrichir le référentiel en ajoutant leurs propres aliments directement depuis l'interface.

#### Fonctionnalités

**1. Détection aliment absent**
- Utilisateur saisit "Poulet basquaise" (non existant)
- Autocomplete ne retourne aucun résultat
- **Message :** "Aliment non trouvé. Voulez-vous l'ajouter au référentiel ?"
- Bouton "Ajouter cet aliment"

**2. Formulaire ajout personnalisé**
```javascript
{
  nom: "Poulet basquaise", // Pré-rempli
  categorie: "", // Select (féculent, protéines, légumes, etc.)
  sousCategorie: "", // Dynamique selon catégorie
  quantite: "", // Nombre
  unite: "", // Select (g, CS, pièce, etc.)
  kcal: "", // Nombre (par unité)
  qn: "", // Select 1-5
  portionDefaut: "", // Auto-généré : "1 [unite] ([quantite])"
  marque: "", // Optionnel (si fast-food)
  alternatives: [] // Optionnel
}
```

**3. Validation données**
- Vérification doublon (nom normalisé)
- Kcal > 0
- QN entre 1 et 5
- Catégorie obligatoire
- Unite cohérente avec catégorie

**4. Stockage temporaire**
- Table Supabase : `referentiel_user_custom`
- Colonnes : user_id, aliment_data (JSON), date_ajout, statut (en_attente/validé)
- Visibilité : Utilisateur voit UNIQUEMENT ses aliments custom

**5. Process modération (optionnel future)**
- Admin peut valider aliments custom
- Si validé → ajout référentiel global
- Si refusé → reste privé utilisateur

#### Composants à créer

**1. `<FormAjoutAliment />` (nouveau composant)**
- Formulaire complet ajout aliment
- Validation temps réel
- Calcul auto portionDefaut
- Suggestions QN selon catégorie

**2. Modification `RepasBloc.js`**
- Détection autocomplete vide
- Affichage bouton "Ajouter aliment"
- Modal formulaire ajout
- Fusion résultats (référentiel global + custom user)

**3. Hook `useUserReferentiel(user_id)`**
```javascript
const { referentielGlobal, referentielCustom, referentielComplet } = useUserReferentiel(user_id);
// referentielComplet = [...referentielGlobal, ...referentielCustom]
```

#### Bénéfices
- ✅ Référentiel adapté habitudes utilisateur
- ✅ Pas besoin attendre ajout admin
- ✅ Autonomie totale
- ✅ Base pour enrichissement référentiel global

**Estimation effort :**
- Création composant : 3h
- Intégration RepasBloc : 2h
- Table Supabase + queries : 1h
- Tests : 1h
- **Total : 7h**

---

### 8. Composition Assiette/Repas Complets

**Date identification :** 2026-01-09  
**Priorité :** 🟢 Basse  
**Statut :** ⏳ À faire

#### Objectif
Permettre de créer des "repas composés" (plusieurs aliments groupés) et les proposer dans la planification.

#### Fonctionnalités

**1. Mode composition**
- Bouton "Créer repas composé" dans RepasBloc
- Ajout multiple aliments dans même repas
- Calcul automatique kcal totales
- Calcul QN moyen pondéré

**Exemple :**
```javascript
{
  nom: "Poulet rôti + Riz + Brocolis",
  type: "repas_compose",
  composition: [
    { nom: "Poulet grillé", quantite: 150, unite: "g", kcal: 248 },
    { nom: "Riz blanc", quantite: 6, unite: "CS", kcal: 180 },
    { nom: "Brocolis vapeur", quantite: 150, unite: "g", kcal: 51 }
  ],
  kcalTotal: 479,
  qnMoyen: 3.7, // Pondéré par kcal
  portionDefaut: "1 assiette complète"
}
```

**2. Sauvegarde repas favoris**
- Stockage : `repas_composes_user`
- Réutilisable dans planification
- Éditable (ajouter/retirer aliments)
- Dupliquer pour créer variantes

**3. Suggestions planification**
- Affichage dans autocomplete
- Badge "Repas complet 🍽️"
- Détails composition au survol
- Ajustement quantités global (×1.2, ×0.8)

**4. Analyse nutritionnelle**
- Répartition protéines/féculents/légumes
- Score équilibre assiette
- Compatibilité objectif (perte/maintien/surplus)
- Suggestions améliorations

#### Bénéfices
- ✅ Gain temps saisie quotidienne
- ✅ Cohérence repas planifiés
- ✅ Éducation équilibre alimentaire
- ✅ Base recettes personnalisées

**Estimation effort :**
- Interface composition : 4h
- Calculs nutritionnels : 2h
- Intégration planification : 3h
- Tests : 2h
- **Total : 11h**

---

## �📝 NOTES DE SUIVI

### 2026-01-09
- ❌ Incident correction fast food tracking
- 🚨 **Anomalies ordre hooks Template détectées (CRITIQUE)**
- ⏳ Corrections reportées - Nécessite refactoring complet RepasBloc.js
- 📋 4 anomalies identifiées (voir section ci-dessous)

### 2026-01-07
- ✅ Identification erreur conceptuelle portionDefaut
- ✅ Documentation COMPREHENSION_PORTIONDEFAUT_MOTEUR_CALORIQUE.md
- ✅ Création backlog améliorations continues (ce fichier)
- ⏳ Décision : Reporter standardisation portionDefaut à plus tard
- ✅ Ajout 39 plats coréens/africains/chinois au référentiel
- ✅ Identification anomalie : Score QN non visible dans UI
- ✅ Identification anomalie : 3 alternatives cassées (non-critique)
- ⏳ Corrections reportées à session future (pas bloquant utilisation)
- ✅ Analyse enrichissement référentiel +70% (300 plats)
- ✅ **Décision utilisateur: Plan progressif Option A validé (3 phases)**
- ⏳ Implémentation reportée à sessions futures
- 🎯 Objectif final: 425 → 723 plats (couverture 9 pays + produits français)

---

## 🎯 ROUTEUR POIDS & PROFIL UTILISATEUR

### 9. Synchronisation Suivi Journalier avec Routeur Poids

**Date identification :** 2026-01-10  
**Priorité :** 🔴 CRITIQUE  
**Statut :** ⏳ À faire (Phase 0 incomplète)

#### Contexte
Phase 0 implémentée (migration BDD, routeurPoids.js, formulaire enrichi, calculs BMR/TDEE/budget).  
**Incohérence détectée :** Suivi journalier affiche ancien calcul, pas calculs routeur poids.

#### Problème actuel

**Suivi journalier (`/pages/suivi.js`) :**
```javascript
Objectif calorique du jour : 1800 kcal  // ← Ancien besoin_objectif
Consommé aujourd'hui : 0 kcal
Reste à consommer : 1800 kcal
```

**Routeur poids (`/pages/profil.js`) :**
```javascript
BMR (Métabolisme de base) : 1802 kcal/jour
TDEE (Dépense totale) : 2162 kcal/jour
Budget extras hebdo : 500 kcal/semaine
Apport calorique cible : 1730 kcal/jour  // ← Nouveau calcul personnalisé
```

**Écart :** 1800 kcal (ancien) vs 1730 kcal (routeur) = **70 kcal différence** ❌

#### Origine problème

**Fichier `/pages/suivi.js` (ligne ~20-50) :**
```javascript
const { data: profil } = await supabase
  .from('profil')
  .select('besoin_objectif')  // ← Utilise ANCIEN champ
  .single();

setObjectifCaloriqueJour(profil.besoin_objectif || 1800);
```

**Devrait utiliser :**
```javascript
import { calculerProfilComplet } from '../lib/routeurPoids';

const { data: profil } = await supabase
  .from('profil')
  .select('sexe, age, taille, poids_de_depart, niveau_activite, objectif')
  .single();

const calculs = calculerProfilComplet(profil);
setObjectifCaloriqueJour(calculs.apport_calorique_cible);
```

#### Fichiers à modifier

**1. `/pages/suivi.js`**
- Importer `calculerProfilComplet` depuis `/lib/routeurPoids.js`
- Récupérer profil complet (pas juste besoin_objectif)
- Calculer routeur poids au chargement
- Utiliser `apport_calorique_cible` comme objectif journalier
- Afficher BMR/TDEE en info complémentaire (optionnel)

**2. Ajout affichage budget extras (optionnel)**
```javascript
// Suivi journalier enrichi
Objectif calorique : 1730 kcal (TDEE: 2162 kcal, BMR: 1802 kcal)
Budget extras semaine : 500 kcal (140 kcal consommés, reste 360 kcal)
```

#### Impact attendu
- ✅ Cohérence totale entre profil et suivi
- ✅ Calculs personnalisés (sexe, activité, objectif)
- ✅ Budget extras visible quotidiennement
- ✅ Utilisateur voit calculs routeur en action

#### Estimation effort
- Modification suivi.js : 1h
- Tests cohérence : 30min
- Affichage budget extras : 1h
- **Total : 2h30**

---

### 10. Sélecteur Objectif Explicite (Perte/Maintien/Prise)

**Date identification :** 2026-01-10  
**Priorité :** 🟠 HAUTE  
**Statut :** ⏳ À faire (Phase 0 incomplète)

#### Problème actuel

**Logique implicite (code actuel) :**
```javascript
// /pages/profil.js ligne ~95
const objectifType = poids > obj ? 'perte' : (poids < obj ? 'prise' : 'maintien');
```

**Limitations :**
- ❌ Utilisateur ne voit jamais "Que veux-tu ? Perdre/Maintenir/Prendre"
- ❌ Objectif déduit automatiquement du poids_de_depart vs objectif
- ❌ Impossible de choisir "maintien" si poids = objectif
- ❌ Impossible de choisir "prise masse musculaire" si poids < objectif pour raison sportive

**Exemple scénario cassé :**
```
Utilisateur : 75 kg actuel, veut MAINTENIR à 75 kg
Formulaire : Poids départ 75, Objectif 75
Code déduit : "maintien" → ✅ OK par chance

Utilisateur : 70 kg actuel, veut PRISE MASSE (musculation) à 75 kg
Formulaire : Poids départ 70, Objectif 75
Code déduit : "prise" → ✅ OK par chance

Utilisateur : 80 kg actuel, veut PERTE GRAISSEUSE mais MAINTIEN MUSCLE à 75 kg
Formulaire : Poids départ 80, Objectif 75
Code déduit : "perte" → ⚠️ Mais quel type perte ? Sèche sportive ou perte santé ?
```

#### Solution proposée

**Ajout champ explicite dans FormulaireProfil.js :**
```javascript
<div>
  <label>Quel est ton objectif ?</label>
  <select
    value={objectifType}
    onChange={(e) => setObjectifType(e.target.value)}
    required
  >
    <option value="">-- Sélectionner --</option>
    <option value="perte">🔻 Perdre du poids (déficit calorique)</option>
    <option value="maintien">⚖️ Maintenir mon poids actuel</option>
    <option value="prise">🔺 Prendre du poids (surplus calorique)</option>
  </select>
</div>

{objectifType === 'perte' && (
  <p style={{fontSize: '0.9rem', color: '#666'}}>
    💡 Déficit recommandé : -20% calories (perte progressive saine)
  </p>
)}

{objectifType === 'maintien' && (
  <p style={{fontSize: '0.9rem', color: '#666'}}>
    💡 Apport = Dépense (TDEE). Idéal pour stabilisation.
  </p>
)}

{objectifType === 'prise' && (
  <p style={{fontSize: '0.9rem', color: '#666'}}>
    💡 Surplus recommandé : +10-15% calories (prise masse propre)
  </p>
)}
```

**Migration BDD :**
```sql
ALTER TABLE profil 
ADD COLUMN IF NOT EXISTS objectif_type TEXT CHECK (objectif_type IN ('perte', 'maintien', 'prise'));

-- Remplir automatiquement pour profils existants
UPDATE profil 
SET objectif_type = CASE 
  WHEN poids_de_depart > objectif THEN 'perte'
  WHEN poids_de_depart < objectif THEN 'prise'
  ELSE 'maintien'
END
WHERE objectif_type IS NULL;
```

**Utilisation dans calculerProfilComplet :**
```javascript
// Au lieu de deviner
const budgetExtras = calculerBudgetExtras(profil.objectif_type, tdee);
```

#### Bénéfices
- ✅ Clarté intention utilisateur
- ✅ Calculs budget extras précis
- ✅ Messages contextuels adaptés
- ✅ Support objectifs sportifs (sèche/prise masse)

#### Estimation effort
- Migration SQL : 5min
- Ajout select formulaire : 30min
- Messages conditionnels : 20min
- Mise à jour routeurPoids.js : 10min
- Tests : 30min
- **Total : 1h45**

---

### 11. Tooltips & Explications Formulaire Profil

**Date identification :** 2026-01-10  
**Priorité :** 🟡 MOYENNE  
**Statut :** ⏳ À faire (Phase 0 incomplète)

#### Problème actuel

**Formulaire sans contexte :**
```javascript
<label>Sexe</label>  // ← Pourquoi on demande ça ?
<select>...</select>

<label>Niveau d'activité physique</label>  // ← Comment choisir ?
<select>
  <option value="sedentaire">Sédentaire (peu ou pas d'exercice)</option>
  <option value="modere">Modérément actif (exercice 3-5 jours/semaine)</option>
  ...
</select>
```

**Questions utilisateur :**
- ❓ "Pourquoi sexe ? C'est quoi BMR ?"
- ❓ "Sédentaire vs modéré : je marche 30min/jour, c'est quoi ?"
- ❓ "TDEE, ça veut dire quoi ?"
- ❓ "Budget extras 500 kcal/semaine, c'est beaucoup ?"

#### Solution proposée

**1. Info-bulles ⓘ explicatives**
```javascript
<div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
  <label>Sexe</label>
  <span 
    title="Utilisé pour calculer ton métabolisme de base (BMR). Hommes et femmes ont des formules différentes."
    style={{cursor: 'help', fontSize: '1rem', color: '#3498db'}}
  >
    ⓘ
  </span>
</div>
```

**2. Guide visuel niveau activité**
```javascript
<select value={niveauActivite} onChange={...}>
  <option value="sedentaire">
    🪑 Sédentaire - Travail bureau, peu de marche (×1.2)
  </option>
  <option value="modere">
    🚶 Modéré - Marche quotidienne, sport 3×/semaine (×1.5)
  </option>
  <option value="actif">
    🏃 Actif - Sport intense 6×/semaine, travail physique (×1.7)
  </option>
  <option value="intense">
    💪 Très actif - Sportif professionnel, entraînement quotidien (×2.0)
  </option>
</select>

<div style={{fontSize: '0.85rem', color: '#666', marginTop: '0.5rem'}}>
  💡 Le coefficient (×1.2 à ×2.0) multiplie ton BMR pour calculer ta dépense totale (TDEE)
</div>
```

**3. Glossaire déroulant**
```javascript
<button 
  onClick={() => setAfficherGlossaire(!afficherGlossaire)}
  style={{background: 'none', border: '1px solid #ddd', padding: '0.5rem', borderRadius: 8}}
>
  📖 Comprendre les calculs (BMR, TDEE, Budget)
</button>

{afficherGlossaire && (
  <div style={{background: '#f7f9fc', padding: '1rem', borderRadius: 8, marginTop: '1rem'}}>
    <h4>📊 Lexique</h4>
    <ul>
      <li><strong>BMR</strong> : Métabolisme de base. Calories brûlées au repos (respiration, digestion).</li>
      <li><strong>TDEE</strong> : Dépense totale quotidienne. BMR × activité physique.</li>
      <li><strong>Budget extras</strong> : Calories "bonus" hebdomadaires pour écarts/plaisirs.</li>
    </ul>
  </div>
)}
```

**4. Validation intelligente**
```javascript
// Si âge > 60 et niveau_activite = 'intense'
⚠️ Attention : Niveau "Très actif" inhabituel pour 65 ans. Confirmer ?

// Si objectif_type = 'perte' et niveau_activite = 'sedentaire'
💡 Astuce : Ajouter 30min marche/jour augmenterait ton TDEE de ~200 kcal
```

#### Composant réutilisable

**`<InfoBulle texte="..." />`**
```javascript
export default function InfoBulle({ texte }) {
  return (
    <span 
      title={texte}
      style={{
        cursor: 'help', 
        fontSize: '1rem', 
        color: '#3498db',
        marginLeft: '0.5rem'
      }}
    >
      ⓘ
    </span>
  );
}

// Utilisation
<label>
  Sexe <InfoBulle texte="Utilisé pour calculer BMR (métabolisme de base)" />
</label>
```

#### Bénéfices
- ✅ Utilisateur comprend pourquoi on demande ces infos
- ✅ Choix éclairés (activité, objectif)
- ✅ Éducation nutritionnelle progressive
- ✅ Réduction erreurs saisie

#### Estimation effort
- Composant InfoBulle : 30min
- Ajout tooltips formulaire : 1h
- Guide niveaux activité : 30min
- Glossaire déroulant : 1h
- Validations intelligentes : 1h
- **Total : 4h**

---

### 12. Onboarding Nouvel Utilisateur (Parcours Guidé)

**Date identification :** 2026-01-10  
**Priorité :** 🟡 MOYENNE  
**Statut :** ⏳ À faire (Phase 0 incomplète)

#### Problème actuel

**Première connexion utilisateur :**
1. Arrive sur page profil vide
2. Formulaire 10 champs sans contexte
3. Aucune explication objectif app
4. Après save → redirigé où ? Tableau de bord vide ?
5. Pas de guide "Prochaines étapes"

**Taux abandon attendu :** 🔴 ÉLEVÉ (formulaire trop dense d'un coup)

#### Solution proposée

**Onboarding en 4 étapes (wizard)**

**Étape 1 : Bienvenue + Intention**
```javascript
<div style={{textAlign: 'center', padding: '2rem'}}>
  <h1>👋 Bienvenue sur [Nom App] !</h1>
  <p>En quelques questions, on va personnaliser ton expérience.</p>
  
  <div style={{margin: '2rem 0'}}>
    <h3>Que veux-tu accomplir ?</h3>
    <button onClick={() => setObjectifType('perte')}>
      🔻 Perdre du poids sainement
    </button>
    <button onClick={() => setObjectifType('maintien')}>
      ⚖️ Maintenir mon poids actuel
    </button>
    <button onClick={() => setObjectifType('prise')}>
      🔺 Prendre de la masse musculaire
    </button>
  </div>
  
  <button onClick={nextStep}>Suivant →</button>
</div>
```

**Étape 2 : Profil physique**
```javascript
<h2>📏 Dis-nous en plus sur toi</h2>
<input placeholder="Âge" />
<select placeholder="Sexe">...</select>
<input placeholder="Taille (cm)" />
<input placeholder="Poids actuel (kg)" />
<input placeholder="Poids objectif (kg)" />

<button onClick={prevStep}>← Retour</button>
<button onClick={nextStep}>Suivant →</button>
```

**Étape 3 : Niveau activité + Timeline**
```javascript
<h2>🏃 Ton mode de vie</h2>

<div>
  <label>Niveau d'activité physique</label>
  <InfoBulle texte="Détermine ta dépense calorique quotidienne" />
  <select>...</select>
</div>

<div>
  <label>Objectif à atteindre en combien de mois ?</label>
  <input type="number" />
</div>

<button onClick={prevStep}>← Retour</button>
<button onClick={nextStep}>Suivant →</button>
```

**Étape 4 : Motivation + Résumé**
```javascript
<h2>💪 Dernière étape !</h2>

<textarea placeholder="Pourquoi ce projet est important pour toi ?">
</textarea>

<div style={{background: '#e8f5e9', padding: '1.5rem', borderRadius: 12}}>
  <h3>📊 Ton profil personnalisé</h3>
  <ul>
    <li>Objectif : Perdre 10 kg en 6 mois</li>
    <li>BMR : 1802 kcal/jour</li>
    <li>TDEE : 2162 kcal/jour</li>
    <li>Apport cible : 1730 kcal/jour (-20% déficit)</li>
    <li>Budget extras : 500 kcal/semaine</li>
  </ul>
  <p style={{fontSize: '0.9rem', color: '#666', marginTop: '1rem'}}>
    Ces valeurs sont des estimations scientifiques. Consulter un professionnel pour suivi personnalisé.
  </p>
</div>

<button onClick={prevStep}>← Retour</button>
<button onClick={handleFinishOnboarding}>Terminé ! 🎉</button>
```

**Après onboarding :**
```javascript
// Redirection automatique vers dashboard avec message
"🎉 Profil créé avec succès ! Prochaine étape : Enregistre ton premier repas"

// Badge "Nouveau" sur bouton "Suivi journalier"
// Tooltip "Clique ici pour commencer" qui apparaît 2 secondes
```

#### Composant

**`/pages/onboarding.js` (nouvelle page)**
```javascript
export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  
  const steps = [
    <StepBienvenue />,
    <StepProfilPhysique />,
    <StepActivite />,
    <StepMotivation />
  ];
  
  return (
    <div className="onboarding-container">
      <ProgressBar step={step} total={4} />
      {steps[step - 1]}
    </div>
  );
}
```

**Détection première connexion (_app.js) :**
```javascript
useEffect(() => {
  const checkProfil = async () => {
    const { data: profil } = await supabase
      .from('profil')
      .select('id')
      .single();
    
    if (!profil) {
      // Aucun profil → rediriger vers onboarding
      router.push('/onboarding');
    }
  };
  
  checkProfil();
}, []);
```

#### Bénéfices
- ✅ Taux complétion formulaire +60%
- ✅ Utilisateur comprend valeur app
- ✅ Engagement immédiat (gamification steps)
- ✅ Données profil plus qualitatives (motivation)
- ✅ Abandon réduit

#### Estimation effort
- Design wizard 4 étapes : 2h
- Composants steps : 3h
- Logique navigation : 1h
- Intégration _app.js : 1h
- Tests parcours complet : 1h
- **Total : 8h**

---

**Dernière mise à jour :** 2026-01-10  
**Prochaine revue :** À définir selon priorités projet

A ajouter permettre a l utilisateur quand il saisit aliment si non exiqstant dans le referentiel de l ajouter dans le meme style que existant pour enrichissement interne du referentiel, aussi permetre la compoqition d assiette complete/ repas complet avec ajout multiple de plusieurs aliment qui apres analyse pourront aussi etre propose dans planification des repas