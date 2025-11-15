# 🍽️ RÉFÉRENTIEL ALIMENTAIRE - ANALYSE COMPLÈTE DE L'APP

**Date : 15 novembre 2025**

---

## 📍 OÙ SE TROUVE LE RÉFÉRENTIEL ALIMENTAIRE ?

### 🎯 FICHIER PRINCIPAL : `/data/referentiel.js`

**Contenu actuel** : 11 aliments de base

```javascript
const referentielAliments = [
  // FÉCULENTS (5 aliments)
  { nom: "Pain complet", categorie: "féculent", kcal: 250, portionMax: "50-80g", typeRepas: "Petit-déjeuner" },
  { nom: "Riz basmati", categorie: "féculent", kcal: 350, portionMax: "2 CS Bombées", typeRepas: "Déjeuner" },
  { nom: "Croissant", categorie: "féculent", kcal: 400, portionMax: "1 pièce", typeRepas: "Petit-déjeuner" },
  { nom: "Céréales muesli", categorie: "féculent", kcal: 300, portionMax: "40g", typeRepas: "Petit-déjeuner" },
  { nom: "Biscuits digestifs", categorie: "féculent", kcal: 450, portionMax: "2 pièces", typeRepas: "Collation" },
  
  // PROTÉINES (2 aliments)
  { nom: "Poulet grillé", categorie: "protéine", kcal: 200, portionMax: "100-120g", typeRepas: "Déjeuner" },
  { nom: "Saumon fumé", categorie: "protéine", kcal: 180, portionMax: "100-120g", typeRepas: "Déjeuner" },
  
  // LÉGUMES (2 aliments)
  { nom: "Haricots verts", categorie: "légume", kcal: 30, portionMax: "100-150g", typeRepas: "Déjeuner" },
  { nom: "Carottes râpées", categorie: "légume", kcal: 40, portionMax: "3,5 CS Bombées", typeRepas: "Déjeuner" },
  
  // FRUITS (1 aliment)
  { nom: "Banane", categorie: "fruit", kcal: 90, portionMax: "1 pièce", typeRepas: "Collation" },
  
  // EXTRAS (1 aliment)
  { nom: "Chocolat noir", categorie: "extra", kcal: 500, portionMax: "20g", typeRepas: "Collation" }
];
```

**Structure des objets** :
- `nom` : Nom de l'aliment
- `categorie` : féculent | protéine | légume | fruit | extra
- `sousCategorie` : Pain, Pâtes/Riz, Viandes, Poissons, Légumes verts, etc.
- `kcal` : Calories pour la portion type
- `portionMax` : Portion recommandée (en grammes ou cuillères à soupe)
- `typeRepas` : Petit-déjeuner | Déjeuner | Dîner | Collation
- `moment` : Matin | Midi | Soir | Après-midi
- `alternatives` : Array d'alternatives possibles

---

## 📂 OÙ EST UTILISÉ CE RÉFÉRENTIEL ?

### 1️⃣ `/pages/plan.js` - PLANIFICATION REPAS
**Ligne 4** : `import referentielAliments from "../data/referentiel";`

**Utilisation** :
- **Ligne 127** : Recherche d'aliment lors de la saisie
```javascript
const found = referentielAliments.find(a => a.nom === aliment);
```

- **Ligne 172** : Suggestions d'aliments par type de repas
```javascript
const suggestionsRef = referentielAliments.filter(a => a.typeRepas === type);
```

**Contexte** : Page de planification mensuelle avec drag & drop. Utilise le référentiel pour suggérer des aliments adaptés à chaque moment de la journée.

---

### 2️⃣ `/components/RepasBloc.js` - SAISIE REPAS RÉELS
**Ligne 7-14** : Référentiel LOCAL (doublon simplifié)

```javascript
const referentielAliments = [
  { nom: "Poulet", categorie: "protéine", kcal: 120 },
  { nom: "Haricots verts", categorie: "légume", kcal: 30 },
  { nom: "Riz", categorie: "féculent", kcal: 110 },
  { nom: "Banane", categorie: "fruit", kcal: 90 },
  { nom: "Chocolat", categorie: "extra", kcal: 150 }
]
```

⚠️ **PROBLÈME DÉTECTÉ** : Doublon non synchronisé avec `/data/referentiel.js`

**Contexte** : Composant de saisie des repas réels avec feedback instantané (extras restants, satiété, etc.)

---

### 3️⃣ `/pages/repas.js` - PAGE SAISIE REPAS SIMPLE
**Pas d'import du référentiel** (saisie manuelle)

**Champs** :
- `aliment` (texte libre)
- `quantite`
- `kcal`
- `type` (Petit-déjeuner, Déjeuner, Dîner)
- `categorie`
- Checkbox `isFastFood`

**Contexte** : Saisie rapide sans référentiel, enregistrement direct en BDD

---

## 🗄️ TABLES BASE DE DONNÉES (SUPABASE)

### 1️⃣ `repas_reels` - REPAS CONSOMMÉS
**Champs existants** :
- `user_id`
- `date`
- `type` (Petit-déjeuner, Déjeuner, Dîner, Collation)
- `aliment`
- `categorie` (féculent, protéine, légume, fruit, extra)
- `quantite`
- `kcal`
- `note` (analyse comportementale)
- `est_extra` (boolean)
- `satiete` (oui/non)
- `etat_apres` (léger, satisfait, lourd, etc.)
- `heure_repas`

**Champs suggérés (non implémentés)** :
- `plage_alimentaire_minutes` (durée du repas)
- `respect_19h` (boolean)
- `action_post_repas` (marche, ménage, autre)
- `preparation_jeune_id` (lien avec préparation au jeûne)

---

### 2️⃣ `repas_planifies` - REPAS PRÉVUS
**Champs** :
- `user_id`
- `date`
- `type`
- `repas_nom`
- `categorie`
- `quantite_prevue`
- `kcal_prevus`

**Contexte** : Planning alimentaire mensuel (page `/plan.js`)

---

### 3️⃣ `fast_food_history` - HISTORIQUE FAST-FOOD
**Champs** :
- `user_id`
- `date`
- `type_repas`
- `enseigne` (McDonald's, KFC, etc.)
- `aliments` (JSONB array)
- `kcal_total`

**Contexte** : Tracking spécifique fast-food avec système de récompenses

---

## 📊 RÈGLES MÉTIER ALIMENTAIRES

### Règles de gestion par catégorie (dans `/pages/plan.js` ligne 22-28)

```javascript
const reglesGestion = {
  "féculent": "Féculents cuits : 50-80g max/jour. Riz : 2 CS bombées. Pâtes : 3 CS bombées.",
  "protéine": "Protéines animales : 100-120g max/jour.",
  "légume": "Légumes : à volonté, privilégier la variété.",
  "fruit": "Fruits : 2 à 3 portions/jour.",
  "extra": "Extras : 3/semaine max, portion raisonnable, jamais à jeun."
};
```

### Règles de feedback (dans `/components/RepasBloc.js` ligne 17-36)

```javascript
const rules = [
  {
    check: ({ estExtra, extrasRestants }) => estExtra && extrasRestants <= 0,
    type: "challenge",
    message: "Tu as dépassé ton quota d'extras cette semaine..."
  },
  {
    check: ({ satiete }) => satiete === "non",
    type: "defi",
    message: "Défi : Essaie d'écouter ta satiété sur le prochain repas."
  },
  // etc.
]
```

### États alimentaires - Baromètre (dans `/components/RepasBloc.js` ligne 38-47)

```javascript
const etatsAlimentaires = [
  { label: "Léger", value: "léger", icon: "🌱", color: "#a5d6a7" },
  { label: "Satisfait", value: "satisfait", icon: "😊", color: "#ffe082" },
  { label: "Lourd", value: "lourd", icon: "😑", color: "#ffcc80" },
  { label: "Ballonné", value: "ballonné", icon: "🤢", color: "#ef9a9a" },
  { label: "Je regrette", value: "je regrette", icon: "😔", color: "#b0bec5" },
  { label: "Je culpabilise", value: "je culpabilise", icon: "😟", color: "#b39ddb" },
  { label: "Neutre", value: "neutre", icon: "😐", color: "#bdbdbd" },
  { label: "J'assume", value: "j'assume", icon: "💪", color: "#80cbc4" }
]
```

---

## 🔍 ANALYSE DES BESOINS

### ✅ CE QUI FONCTIONNE
1. ✅ Référentiel de base fonctionnel (`/data/referentiel.js`)
2. ✅ Structure cohérente (catégories, portions, calories)
3. ✅ Intégration dans page planning (`/plan.js`)
4. ✅ Règles métier définies
5. ✅ Baromètre d'états alimentaires
6. ✅ Tracking extras (3/semaine max)

### ⚠️ CE QUI MANQUE / À AMÉLIORER

#### 🔴 PRIORITÉ HAUTE
1. **Doublon référentiel dans RepasBloc.js** 
   - Problème : 2 référentiels différents (non synchronisés)
   - Solution : Importer `/data/referentiel.js` au lieu de redéfinir
   
2. **Référentiel incomplet**
   - Seulement 11 aliments (trop limité)
   - Manque : pâtes, œufs, yaourts, fromage, légumes variés, etc.
   - Solution : Enrichir à minimum 50-100 aliments de base

3. **Pas de système de quantités standardisées**
   - Mélange g, CS, pièces
   - Difficile à standardiser pour stats
   - Solution : Créer système de conversion (cuillère à soupe = X grammes)

#### 🟡 PRIORITÉ MOYENNE
4. **Pas de catégorie "plats composés"**
   - Ex: Pizza, lasagnes, couscous, pot-au-feu
   - Solution : Ajouter sous-catégorie ou table séparée

5. **Pas de gestion des recettes personnelles**
   - Impossible d'enregistrer ses propres plats
   - Solution : Table `recettes_user` avec composition

6. **Pas de détection automatique féculents le soir**
   - Important pour préparation jeûne (J-17)
   - Solution : Fonction de validation dans RepasBloc

#### 🟢 PRIORITÉ BASSE
7. **Pas d'alternatives visuelles**
   - Les alternatives existent dans le référentiel mais pas affichées
   - Solution : Modal "Idées de remplacement"

8. **Pas de saison/disponibilité**
   - Certains aliments saisonniers
   - Solution : Champ `saison` optionnel

---

## 🚀 ACTIONS RECOMMANDÉES

### 📌 ACTION 1 - Corriger doublon RepasBloc (30 min)
**Fichier** : `/components/RepasBloc.js`
**Action** : Supprimer lignes 7-14, importer `/data/referentiel.js`

```javascript
// AVANT (ligne 7-14)
const referentielAliments = [
  { nom: "Poulet", categorie: "protéine", kcal: 120 },
  // ...
]

// APRÈS
import referentielAliments from '../data/referentiel';
```

---

### 📌 ACTION 2 - Enrichir référentiel (2-3h)
**Fichier** : `/data/referentiel.js`
**Objectif** : Passer de 11 à 50-100 aliments

**Aliments à ajouter par catégorie** :

#### FÉCULENTS (ajouter 10)
- Pâtes (spaghetti, penne, fusilli)
- Pommes de terre (vapeur, purée)
- Quinoa
- Couscous
- Flocons d'avoine
- Pain de seigle
- Brioche
- Gaufres
- Crackers
- Corn flakes

#### PROTÉINES (ajouter 10)
- Œufs
- Thon (boîte)
- Jambon blanc
- Steak haché
- Dinde
- Tofu
- Lentilles
- Pois chiches
- Fromage blanc
- Yaourt grec

#### LÉGUMES (ajouter 15)
- Tomates
- Concombre
- Salade verte
- Brocolis
- Courgettes
- Aubergines
- Poivrons
- Épinards
- Chou-fleur
- Radis
- Champignons
- Betteraves
- Endives
- Fenouil
- Artichauts

#### FRUITS (ajouter 10)
- Pomme
- Poire
- Orange
- Kiwi
- Fraises
- Raisins
- Mangue
- Ananas
- Pêche
- Clémentines

#### EXTRAS (ajouter 5)
- Gâteau
- Glace
- Chips
- Bonbons
- Nutella

---

### 📌 ACTION 3 - Système de conversion quantités (1h)
**Fichier** : Créer `/lib/conversionsAlimentaires.js`

```javascript
const conversions = {
  "CS": { // Cuillère à soupe
    "riz": { grammes: 15, description: "1 CS bombée" },
    "pâtes": { grammes: 10, description: "1 CS bombée" },
    "farine": { grammes: 10, description: "1 CS rase" },
    "huile": { grammes: 12, ml: 15 }
  },
  "piece": {
    "oeuf": { grammes: 60, description: "1 œuf moyen" },
    "pomme": { grammes: 150, description: "1 pomme moyenne" },
    "pain": { grammes: 30, description: "1 tranche" }
  }
};

export function convertirEnGrammes(quantite, unite, aliment) {
  // Logique de conversion
}
```

---

### 📌 ACTION 4 - Détection féculents le soir (1h)
**Fichier** : `/components/RepasBloc.js`
**Action** : Ajouter vérification dans fonction de sauvegarde

```javascript
// Vérifier si préparation jeûne active
const { data: prep } = await supabase
  .from('preparations_jeune')
  .select('date_jeune_prevu')
  .eq('user_id', userId)
  .eq('statut', 'en_cours')
  .single();

if (prep) {
  const jourActuel = calculerJourActuel(prep.date_jeune_prevu);
  
  // Si J-17 ou moins et féculents le soir
  if (jourActuel >= -17 && type === 'Dîner' && categorie === 'féculent') {
    setAlerte({
      type: 'error',
      message: `Tu es à J${jourActuel} : les féculents ne sont plus autorisés le soir.`,
      suggestions: ['Protéines (poulet, poisson)', 'Légumes à volonté', 'Soupe']
    });
    return; // Bloquer la sauvegarde
  }
}
```

---

### 📌 ACTION 5 - Table recettes personnelles (2h)
**Fichier** : Migration Supabase

```sql
CREATE TABLE recettes_user (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  nom VARCHAR(200) NOT NULL,
  description TEXT,
  ingredients JSONB, -- [{ aliment_id, quantite }]
  kcal_total INTEGER,
  portions INTEGER DEFAULT 1,
  categorie_principale VARCHAR(50), -- féculent, protéine, etc.
  temps_preparation INTEGER, -- en minutes
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recettes_user ON recettes_user(user_id);
```

---

## 📋 CHECKLIST COMPLÈTE D'AMÉLIORATION

### Phase 1 - Corrections immédiates (3h)
- [ ] Supprimer doublon référentiel dans RepasBloc.js (30min)
- [ ] Enrichir référentiel à 50 aliments minimum (2h)
- [ ] Ajouter système conversion quantités (1h)

### Phase 2 - Fonctionnalités jeûne (2h)
- [ ] Détection féculents le soir (1h)
- [ ] Alerte repas après 19h (30min)
- [ ] Tracking plage alimentaire 45min (30min)

### Phase 3 - Personnalisation (3h)
- [ ] Table recettes_user (2h)
- [ ] Interface ajout recette perso (1h)

### Phase 4 - UX avancée (2h)
- [ ] Modal alternatives aliments (1h)
- [ ] Suggestions intelligentes selon historique (1h)

**DURÉE TOTALE : ~10h**

---

## 🎯 PRIORISATION SELON VOS PRINCIPES

### ✅ À FAIRE MAINTENANT (ESSENTIEL)
1. **Corriger doublon RepasBloc** (30min)
   - Bloque cohérence données
   - Risque d'erreurs de calcul

2. **Enrichir référentiel** (2h)
   - Limité à 11 aliments = inutilisable au quotidien
   - Impact direct sur UX

### 🟡 À FAIRE APRÈS NIVEAU 1 & 2 (APRÈS TODO ACTUELLES)
3. **Système conversions** (1h)
4. **Détection féculents** (1h)
5. **Recettes perso** (3h)

### 🟢 À FAIRE PLUS TARD (AMÉLIORATIONS)
6. Modal alternatives
7. Suggestions intelligentes
8. Saisonnalité

---

## 📝 NOTES IMPORTANTES

### 💡 RÉFLEXION ARCHITECTURE
Le référentiel actuel est **statique** (fichier JS). Pour permettre à l'utilisateur d'ajouter ses propres aliments, il faudrait :
- **Option A** : Table `aliments_user` en BDD (personnalisé par user)
- **Option B** : Garder référentiel commun + table `aliments_favoris` (user ajoute à ses favoris)
- **Option C** : Hybride : référentiel de base + table `aliments_custom` (user créé les siens)

**Recommandation** : Option C (le plus flexible)

### ⚠️ ATTENTION
Le doublon dans RepasBloc.js cause potentiellement :
- Incohérence calculs calories
- Stats faussées
- Suggestions d'aliments non à jour

**→ À CORRIGER EN PRIORITÉ**

---

## 🔗 FICHIERS CONCERNÉS

```
/data/referentiel.js                    ← RÉFÉRENTIEL PRINCIPAL (11 aliments)
/pages/plan.js                          ← Utilise référentiel (planning)
/components/RepasBloc.js                ← DOUBLON À CORRIGER
/pages/repas.js                         ← Saisie manuelle (pas de référentiel)
/pages/suivi.js                         ← Lecture repas_reels
/pages/historique-notes-repas.js        ← Historique repas
```

**Tables BDD** :
- `repas_reels` (repas consommés)
- `repas_planifies` (repas prévus)
- `fast_food_history` (fast-food)
- `recettes_user` (à créer - recettes perso)
- `aliments_custom` (à créer - aliments perso)

---

**🎯 NEXT ACTION : Corriger doublon RepasBloc.js (30 min)**


Actualisation comprehension referentiel alimentaire
But : Permettre a l utilisateur de suivre facilement la quantité consommé peut importe ou et quand il mange sans avoir a peser ses aliments avec des elements visuel ou simple de reference pour identifer la quantité gracep par ex Cuillere a soupe ou a café ou comptant mentalement la quantité de frite consommé par
Utilité de l app niveau saisie etre capable quand lutilisateut par ex saisie categoris aliment va la retrouver via le referentiel propose la portion de calcul corresoindant ex cS l utilisateur inqique le nombre et le calcul de kcal se fait automatiquement 

L app a une base de donné figé d aliment sur lequel il se basse si aliment existe pas peut demander a utilisateur de l enregistrer et ca le cree et actualise la base de donnée, aussi si similitude peut aussi s adapter on va pas forcement mettre tous les aliments de la terre dans l app ( a voir pour ca pas urgent ) dans l etat se focus sur le patrico pratique 

Aussi a voir comment incorporer mais 
por faciliter utilisateur a manger de facon conscience pour reussir dans l object et l essence de l app il doit avoir une alimenattion consciente pour se faire savoir ce qu il mange ce que c est et comment ca impacte son con corp son esprit ses emotions, comment utilisateur peur prendre connaisance ou conscience des elements renqeigné dans la bdd e rapport avec l impact des alimen consomé ? 
que voici par ex "

Base conscience alimentaire :
Catégorie
Aliment
Bienfait physique
Bienfait spirituel
Effet sur la perte de poids
Effet sur la satiété
À savoir
Fruits
Tomate
Riche en lycopène, un antioxydant qui protège les cellules du stress oxydatif. Des études montrent que le lycopène contribue à la prévention des maladies cardiovasculaires et certains cancers. Source : Harvard Health Publishing, American Journal of Clinical Nutrition (2002).
La tomate incarne l'ouverture du cœur : rouge, ronde, juteuse, elle soutient l’expression affective sincère et l’ancrage dans la joie simple.
Faible en calories et riche en eau ; peut soutenir une perte de poids si consommée sans ajout de matières grasses. Source : Mayo Clinic, Harvard Health.
Effet modéré sur la satiété ; peu de fibres mais bon volume alimentaire.
Contribue à la réduction des inflammations digestives légères ; bonne base pour une alimentation alcaline.
Fruits
Fraise
Excellente source de vitamine C et de manganèse, elle soutient l’immunité et la santé de la peau. Les antioxydants contenus dans la fraise aident à protéger contre les dommages cellulaires. Source : Anses, USDA, Journal of Agricultural and Food Chemistry (2011).
Symbole de douceur et d’innocence, elle réveille la mémoire du plaisir tendre, et aide à se reconnecter à la joie légère et sensorielle.
Très faible en calories, riche en fibres, utile dans les régimes hypocaloriques. Source : Anses, Journal of Nutrition.
Bonne satiété grâce à la combinaison de fibres et d’eau.
Effet sensoriel positif reconnu : odeur et goût stimulent la dopamine ; utile en cas de fatigue mentale ou de baisse de motivation.
Fruits
Pastèque
Très riche en eau (90%), elle favorise l’hydratation cellulaire et l’élimination rénale. Contient de la citrulline, un acide aminé qui peut améliorer la circulation sanguine. Source : Journal of Nutrition (2007), Mayo Clinic.
Symbole de lâcher-prise et de réceptivité, elle invite à la légèreté, à la paix intérieure et à l’écoute du besoin de repos.
Très hydratante et peu calorique ; utile pour remplacer des snacks caloriques. Source : NIH, Anses.
Effet coupe-soif et légère satiété liée au volume d’eau.
Utile en période de forte chaleur ou d’hyperactivité : régule la température corporelle et favorise l’apaisement.
Fruits
Banane
Source de potassium et de vitamine B6, elle soutient la fonction musculaire, la récupération post-effort et le système nerveux. Source : Anses, Sports Medicine (2012).
Nourrissante et enveloppante, elle rappelle la tendresse maternelle. Elle soutient l’ancrage doux et la confiance émotionnelle.
Riche en fibres et en amidon résistant ; modère l’appétit à court terme. Source : British Journal of Nutrition (2014).
Bonne satiété immédiate due à la densité ; effet limité sur la durée.
Effet régulateur sur l’humeur grâce au tryptophane, précurseur de la sérotonine.
Fruits
Pomme
Riche en fibres solubles (pectine), elle favorise la satiété, régule la glycémie et soutient le transit intestinal. Source : European Journal of Clinical Nutrition (2003), Anses.
Fruit de la connaissance et de l'équilibre, elle incarne l’harmonie entre le rationnel et le sensoriel, le quotidien et le sacré.
Faible densité calorique, rassasiante ; bon coupe-faim naturel. Source : USDA, Anses.
Excellente satiété due à la pectine ; effet prolongé.
Stabilise les fringales sucrées ; bon aliment de transition vers une alimentation plus consciente.
Fruits
Raisin
Contient des polyphénols (dont le resvératrol) qui protègent le cœur et ralentissent le vieillissement cellulaire. Source : Journal of Cardiovascular Pharmacology (2006), Inserm.
Fruit du lien au divin dans de nombreuses traditions, il invite à l’abondance, la générosité, et à la transformation intérieure (raisin, jus, vin).
Riche en sucre naturel, peut être modérée dans un régime perte de poids ; à privilégier en petite quantité. Source : Inserm.
Satiété rapide mais peu durable ; effet sucré plus qu’ancrant.
Élève le taux vibratoire émotionnel rapidement ; utile en cas de baisse d’entrain ou de tristesse latente.
Fruits
Mangue
Source de vitamine A (bêta-carotène) et C, elle soutient la vision, la peau et le système immunitaire. Source : Anses, NIH Dietary Supplement Fact Sheets.
Fruit du soleil, elle stimule l’ouverture, la sensualité, le désir de vivre pleinement. Associée au rayonnement personnel.
Assez sucrée, à modérer dans une perte de poids, mais peut remplacer un dessert transformé. Source : Anses.
Satiété modérée, plus sensorielle que physiologique.
Texture douce et rassasiante ; peut apaiser les envies de sucre industriel par une satisfaction naturelle.
Catégorie	Aliment	Bienfait physique	Bienfait spirituel	Effet sur la perte de poids	Effet sur la satiété	À savoir
Fruits	Tomate	Riche en lycopène, un antioxydant qui protège les cellules du stress oxydatif. Des études montrent que le lycopène contribue à la prévention des maladies cardiovasculaires et certains cancers. Source : Harvard Health Publishing, American Journal of Clinical Nutrition (2002).	La tomate incarne l'ouverture du cœur : rouge, ronde, juteuse, elle soutient l’expression affective sincère et l’ancrage dans la joie simple.	Faible en calories et riche en eau ; peut soutenir une perte de poids si consommée sans ajout de matières grasses. Source : Mayo Clinic, Harvard Health.	Effet modéré sur la satiété ; peu de fibres mais bon volume alimentaire.	Contribue à la réduction des inflammations digestives légères ; bonne base pour une alimentation alcaline.
Fruits	Fraise	Excellente source de vitamine C et de manganèse, elle soutient l’immunité et la santé de la peau. Les antioxydants contenus dans la fraise aident à protéger contre les dommages cellulaires. Source : Anses, USDA, Journal of Agricultural and Food Chemistry (2011).	Symbole de douceur et d’innocence, elle réveille la mémoire du plaisir tendre, et aide à se reconnecter à la joie légère et sensorielle.	Très faible en calories, riche en fibres, utile dans les régimes hypocaloriques. Source : Anses, Journal of Nutrition.	Bonne satiété grâce à la combinaison de fibres et d’eau.	Effet sensoriel positif reconnu : odeur et goût stimulent la dopamine ; utile en cas de fatigue mentale ou de baisse de motivation.
Fruits	Pastèque	Très riche en eau (90%), elle favorise l’hydratation cellulaire et l’élimination rénale. Contient de la citrulline, un acide aminé qui peut améliorer la circulation sanguine. Source : Journal of Nutrition (2007), Mayo Clinic.	Symbole de lâcher-prise et de réceptivité, elle invite à la légèreté, à la paix intérieure et à l’écoute du besoin de repos.	Très hydratante et peu calorique ; utile pour remplacer des snacks caloriques. Source : NIH, Anses.	Effet coupe-soif et légère satiété liée au volume d’eau.	Utile en période de forte chaleur ou d’hyperactivité : régule la température corporelle et favorise l’apaisement.
Fruits	Banane	Source de potassium et de vitamine B6, elle soutient la fonction musculaire, la récupération post-effort et le système nerveux. Source : Anses, Sports Medicine (2012).	Nourrissante et enveloppante, elle rappelle la tendresse maternelle. Elle soutient l’ancrage doux et la confiance émotionnelle.	Riche en fibres et en amidon résistant ; modère l’appétit à court terme. Source : British Journal of Nutrition (2014).	Bonne satiété immédiate due à la densité ; effet limité sur la durée.	Effet régulateur sur l’humeur grâce au tryptophane, précurseur de la sérotonine.
Fruits	Pomme	Riche en fibres solubles (pectine), elle favorise la satiété, régule la glycémie et soutient le transit intestinal. Source : European Journal of Clinical Nutrition (2003), Anses.	Fruit de la connaissance et de l'équilibre, elle incarne l’harmonie entre le rationnel et le sensoriel, le quotidien et le sacré.	Faible densité calorique, rassasiante ; bon coupe-faim naturel. Source : USDA, Anses.	Excellente satiété due à la pectine ; effet prolongé.	Stabilise les fringales sucrées ; bon aliment de transition vers une alimentation plus consciente.
Fruits	Raisin	Contient des polyphénols (dont le resvératrol) qui protègent le cœur et ralentissent le vieillissement cellulaire. Source : Journal of Cardiovascular Pharmacology (2006), Inserm.	Fruit du lien au divin dans de nombreuses traditions, il invite à l’abondance, la générosité, et à la transformation intérieure (raisin, jus, vin).	Riche en sucre naturel, peut être modérée dans un régime perte de poids ; à privilégier en petite quantité. Source : Inserm.	Satiété rapide mais peu durable ; effet sucré plus qu’ancrant.	Élève le taux vibratoire émotionnel rapidement ; utile en cas de baisse d’entrain ou de tristesse latente.
Fruits	Mangue	Source de vitamine A (bêta-carotène) et C, elle soutient la vision, la peau et le système immunitaire. Source : Anses, NIH Dietary Supplement Fact Sheets.	Fruit du soleil, elle stimule l’ouverture, la sensualité, le désir de vivre pleinement. Associée au rayonnement personnel.	Assez sucrée, à modérer dans une perte de poids, mais peut remplacer un dessert transformé. Source : Anses.	Satiété modérée, plus sensorielle que physiologique.	Texture douce et rassasiante ; peut apaiser les envies de sucre industriel par une satisfaction naturelle.
Fruits	Dattes	Très riche en glucides naturels, elle redonne rapidement de l’énergie, utile après un effort ou un jeûne. Contient aussi des fibres, du magnésium et du potassium. Source : USDA, Harvard T.H. Chan School of Public Health.	Fruit sacré dans plusieurs traditions, elle soutient l’endurance, la foi, et la force intérieure en période de transition.	Très énergétique, utile ponctuellement après un jeûne mais à consommer modérément. Source : Harvard T.H. Chan, Anses.	Effet rassasiant puissant combiné à un sucre lent naturel ; utile en post-jeûne.	Utile en collation consciente : apporte du sucre naturel sans pic glycémique brutal si associée à des oléagineux.
Fruits	Tomate	Riche en lycopène, un antioxydant qui protège les cellules du stress oxydatif. Des études montrent que le lycopène contribue à la prévention des maladies cardiovasculaires et certains cancers. Source : Harvard Health Publishing, American Journal of Clinical Nutrition (2002).	La tomate incarne l'ouverture du cœur : rouge, ronde, juteuse, elle soutient l’expression affective sincère et l’ancrage dans la joie simple.	Faible en calories et riche en eau ; peut soutenir une perte de poids si consommée sans ajout de matières grasses. Source : Mayo Clinic, Harvard Health.	Effet modéré sur la satiété ; peu de fibres mais bon volume alimentaire.	Contribue à la réduction des inflammations digestives légères ; bonne base pour une alimentation alcaline.
Fruits	Fraise	Excellente source de vitamine C et de manganèse, elle soutient l’immunité et la santé de la peau. Les antioxydants contenus dans la fraise aident à protéger contre les dommages cellulaires. Source : Anses, USDA, Journal of Agricultural and Food Chemistry (2011).	Symbole de douceur et d’innocence, elle réveille la mémoire du plaisir tendre, et aide à se reconnecter à la joie légère et sensorielle.	Très faible en calories, riche en fibres, utile dans les régimes hypocaloriques. Source : Anses, Journal of Nutrition.	Bonne satiété grâce à la combinaison de fibres et d’eau.	Effet sensoriel positif reconnu : odeur et goût stimulent la dopamine ; utile en cas de fatigue mentale ou de baisse de motivation.
Fruits	Pastèque	Très riche en eau (90%), elle favorise l’hydratation cellulaire et l’élimination rénale. Contient de la citrulline, un acide aminé qui peut améliorer la circulation sanguine. Source : Journal of Nutrition (2007), Mayo Clinic.	Symbole de lâcher-prise et de réceptivité, elle invite à la légèreté, à la paix intérieure et à l’écoute du besoin de repos.	Très hydratante et peu calorique ; utile pour remplacer des snacks caloriques. Source : NIH, Anses.	Effet coupe-soif et légère satiété liée au volume d’eau.	Utile en période de forte chaleur ou d’hyperactivité : régule la température corporelle et favorise l’apaisement.
Fruits	Banane	Source de potassium et de vitamine B6, elle soutient la fonction musculaire, la récupération post-effort et le système nerveux. Source : Anses, Sports Medicine (2012).	Nourrissante et enveloppante, elle rappelle la tendresse maternelle. Elle soutient l’ancrage doux et la confiance émotionnelle.	Riche en fibres et en amidon résistant ; modère l’appétit à court terme. Source : British Journal of Nutrition (2014).	Bonne satiété immédiate due à la densité ; effet limité sur la durée.	Effet régulateur sur l’humeur grâce au tryptophane, précurseur de la sérotonine.
Fruits	Pomme	Riche en fibres solubles (pectine), elle favorise la satiété, régule la glycémie et soutient le transit intestinal. Source : European Journal of Clinical Nutrition (2003), Anses.	Fruit de la connaissance et de l'équilibre, elle incarne l’harmonie entre le rationnel et le sensoriel, le quotidien et le sacré.	Faible densité calorique, rassasiante ; bon coupe-faim naturel. Source : USDA, Anses.	Excellente satiété due à la pectine ; effet prolongé.	Stabilise les fringales sucrées ; bon aliment de transition vers une alimentation plus consciente.
Fruits	Raisin	Contient des polyphénols (dont le resvératrol) qui protègent le cœur et ralentissent le vieillissement cellulaire. Source : Journal of Cardiovascular Pharmacology (2006), Inserm.	Fruit du lien au divin dans de nombreuses traditions, il invite à l’abondance, la générosité, et à la transformation intérieure (raisin, jus, vin).	Riche en sucre naturel, peut être modérée dans un régime perte de poids ; à privilégier en petite quantité. Source : Inserm.	Satiété rapide mais peu durable ; effet sucré plus qu’ancrant.	Élève le taux vibratoire émotionnel rapidement ; utile en cas de baisse d’entrain ou de tristesse latente.
Fruits	Mangue	Source de vitamine A (bêta-carotène) et C, elle soutient la vision, la peau et le système immunitaire. Source : Anses, NIH Dietary Supplement Fact Sheets.	Fruit du soleil, elle stimule l’ouverture, la sensualité, le désir de vivre pleinement. Associée au rayonnement personnel.	Assez sucrée, à modérer dans une perte de poids, mais peut remplacer un dessert transformé. Source : Anses.	Satiété modérée, plus sensorielle que physiologique.	Texture douce et rassasiante ; peut apaiser les envies de sucre industriel par une satisfaction naturelle.
Fruits	Dattes	Très riche en glucides naturels, elle redonne rapidement de l’énergie, utile après un effort ou un jeûne. Contient aussi des fibres, du magnésium et du potassium. Source : USDA, Harvard T.H. Chan School of Public Health.	Fruit sacré dans plusieurs traditions, elle soutient l’endurance, la foi, et la force intérieure en période de transition.	Très énergétique, utile ponctuellement après un jeûne mais à consommer modérément. Source : Harvard T.H. Chan, Anses.	Effet rassasiant puissant combiné à un sucre lent naturel ; utile en post-jeûne.	Utile en collation consciente : apporte du sucre naturel sans pic glycémique brutal si associée à des oléagineux.
Féculents	Riz blanc	Source d’énergie rapide, riche en glucides simples. Utile en récupération post-effort ou en période de digestion sensible. Source : Anses, FAO, USDA.	Aliment universel et neutre, symbole de paix et d’unité. Il incarne la simplicité nourrissante et la gratitude.	Index glycémique élevé ; peu favorable seul à la perte de poids mais peut être inclus en petite portion avec fibres et protéines. Source : Harvard Health.	Satiété faible à modérée, surtout s’il est consommé seul. Recommandé avec légumes ou protéines pour renforcer l’effet rassasiant.	Privilégier le riz basmati ou étuvé pour un meilleur profil glycémique. Le riz blanc pur peut entraîner un pic de glycémie.
Féculents	Riz complet	Riche en fibres, magnésium et antioxydants. Améliore la digestion, régule la glycémie et soutient la santé cardiovasculaire. Source : USDA, Journal of Nutrition (2008).	Aliment d’ancrage, il incarne la connexion à la terre et la constance intérieure.	Favorise la perte de poids par effet de satiété élevé et réponse glycémique modérée. Source : Harvard T.H. Chan School of Public Health.	Satiété élevée grâce aux fibres insolubles ; ralentit la digestion, évite les fringales.	Plus dense à cuire et à mâcher ; à bien mastiquer pour éviter les lourdeurs digestives.
Féculents	Pâtes blanches	Bonne source d’énergie, mais pauvre en fibres. Adaptée aux besoins rapides ou aux repas pré-entraînement. Source : Anses, Italian Journal of Food Science.	Symbole de convivialité, de plaisir collectif et d’instantanéité. Elle relie à la joie simple du partage.	Peu recommandée en excès ; IG modéré à élevé. À consommer en portion contrôlée avec légumes. Source : American Journal of Clinical Nutrition.	Satiété moyenne ; meilleure si cuite al dente et associée à un accompagnement riche en fibres.	La cuisson 'al dente' abaisse son index glycémique et améliore la gestion de l’appétit.
Féculents	Pâtes complètes	Apport en fibres, vitamines B et minéraux. Réduit le risque de pics glycémiques et soutient la santé digestive. Source : USDA, Anses.	Évoque la progression structurée et la transformation. Nourrit avec plus de profondeur que sa version blanche.	Plus favorable à la perte de poids que les pâtes blanches grâce à sa charge glycémique réduite.	Bonne satiété durable. Moins de fringales post-repas grâce à sa lente digestion.	Peut être moins digeste pour les intestins sensibles. Introduire progressivement.
Féculents	Quinoa	Riche en protéines complètes, fer, magnésium et fibres. Soutient la musculature et l’équilibre glycémique. Source : FAO, Harvard Health.	Aliment sacré chez les peuples andins, symbole d’équilibre, de résilience et d’adaptabilité intérieure.	Favorise la perte de poids par sa richesse en fibres et protéines, avec un effet coupe-faim naturel.	Excellente satiété. Favorise la régulation des repas sans sensation de lourdeur.	Bien le rincer avant cuisson pour retirer les saponines (goût amer).
Féculents	Boulgour	Bonne source de fibres et de vitamines B. Soutient la régulation du transit et stabilise la glycémie. Source : USDA, Nutrition Reviews.	Simple et terrien, il évoque le rythme lent et régulier, propice à la concentration et à l’ancrage.	Convient à un objectif de perte de poids par effet rassasiant et digestion lente.	Satiété stable, bon effet de volume une fois réhydraté.	Peut être utilisé en taboulé ou en base chaude, peu calorique par cuillère.
Féculents	Couscous (semoule)	Apport en glucides complexes, facile à digérer, idéal pour les repas simples. Source : Anses, Table Ciqual.	Aliment de tradition, il évoque la générosité, l’accueil et l’identité culturelle.	Indice glycémique modéré à surveiller ; intéressant en portion réduite avec légumes.	Satiété correcte si combiné à des légumes ou légumineuses.	Préférer la semoule complète ou semi-complète pour optimiser les apports.
Féculents	Polenta	Riche en glucides digestes et pauvre en matières grasses. Bonne alternative sans gluten. Source : USDA, Celiac Disease Foundation.	Aliment doux et lisse, associé à la chaleur familiale et à la simplicité nourrissante.	Peut être intégré à un régime minceur en portion contrôlée, surtout si cuite sans beurre ni fromage.	Satiété modérée à brève ; nécessite un accompagnement pour éviter les fringales.	Peut être grillée, poêlée ou servie en purée ; très digeste.
Féculents	Flocons d’avoine	Excellente source de bêta-glucanes : baisse le cholestérol et régule la glycémie. Favorise la santé cardiovasculaire. Source : EFSA, Journal of Nutrition (2010).	Représente la constance, l’autodiscipline bienveillante, le soutien intérieur stable.	Favorise la perte de poids en réduisant l’appétit et les pics glycémiques. Très rassasiant. Source : Journal of the American College of Nutrition (2015).	Très haute satiété, longue durée ; stabilise l'énergie sur plusieurs heures.	Peut être utilisé en porridge, en muesli ou en pancakes maison.
Féculents	Attiéké	Issu du manioc fermenté, source d’énergie rapide mais pauvre en fibres. Apport de glucides intéressants pour l’effort. Source : FAO, Programme Alimentaire Africain.	Aliment identitaire et de mémoire, il symbolise les racines profondes et la transmission culturelle.	Peu recommandé en excès car très riche en glucides à digestion rapide ; à modérer. Source : African Journal of Food Science (2018).	Satiété faible à moyenne ; meilleure s’il est accompagné de fibres ou de protéines.	Peut être une bonne base si intégré dans un repas structuré avec légumes et poisson.
Légumineuses	Lentilles	Riche en fibres, en fer et en protéines végétales. Favorise la satiété, régule la glycémie et soutient l’énergie sans pic. Source : Anses, British Journal of Nutrition.	Aliment de constance et de profondeur, symbole de résilience et de force humble.	Très favorable grâce à sa charge glycémique faible et son pouvoir rassasiant. Source : European Journal of Clinical Nutrition (2009).	Satiété longue durée, ralentit la digestion et évite les fringales.	Peut être combinée avec du riz ou des légumes pour un plat végétarien équilibré.
Légumineuses	Haricots rouges	Excellente source de protéines, de fer, de potassium et de fibres. Aide à la gestion du cholestérol. Source : USDA, Anses.	Rappelle la force collective, l’énergie du groupe, la base nourricière d’un peuple.	Favorise la satiété ; recommandé en remplacement des féculents classiques. Source : Harvard Health.	Très rassasiant ; permet de tenir plusieurs heures sans fringale.	Bien cuire et rincer pour éviter les troubles digestifs.
Protéines	Steak de bœuf	Riche en protéines complètes et en fer héminique. Soutient la masse musculaire et lutte contre l’anémie. Source : Anses, NIH.	Évoque la puissance, l’instinct de vie et la solidité brute. À consommer avec conscience.	Favorise la satiété, recommandé en portion modérée dans les régimes protéinés.	Très rassasiant, digestion lente ; limite naturellement les prises alimentaires excessives.	À privilégier maigre (5% MG), grillé ou poêlé sans sauce pour un bon apport sans excès gras.
Protéines	Œuf dur	Source de protéines complètes, de choline et de vitamine D. Bénéfique pour le cerveau et les muscles. Source : Anses, Journal of Nutrition (2006).	Symbole de renouveau, d'équilibre et de potentiel latent. Favorise l’ancrage calme.	Très efficace pour couper l’appétit ; aide à éviter les grignotages. Source : International Journal of Obesity.	Excellente satiété en collation ou en repas léger, effet durable.	Un œuf apporte environ 80 kcal et peut se consommer en entrée ou collation post-jeûne.
Légumes	Gombo	Riche en mucilage, fibres solubles, magnésium et vitamine C. Favorise le transit et calme les inflammations digestives. Source : African Journal of Food Science.	Évoque la fluidité intérieure, l’adaptabilité face aux émotions denses.	Très faible en calories ; favorise la satiété par sa texture visqueuse.	Bonne satiété douce, intéressante en accompagnement de protéines maigres.	Parfait en soupe, sauté ou avec poisson. Peut stabiliser le microbiote.
Extras	Beignets africains (Mikate)	Riche en glucides simples et en lipides, apporte de l’énergie rapide mais peu de nutriments. Source : Tables alimentaires Afrique de l’Ouest, CIQUAL.	Aliment festif, chaleureux, associé à la mémoire collective et à la convivialité.	Non recommandé dans un objectif de perte de poids en raison de sa densité calorique élevée.	Satiété courte ; pousse facilement à la surconsommation par son goût sucré et gras.	À réserver à des occasions spéciales ou à intégrer dans un équilibre global avec légumes et protéines.
Gras végétal	Huile de palme rouge	Source de vitamine E et A, bonne pour la vision et la peau ; à consommer non raffinée. Source : FAO, African Journal of Biomedical Research.	Symbole de force tribale, de chaleur, et de lien aux racines.	Très calorique ; à utiliser avec parcimonie. Peut ralentir la perte de poids en excès.	Effet satiété important mais dense ; doit être dosée avec mesure.	À préférer rouge non raffinée et crue, pour préserver les antioxydants naturels.
Fruits	Tomate	Riche en lycopène, un antioxydant qui protège les cellules du stress oxydatif. Des études montrent que le lycopène contribue à la prévention des maladies cardiovasculaires et certains cancers. Source : Harvard Health Publishing, American Journal of Clinical Nutrition (2002).	La tomate incarne l'ouverture du cœur : rouge, ronde, juteuse, elle soutient l’expression affective sincère et l’ancrage dans la joie simple.	Contribue à la réduction des inflammations digestives légères ; bonne base pour une alimentation alcaline.		
Fruits	Fraise	Excellente source de vitamine C et de manganèse, elle soutient l’immunité et la santé de la peau. Les antioxydants contenus dans la fraise aident à protéger contre les dommages cellulaires. Source : Anses, USDA, Journal of Agricultural and Food Chemistry (2011).	Symbole de douceur et d’innocence, elle réveille la mémoire du plaisir tendre, et aide à se reconnecter à la joie légère et sensorielle.	Effet sensoriel positif reconnu : odeur et goût stimulent la dopamine ; utile en cas de fatigue mentale ou de baisse de motivation.		
Fruits	Pastèque	Très riche en eau (90%), elle favorise l’hydratation cellulaire et l’élimination rénale. Contient de la citrulline, un acide aminé qui peut améliorer la circulation sanguine. Source : Journal of Nutrition (2007), Mayo Clinic.	Symbole de lâcher-prise et de réceptivité, elle invite à la légèreté, à la paix intérieure et à l’écoute du besoin de repos.	Utile en période de forte chaleur ou d’hyperactivité : régule la température corporelle et favorise l’apaisement.		
Fruits	Banane	Source de potassium et de vitamine B6, elle soutient la fonction musculaire, la récupération post-effort et le système nerveux. Source : Anses, Sports Medicine (2012).	Nourrissante et enveloppante, elle rappelle la tendresse maternelle. Elle soutient l’ancrage doux et la confiance émotionnelle.	Effet régulateur sur l’humeur grâce au tryptophane, précurseur de la sérotonine.		
Fruits	Pomme	Riche en fibres solubles (pectine), elle favorise la satiété, régule la glycémie et soutient le transit intestinal. Source : European Journal of Clinical Nutrition (2003), Anses.	Fruit de la connaissance et de l'équilibre, elle incarne l’harmonie entre le rationnel et le sensoriel, le quotidien et le sacré.	Stabilise les fringales sucrées ; bon aliment de transition vers une alimentation plus consciente.		
Fruits	Raisin	Contient des polyphénols (dont le resvératrol) qui protègent le cœur et ralentissent le vieillissement cellulaire. Source : Journal of Cardiovascular Pharmacology (2006), Inserm.	Fruit du lien au divin dans de nombreuses traditions, il invite à l’abondance, la générosité, et à la transformation intérieure (raisin, jus, vin).	Élève le taux vibratoire émotionnel rapidement ; utile en cas de baisse d’entrain ou de tristesse latente.		
Fruits	Mangue	Source de vitamine A (bêta-carotène) et C, elle soutient la vision, la peau et le système immunitaire. Source : Anses, NIH Dietary Supplement Fact Sheets.	Fruit du soleil, elle stimule l’ouverture, la sensualité, le désir de vivre pleinement. Associée au rayonnement personnel.	Texture douce et rassasiante ; peut apaiser les envies de sucre industriel par une satisfaction naturelle.		
Fruits	Dattes	Très riche en glucides naturels, elle redonne rapidement de l’énergie, utile après un effort ou un jeûne. Contient aussi des fibres, du magnésium et du potassium. Source : USDA, Harvard T.H. Chan School of Public Health.	Fruit sacré dans plusieurs traditions, elle soutient l’endurance, la foi, et la force intérieure en période de transition.	Utile en collation consciente : apporte du sucre naturel sans pic glycémique brutal si associée à des oléagineux.		
Féculents	Riz blanc	Source d’énergie rapide, riche en glucides simples. Utile en récupération post-effort ou en période de digestion sensible. Source : Anses, FAO, USDA.	Aliment universel et neutre, symbole de paix et d’unité. Il incarne la simplicité nourrissante et la gratitude.	Index glycémique élevé ; peu favorable seul à la perte de poids mais peut être inclus en petite portion avec fibres et protéines. Source : Harvard Health.	Satiété faible à modérée, surtout s’il est consommé seul. Recommandé avec légumes ou protéines pour renforcer l’effet rassasiant.	Privilégier le riz basmati ou étuvé pour un meilleur profil glycémique. Le riz blanc pur peut entraîner un pic de glycémie.
Féculents	Riz complet	Riche en fibres, magnésium et antioxydants. Améliore la digestion, régule la glycémie et soutient la santé cardiovasculaire. Source : USDA, Journal of Nutrition (2008).	Aliment d’ancrage, il incarne la connexion à la terre et la constance intérieure.	Favorise la perte de poids par effet de satiété élevé et réponse glycémique modérée. Source : Harvard T.H. Chan School of Public Health.	Satiété élevée grâce aux fibres insolubles ; ralentit la digestion, évite les fringales.	Plus dense à cuire et à mâcher ; à bien mastiquer pour éviter les lourdeurs digestives.
Féculents	Pâtes blanches	Bonne source d’énergie, mais pauvre en fibres. Adaptée aux besoins rapides ou aux repas pré-entraînement. Source : Anses, Italian Journal of Food Science.	Symbole de convivialité, de plaisir collectif et d’instantanéité. Elle relie à la joie simple du partage.	Peu recommandée en excès ; IG modéré à élevé. À consommer en portion contrôlée avec légumes. Source : American Journal of Clinical Nutrition.	Satiété moyenne ; meilleure si cuite al dente et associée à un accompagnement riche en fibres.	La cuisson 'al dente' abaisse son index glycémique et améliore la gestion de l’appétit.
Féculents	Pâtes complètes	Apport en fibres, vitamines B et minéraux. Réduit le risque de pics glycémiques et soutient la santé digestive. Source : USDA, Anses.	Évoque la progression structurée et la transformation. Nourrit avec plus de profondeur que sa version blanche.	Plus favorable à la perte de poids que les pâtes blanches grâce à sa charge glycémique réduite.	Bonne satiété durable. Moins de fringales post-repas grâce à sa lente digestion.	Peut être moins digeste pour les intestins sensibles. Introduire progressivement.
Féculents	Quinoa	Riche en protéines complètes, fer, magnésium et fibres. Soutient la musculature et l’équilibre glycémique. Source : FAO, Harvard Health.	Aliment sacré chez les peuples andins, symbole d’équilibre, de résilience et d’adaptabilité intérieure.	Favorise la perte de poids par sa richesse en fibres et protéines, avec un effet coupe-faim naturel.	Excellente satiété. Favorise la régulation des repas sans sensation de lourdeur.	Bien le rincer avant cuisson pour retirer les saponines (goût amer).
Féculents	Boulgour	Bonne source de fibres et de vitamines B. Soutient la régulation du transit et stabilise la glycémie. Source : USDA, Nutrition Reviews.	Simple et terrien, il évoque le rythme lent et régulier, propice à la concentration et à l’ancrage.	Convient à un objectif de perte de poids par effet rassasiant et digestion lente.	Satiété stable, bon effet de volume une fois réhydraté.	Peut être utilisé en taboulé ou en base chaude, peu calorique par cuillère.
Féculents	Couscous (semoule)	Apport en glucides complexes, facile à digérer, idéal pour les repas simples. Source : Anses, Table Ciqual.	Aliment de tradition, il évoque la générosité, l’accueil et l’identité culturelle.	Indice glycémique modéré à surveiller ; intéressant en portion réduite avec légumes.	Satiété correcte si combiné à des légumes ou légumineuses.	Préférer la semoule complète ou semi-complète pour optimiser les apports.
Féculents	Polenta	Riche en glucides digestes et pauvre en matières grasses. Bonne alternative sans gluten. Source : USDA, Celiac Disease Foundation.	Aliment doux et lisse, associé à la chaleur familiale et à la simplicité nourrissante.	Peut être intégré à un régime minceur en portion contrôlée, surtout si cuite sans beurre ni fromage.	Satiété modérée à brève ; nécessite un accompagnement pour éviter les fringales.	Peut être grillée, poêlée ou servie en purée ; très digeste.
Féculents	Flocons d’avoine	Excellente source de bêta-glucanes : baisse le cholestérol et régule la glycémie. Favorise la santé cardiovasculaire. Source : EFSA, Journal of Nutrition (2010).	Représente la constance, l’autodiscipline bienveillante, le soutien intérieur stable.	Favorise la perte de poids en réduisant l’appétit et les pics glycémiques. Très rassasiant. Source : Journal of the American College of Nutrition (2015).	Très haute satiété, longue durée ; stabilise l'énergie sur plusieurs heures.	Peut être utilisé en porridge, en muesli ou en pancakes maison.
Féculents	Attiéké	Issu du manioc fermenté, source d’énergie rapide mais pauvre en fibres. Apport de glucides intéressants pour l’effort. Source : FAO, Programme Alimentaire Africain.	Aliment identitaire et de mémoire, il symbolise les racines profondes et la transmission culturelle.	Peu recommandé en excès car très riche en glucides à digestion rapide ; à modérer. Source : African Journal of Food Science (2018).	Satiété faible à moyenne ; meilleure s’il est accompagné de fibres ou de protéines.	Peut être une bonne base si intégré dans un repas structuré avec légumes et poisson.
"

en rapport avec cette basse de conscience alimentaire detaillé comment JE ME DEMANDE:
1 si il ya des doublons des donnes manquante, si ca repond bien a l objectif annonce et si ca aide bien l utilisateu niveau experience utilisateur et aide a accomplissement de on objevti
2 comemnt utiliser ca dans la reprise alimentaire *

(aussi en renseigant son etat selon ce qu il a consommé il peut avoir une section ce que ces aliments on genere chez moi, " a voir plus tard comment adapter ou crée ce n est pas urgent on se base pour l instant sur le pratico pratique )

Aussi ça pourrait aider pour la reprise alimentaire apres jeûne ( a voir plus tard comment faire le lien en rapport aux aliments favorible a consommer apres jeûne qui maintienne l effet de la cetose et du flow spirituelle)

═══════════════════════════════════════════════════════════════════════════════
📋 RÉPONSES AUX QUESTIONS (lignes 632-638)
═══════════════════════════════════════════════════════════════════════════════
Date de réponse : 15 novembre 2025
Basé sur : ANALYSE_ECART, CLARIFICATION_ARCHITECTURE, Base de travail reprise

───────────────────────────────────────────────────────────────────────────────
🔍 QUESTION 1 : DOUBLONS, DONNÉES MANQUANTES, COHÉRENCE OBJECTIF, UX
───────────────────────────────────────────────────────────────────────────────

✅ ANALYSE DE LA BASE CONSCIENCE ALIMENTAIRE (lignes 522-630)

**🔴 DOUBLONS DÉTECTÉS** :

Oui, il y a des doublons dans la base :
- **Tomate** : Apparaît 3 fois (lignes 540, 558, 578)
- **Fraise** : Apparaît 3 fois (lignes 542, 560, 580)
- **Pastèque** : Apparaît 3 fois (lignes 544, 562, 582)
- **Banane** : Apparaît 3 fois (lignes 546, 564, 584)
- **Pomme** : Apparaît 3 fois (lignes 548, 566, 586)
- **Raisin** : Apparaît 3 fois (lignes 550, 568, 588)
- **Mangue** : Apparaît 3 fois (lignes 552, 570, 590)
- **Dattes** : Apparaît 2 fois (lignes 556, 574, 592)

➡️ **ACTION REQUISE** : Supprimer les doublons et garder une seule instance par aliment

**🟡 DONNÉES MANQUANTES** :

Pour atteindre l'objectif de conscience alimentaire complète, il manque :

1. **Légumes** : Seulement Tomate présente
   - Manquent : Brocoli, Courgette, Épinard, Carotte, Poivron (dans référentiel principal)

2. **Protéines** : Aucune protéine dans la base conscience
   - Manquent : Poulet, Poisson, Œuf, Légumineuses (lentilles, pois chiches)

3. **Féculents** : Présents dans lignes 620-630 MAIS pas dans section conscience alimentaire
   - Riz blanc/complet, Pâtes, Quinoa, etc. ont les colonnes MAIS pas dans section dédiée

4. **Gras végétaux** : Aucun
   - Manquent : Avocat, Huile d'olive, Noix, Amandes

5. **Légumineuses** : Aucune
   - Manquent : Lentilles, Pois chiches, Haricots rouges

➡️ **ACTION REQUISE** : Compléter avec 15-20 aliments supplémentaires pour couvrir toutes les catégories

**✅ COHÉRENCE AVEC OBJECTIF ANNONCÉ** :

Objectif Phase 3 (doc REFERENTIEL ligne 2437) :
> "Conscience alimentaire : Afficher bienfaits physiques/spirituels/effet perte de poids/satiété"

La structure actuelle RÉPOND BIEN à l'objectif :
- ✅ Colonne "Bienfait physique" : Oui (avec sources scientifiques)
- ✅ Colonne "Bienfait spirituel" : Oui (dimension symbolique/émotionnelle)
- ✅ Colonne "Effet sur la perte de poids" : Oui
- ✅ Colonne "Effet sur la satiété" : Oui
- ✅ Colonne "À savoir" : Oui (conseils pratiques)

**Structure optimale confirmée** ✅

**🎯 EXPÉRIENCE UTILISATEUR** :

**Points positifs** :
1. ✅ **Dimension holistique** : Physique + spirituel + pratique
   - Exemple : "La tomate incarne l'ouverture du cœur" → Crée du sens au-delà de la nutrition
2. ✅ **Sources scientifiques** : Harvard Health, Anses, USDA → Crédibilité
3. ✅ **Conseils pratiques** : "À savoir" donne des astuces concrètes
4. ✅ **Alignement objectif perte de poids** : Aide l'utilisateur à choisir consciemment

**Points à améliorer** :
1. ❌ **Trop de texte** : Risque de surcharge cognitive
   - Solution : Affichage progressif (déplier sections comme prévu dans mock ligne 2595)
2. ❌ **Manque de visuel** : Pas d'emoji ou icône pour distinguer rapidement
   - Solution : Ajouter 🧠 Physique, ✨ Spirituel, 📉 Perte poids, 🍽️ Satiété
3. ❌ **Pas de lien avec QN score** : Le QN (Qualité Nutritionnelle) n'est pas mentionné
   - Solution : Afficher QN à côté du nom aliment (ex: Pomme - QN 5/5)

**💡 PROPOSITION UX OPTIMALE** :

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Aliment saisi : Pomme (QN 5/5) ✅                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ 🌟 Conscience alimentaire                                               │
│                                                                          │
│ ▼ 🧠 Bienfait physique                                                  │
│   Riche en fibres solubles (pectine), elle favorise la satiété,        │
│   régule la glycémie et soutient le transit intestinal.                 │
│   Source : European Journal of Clinical Nutrition (2003), Anses.       │
│                                                                          │
│ ▼ ✨ Bienfait spirituel                                                 │
│   Fruit de la connaissance et de l'équilibre, elle incarne             │
│   l'harmonie entre le rationnel et le sensoriel.                        │
│                                                                          │
│ ▼ 📉 Effet perte de poids                                               │
│   Faible densité calorique, rassasiante ; bon coupe-faim naturel.      │
│   Source : USDA, Anses.                                                 │
│                                                                          │
│ ▼ 🍽️ Effet satiété                                                     │
│   Excellente satiété due à la pectine ; effet prolongé.                │
│                                                                          │
│ 💡 À savoir                                                             │
│   Stabilise les fringales sucrées ; bon aliment de transition vers     │
│   une alimentation plus consciente.                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

➡️ **CONCLUSION Q1** : Structure excellente, mais nécessite :
1. Suppression des doublons
2. Ajout de 15-20 aliments manquants (légumes, protéines, gras)
3. Optimisation affichage avec emojis et déploiement progressif

───────────────────────────────────────────────────────────────────────────────
🔍 QUESTION 2 : COMMENT UTILISER ÇA DANS LA REPRISE ALIMENTAIRE ?
───────────────────────────────────────────────────────────────────────────────

✅ INTÉGRATION CONSCIENCE ALIMENTAIRE DANS REPRISE POST-JEÛNE

**🎯 CONTEXTE** (selon doc "Base de travail reprise apres jeune") :
- Reprise = phase critique après jeûne
- Durée proportionnelle : 2× durée jeûne
- Aliments autorisés par phase (Phase 1-4)
- Objectif : Ancrer les bienfaits du jeûne + muscler la volonté

**💡 UTILISATION CONCRÈTE** :

**1️⃣ AFFICHAGE RENFORCÉ EN PHASE DE REPRISE**

Quand l'utilisateur est en reprise (statut `reprise_en_cours` dans Supabase),
afficher la conscience alimentaire de façon **AMPLIFIÉE** :

```javascript
// Dans /components/SaisieRepriseJeune.js
function afficherConscienceAlimentaire(aliment, phaseReprise) {
  const conscience = getConscienceFromDB(aliment);
  
  return (
    <div className="conscience-reprise">
      <h4>🌟 Pourquoi tu manges {aliment} aujourd'hui</h4>
      
      {/* Bienfait PHYSIQUE adapté à la reprise */}
      <div className="bienfait-physique">
        <h5>🧠 Ce que ça fait à ton corps (en reprise)</h5>
        <p>{conscience.bienfait_physique}</p>
        <p className="contexte-reprise">
          ➡️ En ce moment, ton système digestif se réveille. Cet aliment est
          choisi pour sa douceur et sa facilité d'assimilation.
        </p>
      </div>
      
      {/* Bienfait SPIRITUEL renforcé */}
      <div className="bienfait-spirituel">
        <h5>✨ Ce que ça nourrit en toi (au-delà du corps)</h5>
        <p>{conscience.bienfait_spirituel}</p>
        <p className="contexte-reprise">
          ➡️ Tu ne manges pas par automatisme. Tu honores ton engagement.
          Chaque aliment conscient renforce ta volonté.
        </p>
      </div>
      
      {/* Lien avec MAINTIEN CÉTOSE */}
      <div className="lien-cetose">
        <h5>🔥 Effet sur la cétose</h5>
        {aliment.favorise_cetose ? (
          <p>✅ Cet aliment MAINTIENT la cétose. Il ne casse pas les bénéfices
          de ton jeûne. Ton corps continue à brûler les graisses.</p>
        ) : (
          <p>⚠️ Cet aliment RALENTIT la cétose. C'est normal à ce stade de 
          reprise. Tu réintroduis progressivement les glucides.</p>
        )}
      </div>
    </div>
  );
}
```

**2️⃣ FILTRAGE PAR PHASE DE REPRISE**

Afficher UNIQUEMENT les aliments de conscience pertinents pour la phase actuelle :

```javascript
// Phase 1 (J1-J2) : Liquides uniquement
const alimentsPhase1Conscience = [
  "Bouillon de légumes", // Pas dans base actuelle → À AJOUTER
  "Jus de carotte",      // Pas dans base actuelle → À AJOUTER
];

// Phase 2 (J3-J4) : Légumes cuits
const alimentsPhase2Conscience = [
  "Courgette vapeur",    // Pas dans base actuelle → À AJOUTER
  "Carotte vapeur",      // Pas dans base actuelle → À AJOUTER
  "Tomate",              // ✅ Présent dans base
];

// Phase 3 (J5-J6) : Protéines + graisses
const alimentsPhase3Conscience = [
  "Œuf dur",             // Pas dans base actuelle → À AJOUTER
  "Avocat",              // Pas dans base actuelle → À AJOUTER
];

// Phase 4 (J7-J8) : Féculents doux
const alimentsPhase4Conscience = [
  "Riz complet",         // ✅ Présent lignes 620-630
  "Pomme",               // ✅ Présent dans base
  "Fraise",              // ✅ Présent dans base
];
```

**3️⃣ MESSAGE ADAPTÉ AU CONTEXTE REPRISE**

Modifier les textes de conscience pour le contexte post-jeûne :

| Contexte normal | Contexte reprise post-jeûne |
|-----------------|----------------------------|
| "La tomate incarne l'ouverture du cœur" | "En reprise, la tomate réveille ton système digestif avec douceur. Elle hydrate, apaise, et ne choque pas ton estomac." |
| "Riche en fibres solubles..." | "Après X jours de jeûne, les fibres de la pomme relancent ton transit sans brutalité. Ton corps reconnaît cette nourriture douce." |

**4️⃣ SECTION "CE QUE CES ALIMENTS ONT GÉNÉRÉ CHEZ MOI"** (à développer plus tard)

Comme mentionné dans la question, permettre à l'utilisateur de noter l'impact ressenti :

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📝 Jour 3 de reprise : Tu as mangé Courgette vapeur                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ 💬 Ce que j'ai ressenti après ce repas :                               │
│                                                                          │
│ [ ] Légèreté digestive                                                  │
│ [ ] Satiété douce                                                       │
│ [ ] Énergie stable                                                      │
│ [ ] Clarté mentale maintenue                                            │
│ [ ] Sensation de maîtrise/fierté                                        │
│ [ ] Lourdeur / inconfort (si oui, noter pourquoi)                      │
│                                                                          │
│ ✍️ Note personnelle (optionnel) :                                      │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ "J'ai ressenti une vraie reconnexion à mon corps. Ce repas     │   │
│ │ était doux, respectueux. Je tiens parole."                      │   │
│ └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

Stockage dans Supabase :
```sql
CREATE TABLE ressenti_aliments_reprise (
  id UUID PRIMARY KEY,
  reprise_id UUID REFERENCES reprises_alimentaires(id),
  jour_numero INTEGER,
  aliment VARCHAR(100),
  legerte_digestive BOOLEAN,
  satiete_douce BOOLEAN,
  energie_stable BOOLEAN,
  clarte_mentale BOOLEAN,
  fierte BOOLEAN,
  inconfort BOOLEAN,
  note_perso TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

➡️ **CONCLUSION Q2** : Intégration en 4 niveaux :
1. Affichage renforcé avec contexte reprise
2. Filtrage par phase (aliments pertinents uniquement)
3. Messages adaptés au contexte post-jeûne
4. Tracking du ressenti (feature future)

───────────────────────────────────────────────────────────────────────────────
🔍 QUESTION 3 : BDD CÉTOSE - COMMENT UTILISER ?
───────────────────────────────────────────────────────────────────────────────

✅ UTILISATION DE LA BDD ALIMENTS FAVORISANT LA CÉTOSE (lignes 640-730)

**🎯 OBJECTIF** : Maintenir l'effet cétose + flow spirituel pendant la reprise

**📊 STRUCTURE ACTUELLE DE LA BDD CÉTOSE** :

Colonnes présentes (lignes 640-645) :
1. Catégorie (Gras sains, Protéines maigres, Légumes pauvres glucides, etc.)
2. Aliment (Avocat, Œuf entier, Brocoli vapeur, etc.)
3. Favorise l'acétose ? (Oui / Non / Partiellement)
4. Pourquoi (source scientifique)
5. Effet métabolique
6. Reprise tolérée à partir de (J+1, J+7, J+10, etc.)

**💡 UTILISATION CONCRÈTE** :

**1️⃣ CROISEMENT BDD CÉTOSE × PHASE REPRISE**

Utiliser la colonne "Reprise tolérée à partir de" pour filtrer automatiquement :

```javascript
// Dans /data/alimentsRepriseJeune.js
const alimentsRepriseJeune = {
  phase_1: alimentsCetose.filter(a => a.repriseTolerée === "J+1" && a.favoriseCetose === "Oui"),
  // Résultat : Avocat, Œuf entier, Brocoli vapeur, Amandes
  
  phase_2: alimentsCetose.filter(a => a.repriseTolerée <= "J+4"),
  // Résultat : Phase 1 + Courgette, Poisson blanc
  
  phase_3: alimentsCetose.filter(a => a.repriseTolerée <= "J+7"),
  // Résultat : Phase 1-2 + Lentilles (partiellement)
  
  phase_4: alimentsCetose.filter(a => a.repriseTolerée <= "J+15"),
  // Résultat : Toutes phases + Féculents doux progressifs
};
```

**2️⃣ INDICATEUR VISUEL CÉTOSE DANS L'INTERFACE**

Afficher un badge indiquant si l'aliment maintient la cétose :

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🥑 Avocat                                    [🔥 MAINTIENT LA CÉTOSE]   │
├─────────────────────────────────────────────────────────────────────────┤
│ Portion : 1/2 avocat (160 kcal)                                         │
│                                                                          │
│ 🔥 Effet cétose :                                                       │
│ ✅ Favorise l'acétose : OUI                                             │
│ Pourquoi : Riche en acides gras mono-insaturés, pauvre en glucides     │
│ → Ne stimule pas l'insuline                                             │
│ Source : Harvard T.H. Chan School of Public Health                      │
│                                                                          │
│ 💡 En reprise :                                                         │
│ Cet aliment te permet de PROLONGER les bénéfices de ton jeûne.         │
│ Ton corps continue à brûler les graisses au lieu de revenir            │
│ immédiatement au mode "sucre".                                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

VS

┌─────────────────────────────────────────────────────────────────────────┐
│ 🍞 Pain blanc                                [❌ CASSE LA CÉTOSE]       │
├─────────────────────────────────────────────────────────────────────────┤
│ ⚠️ ALIMENT NON AUTORISÉ ACTUELLEMENT (Phase 1-3)                       │
│                                                                          │
│ 🔥 Effet cétose :                                                       │
│ ❌ Favorise l'acétose : NON                                             │
│ Pourquoi : Pic glycémique rapide, index glycémique élevé               │
│ Source : American Journal of Clinical Nutrition                         │
│                                                                          │
│ ⚠️ Reprise tolérée : J+15 minimum                                       │
│ Tu es actuellement au Jour 3. Cet aliment casserait immédiatement      │
│ tous les bénéfices de ton jeûne. Ton corps sortirait de la cétose      │
│ en quelques heures.                                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**3️⃣ TRACKING NIVEAU CÉTOSE (estimation)**

Afficher une jauge estimée du maintien de la cétose :

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📊 Ton état métabolique estimé (Jour 3/8 de reprise)                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ 🔥 Cétose maintenue : ▓▓▓▓▓▓▓▓▓░  90%                                  │
│                                                                          │
│ Aliments consommés aujourd'hui :                                        │
│ • Avocat (1/2) → ✅ Maintient cétose                                    │
│ • Œuf dur (2) → ✅ Maintient cétose                                     │
│ • Brocoli vapeur (150g) → ✅ Maintient cétose                           │
│                                                                          │
│ 💡 Ton corps continue à brûler les graisses. Tu as bien géré           │
│    ta reprise. Les bénéfices du jeûne sont préservés.                   │
│                                                                          │
│ ⚠️ Rappel : À partir de J+7, tu réintroduiras des glucides doux.       │
│    La cétose diminuera progressivement, c'est normal et voulu.          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

Calcul simplifié :
```javascript
function estimerNiveauCetose(alimentsConsommes) {
  let score = 100;
  
  alimentsConsommes.forEach(aliment => {
    const infoCetose = getBDDCetose(aliment.nom);
    
    if (infoCetose.favoriseCetose === "Oui") {
      score = score; // Maintient
    } else if (infoCetose.favoriseCetose === "Partiellement") {
      score -= 10; // Ralentit légèrement
    } else {
      score -= 50; // Casse fortement
    }
  });
  
  return Math.max(0, score);
}
```

**4️⃣ LIEN AVEC FLOW SPIRITUEL**

Intégrer les messages spirituels quand l'utilisateur maintient la cétose :

```
💬 QUAND CÉTOSE MAINTENUE (score > 80%) :

"Tu as choisi de prolonger l'état de clarté du jeûne. Ton corps continue
à fonctionner en mode 'brûleur de graisses'. Mais surtout, tu as choisi
consciemment. Tu n'es pas retombé dans les automatismes. Cette maîtrise
intérieure, c'est ça, le vrai flow spirituel."

💬 QUAND CÉTOSE PARTIELLEMENT MAINTENUE (score 50-80%) :

"Tu réintroduis progressivement les glucides. C'est prévu et nécessaire.
Observe comment ton corps s'adapte. La cétose diminue, mais ton intention
reste claire. Tu restes maître de tes choix."

💬 QUAND CÉTOSE CASSÉE (score < 50%) :

"⚠️ Tu as consommé un aliment qui a fait sortir ton corps de la cétose.
Si c'était un choix conscient, c'est OK. Si c'était un automatisme, 
observe ce qui s'est passé. Pas de jugement, juste de l'observation."
```

➡️ **CONCLUSION Q3** : BDD Cétose utilisée pour :
1. Filtrer aliments autorisés par phase
2. Afficher indicateur visuel (badge maintient/casse cétose)
3. Tracker niveau cétose estimé (jauge)
4. Messages spirituels adapta au maintien/perte de cétose

───────────────────────────────────────────────────────────────────────────────
🔍 QUESTION 4 : BDD IMPACT ALIMENTS CONSOMMÉS - COMMENT UTILISER ?
───────────────────────────────────────────────────────────────────────────────

✅ UTILISATION SECTION "CE QUE CES ALIMENTS ONT GÉNÉRÉ CHEZ MOI"

**🎯 OBJECTIF** : Permettre à l'utilisateur de renseigner son état selon ce qu'il a consommé

**💡 IMPLÉMENTATION CONCRÈTE** :

**1️⃣ INTERFACE DE SAISIE POST-REPAS**

Après validation d'un repas, afficher un questionnaire court :

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ✅ Repas validé : Avocat (1/2) + Œuf dur (2)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ 💬 Dans 1h-2h, reviens noter ce que tu as ressenti :                   │
│                                                                          │
│ [Définir rappel dans 2h] [Passer]                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

═══════ 2H PLUS TARD (notification) ═══════

┌─────────────────────────────────────────────────────────────────────────┐
│ 📊 Impact de ton repas de 12h (Avocat + Œuf)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ 🧠 Sur le plan physique :                                               │
│ [ ] Légèreté digestive                                                  │
│ [ ] Énergie stable                                                      │
│ [ ] Satiété durable (pas faim après 3h)                                │
│ [ ] Lourdeur / ballonnements                                            │
│ [ ] Fatigue post-repas                                                  │
│                                                                          │
│ ✨ Sur le plan mental/émotionnel :                                      │
│ [ ] Clarté mentale maintenue                                            │
│ [ ] Concentration facile                                                │
│ [ ] Sensation de maîtrise/fierté                                        │
│ [ ] Frustration / envie d'autres aliments                              │
│ [ ] Culpabilité                                                         │
│                                                                          │
│ 🔥 Sur le plan énergétique :                                            │
│ [ ] Sensation de vitalité                                               │
│ [ ] Corps léger                                                         │
│ [ ] Envie de bouger                                                     │
│ [ ] Besoin de sieste                                                    │
│                                                                          │
│ ✍️ Note libre (optionnel) :                                            │
│ ┌─────────────────────────────────────────────────────────────────┐   │
│ │ "J'ai ressenti une vraie stabilité. Pas de fringale, pas de     │   │
│ │ coup de barre. Mon corps a parfaitement accepté ce repas."      │   │
│ └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│ [Valider mon ressenti] [Passer]                                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**2️⃣ STOCKAGE DANS SUPABASE**

```sql
CREATE TABLE impact_aliments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  repas_id UUID REFERENCES repas_reels(id),
  aliments JSONB, -- Liste des aliments du repas
  
  -- Impact physique
  legerete_digestive BOOLEAN DEFAULT false,
  energie_stable BOOLEAN DEFAULT false,
  satiete_durable BOOLEAN DEFAULT false,
  lourdeur BOOLEAN DEFAULT false,
  fatigue_post_repas BOOLEAN DEFAULT false,
  
  -- Impact mental/émotionnel
  clarte_mentale BOOLEAN DEFAULT false,
  concentration BOOLEAN DEFAULT false,
  sensation_maitrise BOOLEAN DEFAULT false,
  frustration BOOLEAN DEFAULT false,
  culpabilite BOOLEAN DEFAULT false,
  
  -- Impact énergétique
  vitalite BOOLEAN DEFAULT false,
  corps_leger BOOLEAN DEFAULT false,
  envie_bouger BOOLEAN DEFAULT false,
  besoin_sieste BOOLEAN DEFAULT false,
  
  note_libre TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**3️⃣ ANALYSE AUTOMATIQUE & SUGGESTIONS**

Après 5-10 repas enregistrés, afficher des insights :

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 📊 Ce que tes aliments révèlent sur toi (10 derniers repas)            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ 🥑 Avocat :                                                             │
│ • 100% du temps → Légèreté digestive                                    │
│ • 90% du temps → Satiété durable                                        │
│ • 80% du temps → Clarté mentale                                         │
│ ➡️ Cet aliment est PARFAIT pour toi. Maintiens-le dans ta routine.     │
│                                                                          │
│ 🍞 Pain blanc :                                                         │
│ • 75% du temps → Lourdeur / ballonnements                               │
│ • 60% du temps → Fatigue post-repas                                     │
│ • 50% du temps → Frustration (envie de plus)                            │
│ ⚠️ Ton corps ne gère pas bien cet aliment. À limiter ou espacer.       │
│                                                                          │
│ 🥚 Œuf :                                                                │
│ • 95% du temps → Énergie stable                                         │
│ • 85% du temps → Sensation de maîtrise                                  │
│ ✅ Excellente source de protéines pour toi. À privilégier.              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

Requête SQL pour générer ces insights :
```sql
SELECT 
  aliment,
  COUNT(*) as nb_fois_consomme,
  SUM(CASE WHEN legerete_digestive THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as pct_legerete,
  SUM(CASE WHEN satiete_durable THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as pct_satiete,
  SUM(CASE WHEN clarte_mentale THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as pct_clarte,
  SUM(CASE WHEN lourdeur THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as pct_lourdeur
FROM impact_aliments
WHERE user_id = $1
GROUP BY aliment
HAVING COUNT(*) >= 3
ORDER BY pct_legerete DESC;
```

**4️⃣ LIEN AVEC CONSCIENCE ALIMENTAIRE**

Enrichir la base de conscience avec les données utilisateur :

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🥑 Avocat                                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ 🌟 Conscience alimentaire (données générales)                           │
│ Riche en acides gras mono-insaturés, pauvre en glucides...             │
│                                                                          │
│ 💫 TON expérience personnelle (basée sur tes 5 derniers repas)         │
│ ✅ 100% légèreté digestive                                              │
│ ✅ 90% satiété durable                                                  │
│ ✅ 80% clarté mentale                                                   │
│                                                                          │
│ 💬 Ta dernière note :                                                   │
│ "Cet aliment me fait du bien à chaque fois. J'ai l'impression          │
│  que mon corps le reconnaît et l'accueille facilement."                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

➡️ **CONCLUSION Q4** : Système d'impact aliments en 4 étapes :
1. Questionnaire post-repas (2h après)
2. Stockage structured dans Supabase
3. Analyse automatique après 5-10 repas
4. Enrichissement conscience alimentaire avec données personnelles

═══════════════════════════════════════════════════════════════════════════════
📌 SYNTHÈSE FINALE DES RÉPONSES
═══════════════════════════════════════════════════════════════════════════════

**Q1 - Doublons/Manques** : Oui doublons (Tomate, Fraise, etc. ×3). Manquent légumes, protéines, gras. Structure excellente.

**Q2 - Reprise alimentaire** : Intégrer conscience avec contexte adapté + filtrage par phase + tracking ressenti.

**Q3 - BDD Cétose** : Filtrer aliments par phase + indicateur visuel + jauge cétose estimée + messages spirituels.

**Q4 - Impact aliments** : Questionnaire post-repas + analyse automatique + suggestions personnalisées + enrichissement conscience.


BDD Aliment favorise la cetose :
 TABLEAU : ALIMENTS ET ACÉTOSE POST-JEÛNE
Colonnes :
Catégorie


Aliment


Favorise l’acétose ? (Oui / Non / Partiellement)


Pourquoi (source scientifique fiable)


Effet métabolique


Reprise tolérée à partir de



Gras sains
Avocat


Favorise l’acétose : Oui


Pourquoi : Riche en acides gras mono-insaturés, pauvre en glucides → ne stimule pas l’insuline. (Source : Harvard T.H. Chan School of Public Health)


Effet : Stabilise la glycémie, améliore la satiété, maintient la cétose


Reprise : J+1


Protéines maigres
Œuf entier


Favorise l’acétose : Oui


Pourquoi : Teneur élevée en protéines + lipides, sans glucides. (Source : NIH, PubMed ID: 32502999)


Effet : Préserve la masse musculaire sans casser la cétose


Reprise : J+1


Légumes pauvres en glucides
Brocoli vapeur


Favorise l’acétose : Oui


Pourquoi : Faible en glucides nets, riche en fibres. (Source : Journal of Nutrition & Metabolism)


Effet : Ne perturbe pas la cétose, bon pour le microbiote


Reprise : J+1


Aliments riches en glucides rapides
Pain blanc


Favorise l’acétose : Non


Pourquoi : Pic glycémique rapide, index glycémique élevé. (Source : American Journal of Clinical Nutrition)


Effet : Sortie immédiate de la cétose


Reprise : J+15


Fruits sucrés
Banane mûre


Favorise l’acétose : Non


Pourquoi : Riche en glucose + fructose. (Source : Nutrition & Diabetes - Nature Publishing Group)


Effet : Inhibe la production de corps cétoniques


Reprise : J+10


Légumineuses
Lentilles cuites


Favorise l’acétose : Partiellement


Pourquoi : Riches en protéines et fibres, mais modérément riches en glucides. (Source : PubMed ID: 32423421)


Effet : Ralentissement de la cétose si portion élevée


Reprise : J+7


Sucres raffinés
Chocolat au lait


Favorise l’acétose : Non


Pourquoi : Présence combinée de sucre et lait → double pic insulinique. (Source : British Medical Journal 2020)


Effet : Interruption immédiate de la cétose


Reprise : J+20


Graines oléagineuses
Amandes non salées


Favorise l’acétose : Oui


Pourquoi : Faibles en glucides, riches en bons lipides et magnésium. (Source : European Journal of Clinical Nutrition)


Effet : Satiété élevée, stabilité glycémique


Reprise : J+1


Laitages sucrés
Yaourt nature sucré


Favorise l’acétose : Non


Pourquoi : Présence de lactose + sucre ajouté. (Source : JAMA Internal Medicine, 2019)


Effet : Stimulation insulinique → fin de la cétose


Reprise : J+15


Légumes féculents
Pomme de terre vapeur


Favorise l’acétose : Non


Pourquoi : Index glycémique élevé. (Source : Harvard Health Publishing)


Effet : Relance insuline, stoppe la cétose


Reprise : J+12


Gras sains
Huile de coco vierge


Favorise l’acétose : Oui


Pourquoi : Riche en triglycérides à chaîne moyenne (MCT) → convertis rapidement en corps cétoniques. (Source : American Journal of Clinical Nutrition, 2018)


Effet : Accélère l’entrée en cétose


Reprise : J+1


Poissons gras
Saumon


Favorise l’acétose : Oui


Pourquoi : Riche en oméga-3, protéines de haute qualité, sans glucides. (Source : National Institutes of Health - Omega-3 Fact Sheet)


Effet : Favorise la lipolyse, soutien métabolique post-jeûne


Reprise : J+1


Légumes pauvres en glucides
Courgette vapeur


Favorise l’acétose : Oui


Pourquoi : Très faible en glucides nets. (Source : USDA FoodData Central)


Effet : Compatible avec maintien cétose


Reprise : J+1


Fruits à faible IG
Framboises


Favorise l’acétose : Partiellement


Pourquoi : Glucides modérés, riches en fibres et antioxydants. (Source : Journal of Agricultural and Food Chemistry)


Effet : Peu d’impact sur l’insuline si portion modérée


Reprise : J+4


Légumineuses
Pois chiches cuits


Favorise l’acétose : Non


Pourquoi : Glucides complexes, IG modéré à élevé. (Source : European Journal of Nutrition, 2020)


Effet : Ralentit voire interrompt la cétose


Reprise : J+10


Céréales complètes
Riz complet


Favorise l’acétose : Non


Pourquoi : Source de glucides même s’ils sont lents. (Source : Harvard T.H. Chan School of Public Health)


Effet : Freine la production de corps cétoniques


Reprise : J+15


Produits sucrés
Compote de pommes sucrée


Favorise l’acétose : Non


Pourquoi : Fructose + sucre ajouté. (Source : Journal of Clinical Endocrinology and Metabolism)


Effet : Rupture de cétose immédiate


Reprise : J+18


Tubercules tropicaux
Manioc


Favorise l’acétose : Non


Pourquoi : Très riche en amidon. (Source : Food Chemistry, 2015)


Effet : Interruption brutale de la cétose


Reprise : J+20


Féculents africains
Foufou de maïs


Favorise l’acétose : Non


Pourquoi : Index glycémique élevé, amidon rapide. (Source : African Journal of Food Science, 2018)


Effet : Augmente glycémie → stop cétose


Reprise : J+20


Huiles végétales industrielles
Huile de tournesol raffinée


Favorise l’acétose : Partiellement


Pourquoi : Pas de glucides, mais inflammatoire si consommée en excès. (Source : BMJ Open Heart, 2017)


Effet : Ne casse pas la cétose mais ne l’aide pas


Reprise : J+7


Fruits tropicaux riches en sucre
Mangue mûre


Favorise l’acétose : Non


Pourquoi : Riche en fructose et sucres rapides. (Source : Journal of Food Science and Technology, 2021)


Effet : Forte réponse insulinique


Reprise : J+15


Laitages nature non sucrés
Fromage blanc 3 % MG


Favorise l’acétose : Oui


Pourquoi : Riche en protéines, faible en glucides. (Source : USDA, 2022)


Effet : Soutien musculaire, compatible cétose


Reprise : J+2


Snacks / Oléagineux
Amandes


Favorise l’acétose : Oui


Pourquoi : Riche en graisses mono-insaturées, peu de glucides (Source : USDA FoodData Central)


Effet : Compatible cétose, favorise satiété


Reprise : J+1


Noix du Brésil


Favorise l’acétose : Oui


Pourquoi : Riche en sélénium et bonnes graisses, très faible IG (Source : Nutrition Journal, 2020)


Effet : Favorise métabolisme lipidique


Reprise : J+1


Barres protéinées industrielles


Favorise l’acétose : Non


Pourquoi : Souvent riches en sucres cachés (Source : Journal of Functional Foods, 2017)


Effet : Risque de rupture cétose


Reprise : J+14



Boissons
Café noir non sucré


Favorise l’acétose : Oui


Pourquoi : Stimule la lipolyse, sans glucides (Source : American Journal of Clinical Nutrition, 2019)


Effet : Peut accentuer la production de cétones


Reprise : J+1


Tisane citron-gingembre


Favorise l’acétose : Oui


Pourquoi : Pas de glucides, propriétés anti-inflammatoires (Source : Phytotherapy Research, 2021)


Effet : Favorise digestion, maintien métabolique


Reprise : J+1


Jus d’orange


Favorise l’acétose : Non


Pourquoi : Pic glycémique rapide (Source : Harvard School of Public Health)


Effet : Rupture quasi immédiate de la cétose


Reprise : J+12


Lait demi-écrémé


Favorise l’acétose : Non


Pourquoi : Lactose = sucre (Source : USDA)


Effet : Pic insulinique modéré


Reprise : J+8



Aliments traditionnels africains
Plantain bouilli


Favorise l’acétose : Non


Pourquoi : Source d’amidon (Source : African Journal of Food Science, 2018)


Effet : Stoppe la cétose en post-jeûne


Reprise : J+15


Ignames (yam)


Favorise l’acétose : Non


Pourquoi : Index glycémique élevé, même bouilli (Source : Food Chemistry, 2016)


Effet : Augmentation glycémie


Reprise : J+15


Feuilles de manioc (saka saka)


Favorise l’acétose : Oui


Pourquoi : Très faible IG, riche en fibres et protéines végétales (Source : Journal of Ethnopharmacology, 2020)


Effet : Compatible avec maintien cétose


Reprise : J+3


Gombo frais


Favorise l’acétose : Oui


Pourquoi : Faible IG, riche en fibres solubles (Source : Nutrition & Metabolism, 2018)


Effet : Ralentit l’absorption du glucose


Reprise : J+2



Condiments / Épices / Bouillons
Miso non sucré


Favorise l’acétose : Oui


Pourquoi : Faible en glucides, riche en probiotiques (Source : British Journal of Nutrition, 2017)


Effet : Soutien digestif en post-jeûne


Reprise : J+2


Bouillon de légumes maison (sans pomme de terre)


Favorise l’acétose : Oui


Pourquoi : Faible en glucides, riche en électrolytes (Source : Cleveland Clinic, 2021)


Effet : Réhydratation, soutien métabolique


Reprise : J+1


Miel (même pur)


Favorise l’acétose : Non


Pourquoi : 100 % sucre naturel (glucose, fructose) (Source : Mayo Clinic)


Effet : Interrompt l’état cétogène


Reprise : J+20


Citron pressé


Favorise l’acétose : Partiellement


Pourquoi : Peu de glucides, effet alcalinisant (Source : Journal of Clinical Biochemistry)


Effet : Pas d’impact direct, compatible en quantité modérée


Reprise : J+1






Aussi,voici la bdd crée :  en fonction de ce qu j ai explicité a partir de la ligne 511 comment adapter ca a l etat de l app actuel ? 


🍚 1. FÉCULENTS
Ce que c’est :
Les féculents sont les porteurs d’énergie stable. Ce sont les aliments-racines de nombreuses cultures, riches en glucides complexes. Ils symbolisent l’ancrage, la terre, la sécurité intérieure.
Dans le corps, ils servent de carburant pour le cerveau et les muscles, et sont essentiels au bon fonctionnement métabolique, lorsqu’ils sont consommés dans leur version la plus brute.
Aliments associés :
Riz (blanc, complet, basmati)


Pâtes (de blé dur, complètes)


Quinoa


Boulgour


Pommes de terre


Patates douces


Polenta


Manioc


Millet


Flocons d’avoine



🥚 2. PROTÉINES
Ce que c’est :
Les protéines sont les briques du vivant. Elles nourrissent les tissus, les cellules, les muscles, mais aussi les enzymes, les hormones, et les neurotransmetteurs.
Sur le plan symbolique, elles représentent la solidité intérieure, la capacité à se reconstruire. Elles sont les bâtisseuses du corps et soutiennent l’intégrité physique et mentale.
Aliments associés :
Œufs


Poulet, dinde, bœuf maigre


Poisson (cabillaud, saumon, sardine)


Tofu, tempeh


Seitan


Fromages à pâte dure (modérément)


Yaourts natures


Protéines végétales texturées (PVT)


Laitages (nature, fermentés)



🌱 3. LÉGUMINEUSES
Ce que c’est :
Les légumineuses sont des graines nourricières, à la frontière entre protéine et féculent. Riches en fibres et en protéines végétales, elles représentent l’intelligence naturelle du vivant, l’équilibre entre stabilité et croissance.
Elles soutiennent le microbiote intestinal, favorisent la satiété, et permettent une transition vers une alimentation plus végétale sans carence.
Aliments associés :
Lentilles (vertes, corail, blondes)


Pois chiches


Haricots rouges, noirs, blancs


Fèves


Pois cassés


Soja (edamame, sec)



🥦 4. LÉGUMES
Ce que c’est :
Les légumes sont les messagers de la nature. Ils nettoient, équilibrent, reminéralisent. Riche en eau, fibres, vitamines et minéraux, ils sont les alliés du mouvement intérieur, de l’énergie fluide.
Ils symbolisent la régénération, la vie qui circule. Dans le corps, ils facilitent l’élimination, soutiennent la digestion et pacifient les inflammations.
Aliments associés :
Courgettes


Carottes


Poêlées de légumes


Haricots verts


Épinards


Brocoli


Chou-fleur


Concombre


Tomates


Poireaux


Betterave



🍎 5. FRUITS
Ce que c’est :
Les fruits sont la générosité sucrée du vivant, chargés de lumière, d’enzymes, et de messages biochimiques puissants.
Ils nourrissent la douceur intérieure, la joie, et apportent une énergie directe, surtout lorsqu’ils sont consommés à jeun ou entre les repas. Ils facilitent la digestion, l’élimination, et élèvent la vitalité.
Aliments associés :
Banane


Pomme


Mangue


Fruits rouges


Raisins


Orange, clémentine


Kiwi


Melon


Pastèque


Ananas


Figue, datte (modérément)



🍰 6. EXTRAS
Ce que c’est :
Les extras sont les aliments liés à la sphère émotionnelle, sociale ou compulsive. Très riches en sucre, graisses ou additifs, ils sont souvent consommés par envie plus que par besoin.
Ils peuvent être source de plaisir s’ils sont intégrés consciemment, mais deviennent délétères s’ils comblent un vide intérieur.
Aliments associés :
Chips


Pâtisseries industrielles


Glaces


Fast food


Bonbons


Chocolat au lait


Boissons sucrées


Viennoiseries


Nutella


Plats préparés


Ketchup, sauces



🥑 7. GRAS VÉGÉTAL
Ce que c’est :
Les bons gras végétaux sont des sources profondes d’équilibre hormonal, neuronal et cellulaire.
Ils sont à la fois matière et lubrifiant, porteurs de sagesse lente. Ils protègent le système nerveux, nourrissent la peau, et aident à l’absorption des vitamines liposolubles.
Aliments associés :
Avocat


Huile d’olive (crue)


Huile de colza / lin / chanvre


Purée d’oléagineux (amande, noisette)


Graines de chia, lin, courge


Noix, amandes, noisettes (non grillées, non salées)



Catégorie
Aliment
Portion par défaut
Kcal approx.
Mesure recommandée
Féculents
Riz blanc / basmati
2 CS
180 kcal
Cuillère à soupe
Féculents
Riz complet
2 CS
170 kcal
Cuillère à soupe
Féculents
Pâtes blanches
3 CS
210 kcal
Cuillère à soupe
Féculents
Pâtes complètes
3 CS
195 kcal
Cuillère à soupe
Féculents
Quinoa
2,5 CS
170 kcal
Cuillère à soupe
Féculents
Boulgour
2,5 CS
180 kcal
Cuillère à soupe
Féculents
Couscous (semoule)
2 CS
150 kcal
Cuillère à soupe
Féculents
Polenta
2 CS
150 kcal
Cuillère à soupe
Féculents
Millet
2 CS
140 kcal
Cuillère à soupe
Féculents
Flocons d’avoine
2 CS
130 kcal
Cuillère à soupe
Féculents
Manioc
1 morceau moyen (100g)
160 kcal
Portion visuelle
Féculents
Patate douce
1 petite (130–150g)
130 kcal
Unité
Féculents
Pomme de terre
1 moyenne (150g)
110 kcal
Unité
Féculents
Pain (baguette)
60g
160 kcal
Portion en g
Féculents
Pain de mie complet
1 tranche (35g)
90 kcal
Tranche
Féculents
Pain complet
1 tranche (30g)
80 kcal
Tranche
Féculents
Croissant
1 pièce
400 kcal
Unité
Légumineuses
Lentilles (cuites)
2,5 CS
160 kcal
Cuillère à soupe
Légumineuses
Pois chiches (cuits)
2 CS
160 kcal
Cuillère à soupe
Légumineuses
Haricots rouges (cuits)
2 CS
140 kcal
Cuillère à soupe
Légumineuses
Fèves
2 CS
120 kcal
Cuillère à soupe
Légumineuses
Pois cassés
2 CS
130 kcal
Cuillère à soupe
Légumineuses
Soja (edamame, cuit)
1 poignée (60g)
120 kcal
Portion visuelle
Protéines
Œuf
1 œuf
80 kcal
Unité
Protéines
Poulet (blanc, cuit)
120g
180 kcal
Portion en g
Protéines
Poisson blanc (cabillaud)
120g
150 kcal
Portion en g
Protéines
Saumon
120g
220 kcal
Portion en g
Protéines
Tofu nature
100g
120 kcal
Portion en g
Protéines
Tempeh
100g
180 kcal
Portion en g
Protéines
Seitan
100g
140 kcal
Portion en g
Protéines
Fromage (comté, emmental)
30g
120 kcal
Portion en g
Protéines
Yaourt nature
1 pot (125g)
90 kcal
Unité
Légumes
Courgettes (cuites)
2 CS
24 kcal
Cuillère à soupe
Légumes
Carottes râpées
2 CS
12 kcal
Cuillère à soupe
Légumes
Haricots verts
2 CS
20 kcal
Cuillère à soupe
Légumes
Épinards (cuits)
2 CS
24 kcal
Cuillère à soupe
Légumes
Brocoli (cuit)
2 CS
30 kcal
Cuillère à soupe
Légumes
Tomates
1 tomate moyenne
20 kcal
Unité
Légumes
Poêlée de légumes
2 CS
35 kcal
Cuillère à soupe
Légumes
Poireaux (cuits)
2 CS
25 kcal
Cuillère à soupe
Légumes
Concombre
½ concombre
10 kcal
Portion visuelle
Fruits
Banane
1 banane
100 kcal
Unité
Fruits
Pomme
1 pomme
80 kcal
Unité
Fruits
Raisin
1 petite grappe (100g)
70 kcal
Portion visuelle
Fruits
Fruits rouges
100g
50 kcal
Portion en g
Fruits
Orange / Clémentine
1 fruit
60–80 kcal
Unité
Fruits
Mangue
½ mangue
80 kcal
Portion visuelle
Fruits
Kiwi
1 kiwi
45 kcal
Unité
Fruits
Dattes / Figues sèches
2 unités
120 kcal
Unité
Extras
Chips
1 poignée (25g)
130 kcal
Portion visuelle
Extras
Chocolat noir (70%)
1 carré (5g)
30 kcal
Carré
Extras
Biscuits digestifs
2 pièces
450 kcal
Unité
Extras
Viennoiserie
1 pain au chocolat
400 kcal
Unité
Extras
Glace (vanille)
1 boule (60g)
120 kcal
Boule
Extras
Fast food (burger + frites)
1 combo
900 kcal
Unité (combo)
Extras
Sauce industrielle
1 CS
80 kcal
Cuillère à soupe
Extras
Nutella / pâte à tartiner
1 CS
100 kcal
Cuillère à soupe
Extras
Soda sucré
1 verre (200ml)
85 kcal
Portion liquide
Gras végétal
Avocat
½ fruit
140 kcal
Portion en ½
Gras végétal
Huile d’olive (crue)
1 CS
90 kcal
Cuillère à soupe
Gras végétal
Purée d’amandes / noisette
1 CS
100 kcal
Cuillère à soupe
Gras végétal
Graines de chia
1 CS
60 kcal
Cuillère à soupe
Gras végétal
Noix / amandes / noisettes
10 unités
70–80 kcal
Unité (à la main)
Féculents
Céréales muesli
3,5 CS (40g)
300 kcal
Cuillère à soupe



8. BDD Aliments


Note importante : creer ou voir comment faire en fonction des situation / contexte de l utilisateur adapter les proportions ex si post jeune pendant x temps defini dans le tableau doit etre a X kcal ensuite doit passe a Xkcal   en reprise normal doit etre a xkcal donc les portions recommander doit etre adaote ex pour etre en dessous et perdre du pois doit consimmer 1800 kcl par jour par consequent quel portions recommandé de feculent pour aider utilisateur avec le referentiel par ex 4 cuillere a soupe max de categorie feculent;

---

═══════════════════════════════════════════════════════════════════════════════
📊 ANALYSE COMPLÈTE : CALCUL CALORIES & ALIMENTATION DES STATISTIQUES
═══════════════════════════════════════════════════════════════════════════════

**Date d'analyse** : 15 novembre 2025
**Question posée** : "Est-ce que l'app va réussir à faire le calcul des calories et alimenter les statistiques en conséquence ?"

---

## 🔍 1. ÉTAT ACTUEL DE L'APPLICATION

### ✅ CE QUI FONCTIONNE DÉJÀ

#### 1.1 Calcul calories du jour
**Fichier** : `/pages/suivi.js` (ligne 421)
```javascript
const totalCalories = repasDuJour.reduce((sum, r) => sum + (r.kcal ? Number(r.kcal) : 0), 0);
setCaloriesDuJour(totalCalories);
```

**Statut** : ✅ **FONCTIONNEL**
- L'app additionne correctement les calories de tous les repas du jour
- Récupère depuis table `repas_reels` en BDD
- Affiche total dans page suivi

---

#### 1.2 Enregistrement calories en base de données
**Fichier** : `/components/RepasBloc.js` (lignes 300-315)
```javascript
supabase.from('repas_reels').insert([{
  user_id,
  date,
  type,
  aliment: alimentFinal,
  categorie: categorieFinal,
  quantite: quantiteFinal,
  kcal: kcalFinal,  // ✅ Enregistrement OK
  est_extra: false,
  satiete,
  note
}])
```

**Statut** : ✅ **FONCTIONNEL**
- Les calories saisies par l'utilisateur sont stockées en BDD
- Colonne `kcal` de type INTEGER existe dans table `repas_reels`
- Données récupérables pour statistiques

---

#### 1.3 Structure table BDD existante
**Table** : `repas_reels`

**Colonnes confirmées** :
- `user_id` (UUID)
- `date` (DATE)
- `type` (VARCHAR) - Petit-déjeuner, Déjeuner, Dîner, Collation
- `aliment` (VARCHAR)
- `categorie` (VARCHAR) - féculent, protéine, légume, fruit, extra
- `quantite` (VARCHAR/NUMERIC) ⚠️ Type mixte (problème potentiel)
- `kcal` (INTEGER) ✅
- `est_extra` (BOOLEAN)
- `satiete` (VARCHAR)
- `note` (TEXT)
- `heure_repas` (TIME)

---

### ⚠️ CE QUI NE FONCTIONNE PAS ACTUELLEMENT

#### 2.1 Statistiques = données MOCKÉES
**Fichier** : `/pages/statistiques.js`
```javascript
const statistiquesData = {
    caloriesConsommees: 1500,  // ❌ VALEUR FIXE hardcodée
    caloriesDepensees: 2000,   // ❌ VALEUR FIXE hardcodée
    repasSains: 5,             // ❌ VALEUR FIXE
    repasTotal: 7,             // ❌ VALEUR FIXE
    defisCompletes: 3,         // ❌ VALEUR FIXE
    defisTotal: 5,             // ❌ VALEUR FIXE
};
```

**Problème** :
- Les statistiques affichées ne correspondent PAS aux vraies données de l'utilisateur
- Aucune requête Supabase pour récupérer les vraies calories consommées
- Page inutilisable en l'état pour un vrai suivi

**Impact** :
- ❌ L'utilisateur ne peut pas voir ses vraies statistiques
- ❌ Impossible de suivre l'évolution réelle
- ❌ Pas de motivation basée sur les progrès réels

---

#### 2.2 Quantités non standardisées
**Problème actuel** :

Dans RepasBloc.js, l'utilisateur peut saisir :
- `quantite: "2 CS"` (texte libre)
- `quantite: 150` (nombre de grammes)
- `quantite: "1 pièce"` (texte)
- `quantite: "une poignée"` (texte libre)

**Conséquences** :
1. ❌ **Impossible de faire des stats par unité** : "Combien de CS de féculents cette semaine ?"
2. ❌ **Calculs faussés** : Si quantité est en texte, impossible de faire SUM() ou AVG()
3. ❌ **Pas de comparaison** : Impossible de comparer "2 CS" avec "150g"

**Exemple de données en BDD actuellement** :
```
| aliment      | quantite  | kcal |
|--------------|-----------|------|
| Riz blanc    | "2 CS"    | 180  |
| Poulet       | 120       | 180  |
| Banane       | "1 pièce" | 90   |
| Chocolat     | "bcp"     | 200  |
```

→ ❌ **Impossible de calculer "quantité totale de féculents"**

---

#### 2.3 Pas de calcul automatique des calories
**Problème actuel** :

L'utilisateur DOIT :
1. Saisir l'aliment : "Riz blanc"
2. Saisir la catégorie : "féculent"
3. Saisir la quantité : "3"
4. **Calculer manuellement les calories** : "180 kcal" ❌

**Ce qui est attendu** (selon adaptation proposée) :
1. Saisir l'aliment : "Riz blanc" → app trouve dans référentiel
2. Saisir la quantité : "3 CS"
3. **App calcule automatiquement** : 3 × 90 = 270 kcal ✅

**Actuellement** : L'app ne calcule PAS automatiquement, l'utilisateur doit :
- Connaître les calories par CS
- Faire le calcul mental
- Taper manuellement le total

→ ❌ **Friction UX importante, risque d'erreurs**

---

## 🔧 2. SOLUTIONS PROPOSÉES (ADAPTATION RÉFÉRENTIEL)

### Solution 1 : Enrichir référentiel avec `kcalParUnite`

**Fichier** : `/data/referentiel.js`

**AVANT (actuellement - 11 aliments)** :
```javascript
{
  nom: "Riz basmati",
  categorie: "féculent",
  kcal: 350,              // ❌ Ambiguë : pour quelle quantité ?
  portionMax: "2 CS Bombées",
  typeRepas: "Déjeuner"
}
```

**APRÈS (proposé - structure enrichie)** :
```javascript
{
  nom: "Riz blanc",
  categorie: "féculent",
  sousCategorie: "Riz",
  kcal: 180,              // Pour la portion PAR DÉFAUT (2 CS)
  portionDefaut: "2 CS",  // ✅ NOUVEAU
  unite: "CS",            // ✅ NOUVEAU : "CS" | "piece" | "g" | "portion_visuelle"
  kcalParUnite: 90,       // ✅ NOUVEAU : 1 CS = 90 kcal
  mesureRecommandee: "Cuillère à soupe",
  typeRepas: "Déjeuner",
  moment: "Midi"
}
```

**Avantages** :
- ✅ Calcul automatique possible : `quantite × kcalParUnite = total`
- ✅ Flexible pour toutes les unités (CS, pièces, grammes)
- ✅ Clair pour l'utilisateur (1 CS = X kcal)

---

### Solution 2 : Adapter RepasBloc.js pour calcul automatique

**Fichier** : `/components/RepasBloc.js`

**Nouveaux états** :
```javascript
import referentielAliments from '../data/referentiel';

const [quantiteNombre, setQuantiteNombre] = useState(''); // Ex: "2.5"
const [alimentRef, setAlimentRef] = useState(null);       // Objet référentiel sélectionné
```

**Fonction calcul automatique** :
```javascript
function calculerKcalAutomatique(aliment, quantiteNombre) {
  if (!aliment || !quantiteNombre) return 0;
  
  const ref = referentielAliments.find(a => a.nom === aliment);
  if (!ref) return 0;
  
  // Si unité = CS, multiplier kcalParUnite par nombre de CS
  if (ref.unite === "CS") {
    return Math.round(ref.kcalParUnite * parseFloat(quantiteNombre));
  }
  
  // Si unité = piece, multiplier par nombre de pièces
  if (ref.unite === "piece") {
    return Math.round(ref.kcalParUnite * parseFloat(quantiteNombre));
  }
  
  // Si unité = g, multiplier par grammes
  if (ref.unite === "g") {
    return Math.round(ref.kcalParUnite * parseFloat(quantiteNombre));
  }
  
  // Si portion visuelle, retourner kcal direct
  return ref.kcal;
}
```

**Recalcul automatique quand quantité change** :
```javascript
useEffect(() => {
  if (alimentRef && quantiteNombre) {
    const kcalCalcule = calculerKcalAutomatique(aliment, quantiteNombre);
    setKcal(Math.round(kcalCalcule).toString());
  }
}, [quantiteNombre, alimentRef]);
```

**Interface utilisateur** :
```jsx
{/* Autocomplete aliments */}
<input 
  type="text" 
  placeholder="Chercher un aliment..."
  value={aliment}
  onChange={(e) => setAliment(e.target.value)}
  list="aliments-suggestions"
/>
<datalist id="aliments-suggestions">
  {referentielAliments.map(a => (
    <option key={a.nom} value={a.nom} />
  ))}
</datalist>

{/* Afficher mesure recommandée */}
{alimentRef && (
  <div style={{ fontSize: 12, color: "#666" }}>
    📏 Portion recommandée : {alimentRef.portionDefaut}
  </div>
)}

{/* Quantité en unités */}
<label>
  Quantité :
  <input 
    type="number" 
    step="0.5"
    value={quantiteNombre}
    onChange={(e) => setQuantiteNombre(e.target.value)}
  />
  {alimentRef && (
    <span>
      {alimentRef.unite === "CS" && "cuillère(s) à soupe"}
      {alimentRef.unite === "piece" && "pièce(s)"}
      {alimentRef.unite === "g" && "gramme(s)"}
    </span>
  )}
</label>

{/* Calories calculées auto (lecture seule) */}
<label>
  Calories : 
  <input 
    type="number" 
    value={kcal} 
    readOnly 
    style={{ background: "#f0f0f0" }}
  />
  <span style={{ fontSize: 12 }}>✨ Calculé automatiquement</span>
</label>
```

---

### Solution 3 : Adapter table BDD pour standardisation

**Migration Supabase** :
```sql
-- Ajouter colonnes pour quantités standardisées
ALTER TABLE repas_reels 
ADD COLUMN IF NOT EXISTS quantite_nombre NUMERIC(6,2),  -- ✅ Nombre pur pour calculs
ADD COLUMN IF NOT EXISTS quantite_unite VARCHAR(20),    -- ✅ "CS", "piece", "g"
ADD COLUMN IF NOT EXISTS quantite_affichage VARCHAR(50);-- ✅ "2,5 CS" pour affichage

-- Créer index pour requêtes stats
CREATE INDEX IF NOT EXISTS idx_repas_reels_user_date 
ON repas_reels(user_id, date);

CREATE INDEX IF NOT EXISTS idx_repas_reels_categorie 
ON repas_reels(categorie);
```

**Enregistrement modifié dans RepasBloc.js** :
```javascript
supabase.from('repas_reels').insert([{
  user_id,
  date,
  type,
  aliment: alimentRef.nom,
  categorie: alimentRef.categorie,
  
  // ✅ NOUVEAU : 3 champs séparés
  quantite_nombre: parseFloat(quantiteNombre),           // 2.5
  quantite_unite: alimentRef.unite,                      // "CS"
  quantite_affichage: `${quantiteNombre} ${alimentRef.unite}`, // "2,5 CS"
  
  kcal: parseInt(kcal), // Calculé automatiquement
  est_extra,
  satiete,
  note
}])
```

**Avantages** :
- ✅ Stats par unité possibles : `SUM(quantite_nombre) WHERE quantite_unite = 'CS'`
- ✅ Calculs agrégés fiables
- ✅ Comparaisons possibles
- ✅ Affichage UX conservé via `quantite_affichage`

---

### Solution 4 : Connecter statistiques aux vraies données

**Fichier** : `/pages/statistiques.js` (RÉÉCRITURE COMPLÈTE)

**AVANT (données mockées)** :
```javascript
const statistiquesData = {
    caloriesConsommees: 1500, // ❌ FAUX
    // ...
};
```

**APRÈS (vraies données Supabase)** :
```javascript
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Statistiques = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState('semaine'); // semaine | mois

  useEffect(() => {
    async function fetchStats() {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Calculer dates selon période
      const maintenant = new Date();
      let dateDebut = new Date();
      
      if (periode === 'semaine') {
        dateDebut.setDate(maintenant.getDate() - 7);
      } else if (periode === 'mois') {
        dateDebut.setDate(maintenant.getDate() - 30);
      }
      
      const dateDebutStr = dateDebut.toISOString().split('T')[0];
      
      // ✅ REQUÊTE RÉELLE Supabase
      const { data: repas, error } = await supabase
        .from('repas_reels')
        .select('kcal, date, est_extra, categorie, quantite_nombre, quantite_unite')
        .eq('user_id', user.id)
        .gte('date', dateDebutStr)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Erreur stats:', error);
        return;
      }
      
      // ✅ CALCULS RÉELS
      const totalKcal = repas?.reduce((sum, r) => sum + (r.kcal || 0), 0) || 0;
      const nbExtras = repas?.filter(r => r.est_extra).length || 0;
      const nbRepas = repas?.length || 0;
      const repasSains = repas?.filter(r => !r.est_extra && r.categorie !== 'extra').length || 0;
      
      // Stats par catégorie
      const statsCat = {};
      ['féculent', 'protéine', 'légume', 'fruit', 'légumineuse', 'gras_vegetal', 'extra'].forEach(cat => {
        const repasCat = repas?.filter(r => r.categorie === cat) || [];
        statsCat[cat] = {
          nbRepas: repasCat.length,
          totalKcal: repasCat.reduce((sum, r) => sum + (r.kcal || 0), 0),
          totalCS: repasCat
            .filter(r => r.quantite_unite === 'CS')
            .reduce((sum, r) => sum + (r.quantite_nombre || 0), 0)
        };
      });
      
      setStats({
        caloriesConsommees: totalKcal,
        caloriesDepensees: 0, // À calculer selon activités physiques
        repasSains,
        repasTotal: nbRepas,
        nbExtras,
        maxExtras: 3,
        parCategorie: statsCat,
        periode
      });
      setLoading(false);
    }
    
    fetchStats();
  }, [periode]);

  if (loading) return <div>Chargement des statistiques...</div>;
  if (!stats) return <div>Aucune donnée</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Tableau de Bord Personnel</h1>
      
      {/* Sélecteur période */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setPeriode('semaine')}>Semaine</button>
        <button onClick={() => setPeriode('mois')}>Mois</button>
      </div>
      
      {/* Stats principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={{ background: '#fff3cd', padding: 16, borderRadius: 8 }}>
          <h3>🔥 Calories</h3>
          <p style={{ fontSize: 32, fontWeight: 'bold', margin: 0 }}>
            {stats.caloriesConsommees.toLocaleString()} kcal
          </p>
          <p style={{ fontSize: 12, color: '#666' }}>
            Sur les {stats.periode === 'semaine' ? '7 derniers jours' : '30 derniers jours'}
          </p>
        </div>
        
        <div style={{ background: '#d4edda', padding: 16, borderRadius: 8 }}>
          <h3>🍽️ Repas sains</h3>
          <p style={{ fontSize: 32, fontWeight: 'bold', margin: 0 }}>
            {stats.repasSains} / {stats.repasTotal}
          </p>
          <p style={{ fontSize: 12, color: '#666' }}>
            {Math.round((stats.repasSains / stats.repasTotal) * 100)}% de conformité
          </p>
        </div>
        
        <div style={{ 
          background: stats.nbExtras > stats.maxExtras ? '#f8d7da' : '#cfe2ff', 
          padding: 16, 
          borderRadius: 8 
        }}>
          <h3>⚠️ Extras</h3>
          <p style={{ fontSize: 32, fontWeight: 'bold', margin: 0 }}>
            {stats.nbExtras} / {stats.maxExtras}
          </p>
          <p style={{ fontSize: 12, color: '#666' }}>
            {stats.nbExtras > stats.maxExtras ? '⚠️ Quota dépassé' : '✅ Quota respecté'}
          </p>
        </div>
      </div>
      
      {/* Stats par catégorie */}
      <h2 style={{ marginTop: 32 }}>📋 Détails par catégorie</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8f9fa' }}>
            <th style={{ padding: 12, textAlign: 'left' }}>Catégorie</th>
            <th style={{ padding: 12, textAlign: 'right' }}>Nb repas</th>
            <th style={{ padding: 12, textAlign: 'right' }}>Calories</th>
            <th style={{ padding: 12, textAlign: 'right' }}>Total CS</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(stats.parCategorie).map(([cat, data]) => (
            <tr key={cat} style={{ borderBottom: '1px solid #dee2e6' }}>
              <td style={{ padding: 12 }}>
                {cat === 'féculent' && '🍚 Féculents'}
                {cat === 'protéine' && '🥚 Protéines'}
                {cat === 'légume' && '🥦 Légumes'}
                {cat === 'fruit' && '🍎 Fruits'}
                {cat === 'légumineuse' && '🌱 Légumineuses'}
                {cat === 'gras_vegetal' && '🥑 Gras végétal'}
                {cat === 'extra' && '🍰 Extras'}
              </td>
              <td style={{ padding: 12, textAlign: 'right' }}>{data.nbRepas}</td>
              <td style={{ padding: 12, textAlign: 'right' }}>{data.totalKcal} kcal</td>
              <td style={{ padding: 12, textAlign: 'right' }}>
                {data.totalCS > 0 ? `${data.totalCS} CS` : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Statistiques;
```

**Avantages** :
- ✅ Stats RÉELLES de l'utilisateur
- ✅ Calculs dynamiques selon période
- ✅ Stats par catégorie (féculents, protéines, etc.)
- ✅ Total CS consommés (pour féculents notamment)
- ✅ Taux de conformité
- ✅ Alertes si quota extras dépassé

---

## 📋 3. PLAN D'ACTION COMPLET AVEC CHECKLIST

### Phase 1 : Enrichir référentiel (2-3h)

#### ✅ Action 1.1 : Ajouter champ `kcalParUnite` (1h)
**Fichier** : `/data/referentiel.js`

**Checklist** :
- [ ] Pour chaque aliment, calculer `kcalParUnite`
  - Riz blanc : 180 kcal / 2 CS = 90 kcal/CS
  - Pâtes : 210 kcal / 3 CS = 70 kcal/CS
  - Œuf : 80 kcal / 1 pièce = 80 kcal/pièce
- [ ] Ajouter champs : `portionDefaut`, `unite`, `kcalParUnite`, `mesureRecommandee`
- [ ] Tester cohérence : `portionDefaut × kcalParUnite ≈ kcal`

**Exemple** :
```javascript
{
  nom: "Riz blanc",
  categorie: "féculent",
  kcal: 180,
  portionDefaut: "2 CS",
  unite: "CS",
  kcalParUnite: 90,
  mesureRecommandee: "Cuillère à soupe"
}
```

---

#### ✅ Action 1.2 : Enrichir à 60+ aliments (2h)
**Référence** : Tableau lignes 680-800 du document

**Checklist** :
- [ ] Féculents : 15 aliments (riz, pâtes, quinoa, pommes de terre, pain, etc.)
- [ ] Protéines : 10 aliments (œufs, poulet, poisson, tofu, etc.)
- [ ] Légumes : 10 aliments (courgettes, carottes, tomates, etc.)
- [ ] Fruits : 10 aliments (banane, pomme, raisin, etc.)
- [ ] Légumineuses : 6 aliments (lentilles, pois chiches, haricots, etc.)
- [ ] Gras végétal : 5 aliments (avocat, huile d'olive, noix, etc.)
- [ ] Extras : 5 aliments (chips, chocolat, glace, etc.)

---

### Phase 2 : Calcul automatique (3h)

#### ✅ Action 2.1 : Corriger doublon RepasBloc (30min)
**Fichier** : `/components/RepasBloc.js`

**Checklist** :
- [ ] Supprimer lignes 7-14 (référentiel local)
- [ ] Ajouter import : `import referentielAliments from '../data/referentiel';`
- [ ] Vérifier aucune référence à l'ancien tableau local

---

#### ✅ Action 2.2 : Implémenter calcul auto (1h30)
**Fichier** : `/components/RepasBloc.js`

**Checklist** :
- [ ] Créer état `quantiteNombre` (nombre pur)
- [ ] Créer état `alimentRef` (objet référentiel)
- [ ] Fonction `calculerKcalAutomatique(aliment, quantiteNombre)`
  - [ ] Gérer unite "CS"
  - [ ] Gérer unite "piece"
  - [ ] Gérer unite "g"
  - [ ] Gérer unite "portion_visuelle"
- [ ] useEffect pour recalcul auto quand `quantiteNombre` change
- [ ] Tester calculs :
  - [ ] Riz blanc 3 CS → 270 kcal
  - [ ] Œuf 2 pièces → 160 kcal
  - [ ] Poulet 120g → 180 kcal

---

#### ✅ Action 2.3 : Interface utilisateur (1h)
**Fichier** : `/components/RepasBloc.js`

**Checklist** :
- [ ] Input autocomplete avec datalist (suggestions référentiel)
- [ ] Afficher portion recommandée si aliment trouvé
- [ ] Input quantité type="number" avec step="0.5"
- [ ] Afficher unité selon aliment sélectionné ("CS", "pièce(s)", etc.)
- [ ] Input kcal en lecture seule avec icône "✨ Calculé automatiquement"
- [ ] Tester UX complète : saisie aliment → quantité → kcal auto

---

### Phase 3 : Conscience alimentaire (2h)

#### ✅ Action 3.1 : Table `aliments_conscience` (1h)
**Migration Supabase**

**Checklist** :
- [ ] Créer table avec colonnes :
  - [ ] `aliment`, `categorie`, `bienfait_physique`, `bienfait_spirituel`
  - [ ] `effet_perte_poids`, `effet_satiete`, `a_savoir`, `sources`
- [ ] Créer indexes sur `aliment` et `categorie`
- [ ] Insérer données "Base conscience alimentaire" (lignes 522-560)
  - [ ] Tomate, Fraise, Pastèque, Banane, Pomme, Raisin, Mangue
- [ ] Tester requête : `SELECT * FROM aliments_conscience WHERE aliment = 'Banane'`

---

#### ✅ Action 3.2 : Affichage conscience dans RepasBloc (1h)
**Fichier** : `/components/RepasBloc.js`

**Checklist** :
- [ ] Créer état `conscienceAliment`
- [ ] Fonction `chargerConscienceAliment(nomAliment)`
- [ ] useEffect quand `alimentSelectionne` change
- [ ] Encadré visuel avec dégradé violet
- [ ] Sections déroulantes (<details>) :
  - [ ] 💪 Bienfait physique
  - [ ] ✨ Bienfait spirituel
  - [ ] 📉 Effet perte de poids
  - [ ] 🍽️ Effet satiété
  - [ ] 💡 À savoir
- [ ] Tester affichage avec "Banane", "Tomate", "Pomme"

---

### Phase 4 : Aliments personnalisés (2h)

#### ✅ Action 4.1 : Table `aliments_custom` (30min)
**Migration Supabase**

**Checklist** :
- [ ] Créer table avec colonnes :
  - [ ] `user_id`, `nom`, `categorie`, `kcal`, `portion_defaut`
  - [ ] `unite`, `kcal_par_unite`
- [ ] Index sur `user_id`
- [ ] RLS activé : user voit seulement ses aliments

---

#### ✅ Action 4.2 : Interface création aliment (1h30)
**Fichier** : `/components/RepasBloc.js`

**Checklist** :
- [ ] Détecter si aliment pas trouvé dans référentiel
- [ ] Afficher bannière "⚠️ '{aliment}' n'est pas dans le référentiel"
- [ ] Bouton "➕ Ajouter cet aliment"
- [ ] Modal avec formulaire :
  - [ ] Nom (pré-rempli)
  - [ ] Catégorie (select)
  - [ ] Portion défaut (input texte, ex: "2 CS")
  - [ ] Unité (select: CS, piece, g, portion_visuelle)
  - [ ] Calories par unité (input number)
- [ ] Fonction `creerAlimentPersonnalise()` → insert Supabase
- [ ] Fusionner référentiel + aliments custom dans suggestions
- [ ] Tester cycle complet : saisie "Pizza maison" → création → réutilisation

---

### Phase 5 : Statistiques fonctionnelles (2h)

#### ✅ Action 5.1 : Migration BDD quantités (30min)
**Migration Supabase**

**Checklist** :
- [ ] Ajouter colonnes `quantite_nombre`, `quantite_unite`, `quantite_affichage`
- [ ] Créer index `idx_repas_reels_user_date`
- [ ] Créer index `idx_repas_reels_categorie`
- [ ] Optionnel : Migrer données existantes (regex pour extraire nombre)

---

#### ✅ Action 5.2 : Modifier enregistrement RepasBloc (30min)
**Fichier** : `/components/RepasBloc.js`

**Checklist** :
- [ ] Modifier insert Supabase pour enregistrer 3 champs :
  - [ ] `quantite_nombre: parseFloat(quantiteNombre)`
  - [ ] `quantite_unite: alimentRef.unite`
  - [ ] `quantite_affichage: `${quantiteNombre} ${alimentRef.unite}``
- [ ] Tester enregistrement : vérifier données en BDD

---

#### ✅ Action 5.3 : Réécrire `/pages/statistiques.js` (1h)
**Fichier** : `/pages/statistiques.js`

**Checklist** :
- [ ] Supprimer données mockées
- [ ] Créer états : `stats`, `loading`, `periode`
- [ ] useEffect avec requête Supabase réelle
- [ ] Calculer :
  - [ ] `totalKcal` (SUM kcal)
  - [ ] `nbExtras`, `repasSains`, `repasTotal`
  - [ ] Stats par catégorie (boucle sur 7 catégories)
  - [ ] Total CS par catégorie (si `quantite_unite = 'CS'`)
- [ ] Interface :
  - [ ] Sélecteur période (semaine/mois)
  - [ ] Cards principales (calories, repas sains, extras)
  - [ ] Tableau détaillé par catégorie
- [ ] Tester avec vraies données utilisateur

---

## 📊 4. TESTS DE VALIDATION

### Test 1 : Calcul automatique
**Scénario** :
1. Ouvrir RepasBloc
2. Saisir "Riz blanc" → aliment trouvé dans référentiel
3. Saisir quantité : "3"
4. Vérifier affichage : "3 cuillère(s) à soupe"
5. Vérifier kcal calculé automatiquement : "270 kcal" (3 × 90)

**Résultat attendu** : ✅ Calcul correct sans intervention utilisateur

---

### Test 2 : Enregistrement BDD
**Scénario** :
1. Compléter saisie test 1
2. Enregistrer repas
3. Vérifier en BDD (Supabase dashboard) :
   - `aliment: "Riz blanc"`
   - `categorie: "féculent"`
   - `quantite_nombre: 3`
   - `quantite_unite: "CS"`
   - `quantite_affichage: "3 CS"`
   - `kcal: 270`

**Résultat attendu** : ✅ Toutes les données enregistrées correctement

---

### Test 3 : Statistiques réelles
**Scénario** :
1. Créer 5 repas sur 3 jours différents avec calories variées
2. Ouvrir `/statistiques`
3. Vérifier :
   - Total calories = somme réelle des 5 repas
   - Nb repas = 5
   - Stats par catégorie affichent bonnes valeurs

**Résultat attendu** : ✅ Stats correspondent aux vraies données utilisateur

---

### Test 4 : Conscience alimentaire
**Scénario** :
1. Saisir "Banane"
2. Vérifier apparition encadré "🌟 Conscience alimentaire"
3. Dérouler "💪 Bienfait physique" → vérifier texte affiché
4. Dérouler "✨ Bienfait spirituel" → vérifier texte affiché

**Résultat attendu** : ✅ Infos affichées correspondent aux données BDD

---

### Test 5 : Aliment personnalisé
**Scénario** :
1. Saisir "Pizza maison" (n'existe pas dans référentiel)
2. Vérifier bannière "⚠️ '{aliment}' n'est pas dans le référentiel"
3. Cliquer "➕ Ajouter cet aliment"
4. Remplir formulaire : catégorie "féculent", "1 part", "piece", "350 kcal/part"
5. Enregistrer
6. Ressaisir "Pizza maison" → vérifier trouvé dans suggestions

**Résultat attendu** : ✅ Aliment personnalisé créé et réutilisable

---

## ⚠️ 5. POINTS D'ATTENTION

### 5.1 Compatibilité données existantes
**Problème** : Si utilisateur a déjà saisi des repas avec ancien système (quantité en texte libre)

**Solutions** :
1. **Option A - Migration douce** :
   - Garder colonne `quantite` existante
   - Ajouter nouvelles colonnes `quantite_nombre`, `quantite_unite`
   - Afficher les deux dans l'historique
   - Futures saisies utilisent nouveau système

2. **Option B - Migration forcée** :
   - Script de migration pour analyser anciennes données
   - Regex pour extraire nombres : `"2 CS"` → `quantite_nombre: 2`, `quantite_unite: "CS"`
   - Valeurs non migrables → `null`

**Recommandation** : Option A (plus sûre, pas de perte de données)

---

### 5.2 Validation des saisies
**Contrôles à ajouter** :
- [ ] Quantité > 0
- [ ] Quantité < 50 (limite raisonnable pour éviter erreurs, ex: 500 CS au lieu de 5)
- [ ] Calories calculées < 5000 par repas (sécurité)
- [ ] Catégorie obligatoire
- [ ] Aliment obligatoire (sauf si Jeûne)

---

### 5.3 Performance requêtes stats
**Optimisations** :
- [ ] Indexes sur `user_id`, `date`, `categorie`
- [ ] Limiter période de calcul (max 90 jours)
- [ ] Cache côté client (localStorage) pour stats du jour
- [ ] Lazy loading tableau détaillé par catégorie

---

### 5.4 Gestion erreurs
**Cas à gérer** :
- [ ] Référentiel vide → message "Base alimentaire en cours de chargement"
- [ ] Erreur Supabase → message "Impossible de récupérer les statistiques"
- [ ] Aliment non trouvé → proposer création au lieu de bloquer
- [ ] Calories = 0 calculées → alerte "Vérifiez la quantité saisie"

---

## 🎯 6. RÉPONSE FINALE À LA QUESTION

### Question : "Est-ce que l'app va réussir à faire le calcul des calories et alimenter les statistiques en conséquence ?"

### Réponse : **OUI, MAIS AVEC CONDITIONS**

#### ✅ ACTUELLEMENT (sans modification)
- ✅ **Enregistrement calories** : Fonctionne (RepasBloc → Supabase)
- ✅ **Calcul total du jour** : Fonctionne (suivi.js ligne 421)
- ❌ **Calcul automatique** : NE FONCTIONNE PAS (user doit calculer manuellement)
- ❌ **Statistiques réelles** : NE FONCTIONNENT PAS (données mockées)

**Verdict** : L'app fonctionne à **40%** pour les calories/stats

---

#### ✅ APRÈS ADAPTATIONS PROPOSÉES (11-12h de travail)
- ✅ **Enrichissement référentiel** : 60+ aliments avec `kcalParUnite`
- ✅ **Calcul automatique** : User saisit quantité → calories calculées instantanément
- ✅ **Stockage standardisé** : Quantités en nombre + unité séparés
- ✅ **Stats réelles** : Requêtes Supabase vraies données utilisateur
- ✅ **Stats avancées** : Par catégorie, total CS féculents, taux conformité
- ✅ **Conscience alimentaire** : Bienfaits physiques/spirituels affichés

**Verdict** : L'app fonctionnera à **100%** avec expérience utilisateur optimale

---

### 🔢 RÉCAPITULATIF CHIFFRÉ

| Fonctionnalité | Actuellement | Après adaptations |
|----------------|--------------|-------------------|
| Enregistrement calories | ✅ 100% | ✅ 100% |
| Calcul total jour | ✅ 100% | ✅ 100% |
| Calcul automatique | ❌ 0% | ✅ 100% |
| Stats réelles | ❌ 0% | ✅ 100% |
| Stats par catégorie | ❌ 0% | ✅ 100% |
| Quantités standardisées | ❌ 0% | ✅ 100% |
| Conscience alimentaire | ❌ 0% | ✅ 100% |
| Aliments personnalisés | ❌ 0% | ✅ 100% |
| **MOYENNE** | **40%** | **100%** |

---

### ⏱️ DURÉE TOTALE D'IMPLÉMENTATION

| Phase | Temps | Priorité |
|-------|-------|----------|
| Phase 1 - Enrichir référentiel | 2-3h | 🔴 HAUTE |
| Phase 2 - Calcul automatique | 3h | 🔴 HAUTE |
| Phase 3 - Conscience alimentaire | 2h | 🟡 MOYENNE |
| Phase 4 - Aliments personnalisés | 2h | 🟡 MOYENNE |
| Phase 5 - Stats réelles | 2h | 🔴 HAUTE |
| **TOTAL** | **11-12h** | |

**Répartition recommandée** :
- **Semaine 1** : Phases 1 + 2 (5-6h) → Calcul auto fonctionnel
- **Semaine 2** : Phase 5 (2h) → Stats réelles
- **Semaine 3** : Phases 3 + 4 (4h) → Conscience + personnalisation

---

### 💡 CONCLUSION

L'application **RÉUSSIRA** à faire le calcul des calories et alimenter les statistiques **SI ET SEULEMENT SI** vous implémentez les adaptations proposées, notamment :

1. **Indispensable (Phases 1, 2, 5)** :
   - Enrichir référentiel avec `kcalParUnite`
   - Implémenter calcul automatique
   - Connecter stats aux vraies données Supabase

2. **Recommandé (Phases 3, 4)** :
   - Conscience alimentaire (alignement avec vision projet)
   - Aliments personnalisés (flexibilité utilisateur)

**Sans ces modifications**, l'app continuera à fonctionner mais avec une expérience dégradée :
- User doit calculer calories manuellement
- Stats affichent données fausses
- Pas de suivi réel de progression

**Avec ces modifications**, l'app devient un **vrai outil de suivi alimentaire conscient** aligné avec la vision du projet.

---

## 📋 RÉCAPITULATIF DES ADAPTATIONS (PLAN D'ACTION CONSOLIDÉ)

| Phase | Action | Durée | Fichiers concernés |
|-------|--------|-------|-------------------|
| **Phase 1** | Enrichir référentiel avec mesures CS | 2-3h | `/data/referentiel.js` |
| **Phase 2** | Calcul auto calories selon quantité | 3h | `/components/RepasBloc.js` |
| **Phase 3** | Table + affichage conscience alimentaire | 2h | Supabase + RepasBloc.js |
| **Phase 4** | Aliments personnalisés | 2h | Supabase + RepasBloc.js |
| **Phase 5** | Adaptation BDD pour stats + connexion stats réelles | 2h | Supabase + `/pages/statistiques.js` |
| **TOTAL** | | **11-12h** | |

---

## ✅ CHECKLIST COMPLÈTE POUR QUE LES STATS MARCHENT

### ✅ Niveau 1 - Données de base (ACTUELLEMENT OK)
- [x] Table `repas_reels` avec colonne `kcal` existante
- [x] Enregistrement calories lors saisie repas (RepasBloc.js ligne 300-315)
- [x] Récupération données depuis Supabase fonctionnelle
- [x] Calcul total calories du jour (suivi.js ligne 421)

### ⚠️ Niveau 2 - Calcul automatique (À FAIRE - Phase 2)
- [ ] **Action 2.1** : Ajouter champ `kcalParUnite` dans `/data/referentiel.js` (1h)
  - Exemple : `{ nom: "Riz blanc", kcalParUnite: 90 }` (90 kcal par CS)
- [ ] **Action 2.2** : Implémenter fonction `calculerKcalAutomatique()` dans RepasBloc.js (1h)
- [ ] **Action 2.3** : État `quantiteNombre` pour saisie numérique (30min)
- [ ] **Action 2.4** : useEffect pour recalcul auto quand quantité change (30min)
- [ ] **Test** : Saisir "Riz blanc" + "3 CS" → doit afficher "270 kcal" automatiquement

### ⚠️ Niveau 3 - Stockage standardisé (À FAIRE - Phase 5)
- [ ] **Action 5.1** : Migration Supabase - Ajouter colonnes (30min)
```sql
ALTER TABLE repas_reels 
ADD COLUMN IF NOT EXISTS quantite_nombre NUMERIC(6,2),
ADD COLUMN IF NOT EXISTS quantite_unite VARCHAR(20),
ADD COLUMN IF NOT EXISTS quantite_affichage VARCHAR(50);
```
- [ ] **Action 5.2** : Modifier RepasBloc.js pour enregistrer 3 champs séparés (30min)
  - `quantite_nombre: 2.5` (nombre pur pour stats)
  - `quantite_unite: "CS"` (unité)
  - `quantite_affichage: "2,5 CS"` (affichage UX)
- [ ] **Action 5.3** : Optionnel - Migrer données existantes (1h si nécessaire)

### ❌ Niveau 4 - Statistiques connectées (À FAIRE ABSOLUMENT - Phase 5)
- [ ] **Action 5.4** : Remplacer données mockées dans `/pages/statistiques.js` (1h)
  - Supprimer `const statistiquesData = { caloriesConsommees: 1500 }`
  - Créer `useEffect` avec requête Supabase réelle
- [ ] **Action 5.5** : Requêtes agrégées pour totaux (30min)
```javascript
const { data: repas } = await supabase
  .from('repas_reels')
  .select('kcal, date, est_extra, categorie')
  .eq('user_id', user.id)
  .gte('date', debutSemaine);

const totalKcal = repas.reduce((sum, r) => sum + (r.kcal || 0), 0);
```
- [ ] **Action 5.6** : Affichage dynamique selon période (jour/semaine/mois) (1h)
- [ ] **Test** : Vérifier que stats affichent VRAIES données utilisateur

### 🎯 Niveau 5 - Stats avancées par catégorie (OPTIONNEL - Plus tard)
- [ ] Stats par catégorie (féculents, protéines, légumes, etc.)
- [ ] Total CS de féculents cette semaine
- [ ] Graphiques évolution calories sur 30 jours
- [ ] Export PDF statistiques mensuelles

---

═══════════════════════════════════════════════════════════════════════════════
FIN DE L'ANALYSE COMPLÈTE
═══════════════════════════════════════════════════════════════════════════════ 