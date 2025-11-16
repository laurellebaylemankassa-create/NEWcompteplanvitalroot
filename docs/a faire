## 🔥 TODO SÉANCES BONUS & PLAN (EN COURS)

### ✅ DÉJÀ FAIT (ne pas refaire) :
- ✅ Bouton "✅ Valider le plan du Palier 1" (existe ligne 581 ideaux.js)
- ✅ Suppression redirection automatique après validation
- ✅ Chargement des séances après validation du plan
- ✅ Bouton "Ajouter une séance bonus" (existe ligne 701 ideaux.js)
- ✅ Affichage Palier 1 : Mois Année (existe ligne 520 ideaux.js)

### ❌ TODO ACTUELLE (À IMPLÉMENTER MAINTENANT) :

#### 1. **✅ DÉJÀ FAIT : COULEURS DE VALIDATION DES SEMAINES**
- 🔵 BLEU = Semaine passée
- 🟢 VERT = Semaine en cours
- ⚪ GRISÉ = Semaines futures
**Statut** : ✅ Implémenté dans ideaux.js (lignes 653-666)

#### 2. **❌ GESTION AVANCÉE SÉANCES BONUS (PRIORITAIRE)**

**Contexte métier** : Une séance bonus peut être :
- Une séance **supplémentaire** (dépassement d'objectif)
- Une séance **de remplacement** (changement emploi du temps utilisateur)

**Logique à implémenter** :

##### A. Dans ideaux.js (modale) :
- ✅ Inputs `distance_km` et `vitesse` pour bonus DÉJÀ PRÉSENTS
- ❌ **MANQUE** : Bouton ❌ supprimer séance bonus
- ❌ **MANQUE** : Type de bonus (supplémentaire vs remplacement)

##### B. Dans plan-action.js :
- ❌ **MANQUE** : Inputs modifiables `distance_km` et `vitesse` pour bonus existants
- ✅ Bouton supprimer bonus DÉJÀ FAIT

##### C. Calcul statistiques proratisé :
- ❌ **MANQUE TOTALEMENT** : Logique de calcul proratisé pour statistiques
- Formule : `(séances_réelles / séances_prévues) * 100`
- Les bonus de type "supplémentaire" augmentent le numérateur
- Les bonus de type "remplacement" remplacent une séance prévue

#### 3. **❌ DÉFLOUTAGE/FLOUTAGE IMAGE MOTIVANTE (CRITIQUE)**

**Logique métier** (doc "ancrage") :
```
- Image floue à 100% au départ
- Défloutage progressif selon % progression du palier
- Formule : blur(100px - (progression% * 1px))
- Si progression baisse (séances manquées), on refloute
- Bonus supplémentaires accélèrent le défloutage
```

**À implémenter** :
- ❌ Calcul dynamique du `filter: blur(Xpx)` sur l'image
- ❌ Mise à jour en temps réel lors validation séances
- ❌ Affichage dans ideaux.js (card idéaux)
- ❌ Affichage dans plan-action.js (en-tête)
- ❌ Stockage `progression_palier: number` dans table `ideaux`

#### 4. **✅ DÉJÀ FAIT : Bouton "📊 Voir mon plan d'action"**
**Statut** : ✅ Implémenté (ligne 713 ideaux.js) - Change après validation

#### 5. **✅ DÉJÀ FAIT : Validation visuelle séances bonus**
**Statut** : ✅ Implémenté dans les deux pages

---

## 🔜 AMÉLIORATIONS FUTURES (APRÈS TODO ACTUELLE)
- gerer comportement date et heure jeune pour generation plan de reprise + type de reprise et faire le lien avec bdd et cetose  
- 
- Réferentiel alimentaire avec quantite basé sur cuilliere 
a soupe ou outil de mesure facile a visualiser propose plusieurs type avec une transco simple pour gestion des stat 
- ⏰ **Affichage date/heure à chaque connexion** (ligne 43)
- finir page reprise et validation lie a la reprise du jeune cf base de travail reprise apres jeune 
- creer base de travail pour les autre cycle du jeun een rapport avec la chronologie jeune
(- 🧘 Préparation aux jeûnes alimentaire → 📋 PLAN D'ACTION CRÉÉ (voir section dédiée ci-dessous)
- 🙏 Préparation au jeûne spirituel
- Gerer la partie Post jeûne :
- 🥗 Partie alimentation
- 🙏 Partie spirituelle
-Gerer la partie gain après jeûne à integrer dans sa routine 
- 🔗 Lier ideaux avec suivi jour ou app normal
- 🎨 Possibilité de créer soi-même son défi )
- 🍔 Gérer le souci avec les fast food + -voir gestion fast food avec new maj referentiel comment ca s adapte 
- 📚 Partie dev perso
- Gerer la partie planning de vie 
( dans l esprit on a un planning structuré au travail pour atteindre ses 
objectifs de vie, du coup avoir ce mindset pour son quotidien avec l etat  
desprit d investir en soir ou notre leverage c est le temps)
- ⚡ Revoir lutte contre la dérive
- 📝 Revoir cahier des charges et technique
- 📈 Liant de tout ça avec stat tableaux de bord 

Creer la regle car il y a tjr des chise a ameliorer rien est parfa et on peut pas attendre
 le moment parfait la percfetion pour commencer donc decuder 
 des tache qui feront que meme s il y a la p ca ne se subttue pas a nous, 
 notre intuition et que on sait ce qu on doit faire il faut juste le 
 faire avec serieux et application dans l esprit de l homme de babylone
  et gardant son puvoi r de vlonte on n asthesiant pas sa parole 
   en faisant ce qu ona  dit qu on allait faire en etant fidele d
   ans le peux regle 1 oui 1non  et pour moi des que le jeune commence 
   debut New era je ne veux plus être celle d avant ou adopter tes comportement
    qui la caracterise et la refasse ressurgir donc ca sera la marque du strict
     on dit on fait etre rigide dans cette aspect en aidant appuyant chaque
      instant par Dieu i can do it !

═══════════════════════════════════════════════════════════════════════════════
📋 PLAN D'ACTION : PRÉPARATION AU JEÛNE ALIMENTAIRE (ÉTAPE 1)
═══════════════════════════════════════════════════════════════════════════════

📖 RÉFÉRENCE DOCUMENT : `/docs/Préparation aux jeune` (contient l'exemple complet du parcours utilisateur)

🎯 OBJECTIF : Implémenter une interface de suivi progressif de préparation au jeûne sur 30 jours
avec 9 critères débloqués progressivement (J-30 → J-0)

───────────────────────────────────────────────────────────────────────────────
🗂️ PHASE 1 : STRUCTURE BASE DE DONNÉES
───────────────────────────────────────────────────────────────────────────────

### 1.1 Créer table `preparations_jeune` dans Supabase

```sql
CREATE TABLE preparations_jeune (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date_jeune_prevu DATE NOT NULL,
  date_debut_preparation DATE NOT NULL,
  duree_jeune_jours INTEGER DEFAULT 5,
  criteres_valides JSONB DEFAULT '[]'::jsonb,
  message_perso TEXT,
  poids_debut NUMERIC(5,2),
  statut VARCHAR(20) DEFAULT 'en_cours', -- en_cours, termine, abandonne
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_preparations_user ON preparations_jeune(user_id);
CREATE INDEX idx_preparations_statut ON preparations_jeune(statut);
```

### 1.2 Enrichir table `repas_reels` (champs existants + nouveaux)

```sql
ALTER TABLE repas_reels ADD COLUMN IF NOT EXISTS plage_alimentaire_minutes INTEGER;
ALTER TABLE repas_reels ADD COLUMN IF NOT EXISTS respect_19h BOOLEAN DEFAULT true;
ALTER TABLE repas_reels ADD COLUMN IF NOT EXISTS action_post_repas VARCHAR(50); -- marche, menage, autre
ALTER TABLE repas_reels ADD COLUMN IF NOT EXISTS preparation_jeune_id UUID REFERENCES preparations_jeune(id);
```

### 1.3 Créer table `criteres_preparation_jeune` (référentiel)

```sql
CREATE TABLE criteres_preparation_jeune (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL, -- j30_quantites, j17_feculents, etc.
  jour_declenchement INTEGER NOT NULL, -- -30, -17, -14, -12, -7, 0
  titre TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  ordre INTEGER NOT NULL
);

-- Insertion des 9 critères
INSERT INTO criteres_preparation_jeune (code, jour_declenchement, titre, description, instructions, ordre) VALUES
('j30_quantites', -30, 'Respect strict des quantités', 'Réapprendre à ton corps ce qu''est une vraie portion', 'À chaque repas, valide que tu as respecté les portions recommandées', 1),
('j17_feculents', -17, 'Pas de féculents le soir', 'Préparer ton corps à brûler ses réserves', 'Du lundi au dimanche, supprime riz, pâtes, pain au dîner', 2),
('j17_action', -17, 'Action post-repas immédiate', 'Favoriser la digestion et éviter la léthargie', 'Après chaque repas : marche de 10 min ou ménage', 3),
('j14_transformes', -14, 'Éliminer les produits transformés', 'Nettoyer ton alimentation', 'Plus de plats préparés, biscuits industriels, fast food', 4),
('j14_sucreries', -14, 'Supprimer les sucreries', 'Stabiliser ta glycémie', 'Plus de bonbons, chocolat, desserts sucrés', 5),
('j12_jeune', -12, 'Jeûne de préparation (2 jours)', 'Test métabolique avant le grand jeûne', 'Réaliser un jeûne complet de 48h', 6),
('j7_hydratation', -7, 'Hydratation optimale (2L/jour)', 'Préparer tes reins et ton foie', 'Boire 2 litres d''eau minimum chaque jour', 7),
('j7_heure_19h', -7, 'Repas terminés avant 19h', 'Créer une fenêtre de jeûne nocturne', 'Dernier repas de la journée avant 19h00', 8),
('j7_plage_45min', -7, 'Plage alimentaire 45 minutes max', 'Concentrer la digestion', 'Chaque repas doit durer maximum 45 minutes', 9);
```

───────────────────────────────────────────────────────────────────────────────
🖥️ PHASE 2 : CRÉATION PAGE `/pages/preparation-jeune.js`
───────────────────────────────────────────────────────────────────────────────

### 2.1 Structure de la page

**Fichier** : `/pages/preparation-jeune.js`

**Fonctionnalités** :
- Timeline visuelle J-30 → J-0
- Affichage progressif des 9 critères avec déverrouillage par date
- Barre de progression globale (X/9 critères validés)
- Message personnel à soi-même
- Bouton "Lancer mon jeûne" (actif uniquement si 9/9 validés)
- Lien vers `/jeune.js` avec contexte pré-rempli

**Composants à créer** :
- `<TimelinePreparation />` : affichage chronologique des critères
- `<CritereCard />` : carte individuelle par critère (statut, instructions, progression)
- `<ProgressionGlobale />` : barre de progression + statistiques

### 2.2 États React principaux

```javascript
const [preparationActive, setPreparationActive] = useState(null);
const [criteres, setCriteres] = useState([]);
const [criteresValides, setCriteresValides] = useState([]);
const [dateJeunePrevu, setDateJeunePrevu] = useState('');
const [jourActuel, setJourActuel] = useState(0); // J-30, J-17, etc.
const [messagePerso, setMessagePerso] = useState('');
const [poidsDebut, setPoidsDebut] = useState(null);
```

### 2.3 Logique de calcul des jours

```javascript
function calculerJourActuel(dateJeunePrevu) {
  const today = new Date();
  const dateJeune = new Date(dateJeunePrevu);
  const diffTime = dateJeune - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return -diffDays; // Retourne J-30, J-17, etc.
}

function critereEstDebloque(critere, jourActuel) {
  return jourActuel >= critere.jour_declenchement;
}
```

───────────────────────────────────────────────────────────────────────────────
🔧 PHASE 3 : ENRICHISSEMENT `components/RepasBloc.js`
───────────────────────────────────────────────────────────────────────────────

### 3.1 Détections automatiques à ajouter

#### A. Détection repas après 19h (si J-7 ou moins)

```javascript
// Ajouter dans RepasBloc.js après la saisie de l'heure
const [alertePreparationJeune, setAlertePreparationJeune] = useState(null);

useEffect(() => {
  async function checkPreparationJeune() {
    // Récupérer la préparation active de l'utilisateur
    const { data: prep } = await supabase
      .from('preparations_jeune')
      .select('*')
      .eq('user_id', userId)
      .eq('statut', 'en_cours')
      .single();
    
    if (!prep) return;
    
    const jourActuel = calculerJourActuel(prep.date_jeune_prevu);
    
    // Si J-7 ou moins et repas après 19h
    if (jourActuel >= -7 && heureRepas >= '19:00') {
      setAlertePreparationJeune({
        type: 'warning',
        message: `Tu es à J${jourActuel} : les repas doivent être terminés avant 19h.`,
        suggestion: 'Pense à avancer l\'heure de ton dîner progressivement.'
      });
    }
    
    // Si J-17 ou moins et féculents le soir
    if (jourActuel >= -17 && type === 'Dîner' && categorie === 'féculent') {
      setAlertePreparationJeune({
        type: 'error',
        message: `Tu es à J${jourActuel} : les féculents ne sont plus autorisés le soir.`,
        suggestions: ['Protéines (poulet, poisson)', 'Légumes à volonté', 'Soupe de légumes']
      });
    }
  }
  
  checkPreparationJeune();
}, [heureRepas, categorie, type]);
```

#### B. Tracking plage alimentaire

```javascript
// Ajouter champs dans le formulaire
const [heureDebut, setHeureDebut] = useState('');
const [heureFin, setHeureFin] = useState('');

function calculerPlageAlimentaire(debut, fin) {
  const [h1, m1] = debut.split(':').map(Number);
  const [h2, m2] = fin.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}

// Alerte si > 45 min et J-7 ou moins
if (jourActuel >= -7 && plageMinutes > 45) {
  setAlertePreparationJeune({
    type: 'info',
    message: `Ton repas a duré ${plageMinutes} minutes. Objectif : 45 min max.`,
    conseil: 'Concentre-toi sur ton repas, mange en conscience.'
  });
}
```

### 3.2 Bouton "Voir mes idées de repas" (si féculents détectés)

```javascript
// Modale avec suggestions de repas sans féculents
const suggestionsRepasSoir = [
  { nom: 'Salade complète', ingredients: 'Salade verte + thon + œuf + tomates' },
  { nom: 'Soupe de légumes', ingredients: 'Carottes, courgettes, poireaux, céleri' },
  { nom: 'Protéine + légumes vapeur', ingredients: 'Poulet + haricots verts + brocolis' },
  { nom: 'Poisson + ratatouille', ingredients: 'Saumon + légumes du soleil' },
  { nom: 'Omelette + salade', ingredients: '2-3 œufs + champignons + épinards' }
];
```

───────────────────────────────────────────────────────────────────────────────
📊 PHASE 4 : TABLEAU DE BORD — NOTIFICATION
───────────────────────────────────────────────────────────────────────────────

### 4.1 Bannière contextuelle dans `/pages/tableau-de-bord.js`

```javascript
// Vérifier si préparation active
const { data: prep } = await supabase
  .from('preparations_jeune')
  .select('*, criteres_valides')
  .eq('user_id', userId)
  .eq('statut', 'en_cours')
  .single();

if (prep) {
  const jourActuel = calculerJourActuel(prep.date_jeune_prevu);
  const progression = prep.criteres_valides.length;
  
  return (
    <div style={{ background: '#e3f2fd', padding: 16, borderRadius: 8, marginBottom: 16 }}>
      <div style={{ fontWeight: 700 }}>🌙 Préparation au jeûne en cours</div>
      <div>Tu es à J{jourActuel} — {progression}/9 critères validés</div>
      <button onClick={() => router.push('/preparation-jeune')}>
        Voir ma préparation
      </button>
    </div>
  );
}
```

### 4.2 Notifications de paliers (déclenchées automatiquement)

```javascript
// Fonction serverless ou cron job (optionnel)
const paliers = [-30, -17, -14, -12, -7];

paliers.forEach(palier => {
  if (jourActuel === palier) {
    // Afficher notification
    envoyerNotification({
      titre: `Nouveau palier : J${palier}`,
      message: 'De nouveaux critères sont maintenant actifs !',
      lien: '/preparation-jeune'
    });
  }
});
```

───────────────────────────────────────────────────────────────────────────────
🔗 PHASE 5 : INTÉGRATION AVEC `/pages/jeune.js`
───────────────────────────────────────────────────────────────────────────────

### 5.1 Pré-remplissage du jeûne depuis la préparation

```javascript
// Dans /pages/jeune.js
useEffect(() => {
  async function chargerContextePreparation() {
    const { data: prep } = await supabase
      .from('preparations_jeune')
      .select('*')
      .eq('user_id', userId)
      .eq('statut', 'termine')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (prep) {
      setPoidsDepart(prep.poids_debut);
      setMessagePerso(prep.message_perso);
      setDureeJeune(prep.duree_jeune_jours);
      // Afficher message de félicitations
      setShowSuccessPreparation(true);
    }
  }
  
  chargerContextePreparation();
}, []);
```

### 5.2 Bouton conditionnel "Lancer mon jeûne"

```javascript
// Dans /pages/preparation-jeune.js
const tousLescriteresValides = criteresValides.length === 9;

<button
  disabled={!tousLescriteresValides}
  onClick={async () => {
    // Marquer la préparation comme terminée
    await supabase
      .from('preparations_jeune')
      .update({ statut: 'termine' })
      .eq('id', preparationActive.id);
    
    // Rediriger vers /jeune.js
    router.push('/jeune');
  }}
>
  {tousLescriteresValides ? '🚀 Lancer mon jeûne' : '🔒 Compléter la préparation'}
</button>
```

───────────────────────────────────────────────────────────────────────────────
📈 PHASE 6 : STATISTIQUES & EXPORT
───────────────────────────────────────────────────────────────────────────────

### 6.1 Bilan de préparation (affichage au J-0)

```javascript
const bilanPreparation = {
  duree_totale: 30,
  criteres_valides: 9,
  poids_debut: 72.4,
  poids_fin: 69.8,
  perte_poids: -2.6,
  extras_consommes: 3,
  repas_en_conscience: 89,
  taux_reussite: 98.9
};
```

### 6.2 Export PDF du bilan (optionnel)

```javascript
import jsPDF from 'jspdf';

function exporterBilan() {
  const doc = new jsPDF();
  doc.text('Bilan de préparation au jeûne', 10, 10);
  doc.text(`Durée : ${bilanPreparation.duree_totale} jours`, 10, 20);
  doc.text(`Poids début : ${bilanPreparation.poids_debut} kg`, 10, 30);
  doc.text(`Poids fin : ${bilanPreparation.poids_fin} kg`, 10, 40);
  doc.text(`Perte : ${bilanPreparation.perte_poids} kg`, 10, 50);
  doc.save('bilan-preparation-jeune.pdf');
}
```

───────────────────────────────────────────────────────────────────────────────
✅ CHECKLIST D'IMPLÉMENTATION
───────────────────────────────────────────────────────────────────────────────

### Base de données
- [ ] Créer table `preparations_jeune`
- [ ] Créer table `criteres_preparation_jeune` + insérer les 9 critères
- [ ] Enrichir table `repas_reels` (nouveaux champs)
- [ ] Tester les requêtes SQL

### Page principale
- [ ] Créer `/pages/preparation-jeune.js`
- [ ] Composant `<TimelinePreparation />`
- [ ] Composant `<CritereCard />`
- [ ] Composant `<ProgressionGlobale />`
- [ ] Logique de calcul J-30 → J-0
- [ ] Gestion message personnel
- [ ] Bouton "Lancer mon jeûne" conditionnel

### Enrichissement RepasBloc
- [ ] Détection repas après 19h (alerte si J-7)
- [ ] Détection féculents le soir (alerte si J-17)
- [ ] Tracking plage alimentaire 45 min (alerte si J-7)
- [ ] Modale suggestions repas sans féculents
- [ ] Champs action post-repas (marche/ménage)

### Intégrations
- [ ] Bannière tableau de bord (préparation active)
- [ ] Notifications paliers (J-17, J-14, J-12, J-7)
- [ ] Pré-remplissage `/jeune.js` depuis préparation
- [ ] Lien bidirectionnel préparation ↔ jeûne

### Statistiques
- [ ] Calcul bilan de préparation
- [ ] Affichage progression (poids, extras, repas)
- [ ] Export PDF (optionnel)

### Tests
- [ ] Tester parcours complet J-30 → J-0
- [ ] Tester détections automatiques dans RepasBloc
- [ ] Tester transition préparation → jeûne
- [ ] Tester affichage mobile

───────────────────────────────────────────────────────────────────────────────
📝 NOTES D'IMPLÉMENTATION
───────────────────────────────────────────────────────────────────────────────

1. **Ordre de développement recommandé** :
   - Phase 1 (BDD) → Phase 2 (page principale) → Phase 3 (RepasBloc) → 
     Phase 4 (tableau de bord) → Phase 5 (intégration jeune) → Phase 6 (stats)

2. **Priorités** :
   - 🔴 Critique : Phases 1, 2, 3 (fonctionnalités core)
   - 🟡 Important : Phases 4, 5 (UX et intégration)
   - 🟢 Nice-to-have : Phase 6 (stats avancées et export)

3. **Durée estimée** :
   - Phase 1 : 1h (SQL + tests)
   - Phase 2 : 4h (page + composants)
   - Phase 3 : 3h (logique détection)
   - Phase 4 : 1h (bannières)
   - Phase 5 : 2h (intégration)
   - Phase 6 : 2h (stats)
   - **TOTAL : ~13h de développement**

4. **Dépendances** :
   - React 18+
   - Next.js
   - Supabase client
   - Date-fns (manipulation dates)
   - jsPDF (export PDF, optionnel)

═══════════════════════════════════════════════════════════════════════════════