# 🌙 TODO PARCOURS JEÛNE COMPLET - PLAN PRIORISÉ

## 📚 DOCUMENTS DE RÉFÉRENCE
- `/docs/Préparation aux jeune` (exemple parcours utilisateur étape 1)
- `/docs/Complement info page jeune` (contenus détaillés J1-J10)
- `/docs/reprise` (règles reprise alimentaire)
- `/docs/CLARIFICATION_ARCHITECTURE_JEUNE.md` (architecture validée)
- `/docs/ANALYSE_ECART_JEUNE_VS_EXISTANT.md` (état des lieux)

## 🎯 VISION GLOBALE DU PARCOURS
```
PRÉPARATION (30j) → JEÛNE (X jours) → REPRISE (2× durée) → CONSOLIDATION 45j → PORTES CONSTANCE → JEÛNES RÉCURRENTS
```

---

## 🔴 PRIORITÉ P0 - CONSOLIDER L'EXISTANT (15h)
**⚡ À FAIRE EN PREMIER - BLOQUE TOUT LE RESTE**

### 📋 Checklist P0

#### ✅ P0.1 - Compléter contenus J6-J10 (4h) ⚡ CRITIQUE
- [ ] **Fichier** : `/pages/jeune.js`
- [ ] **Référence** : `/docs/Complement info page jeune`
- [ ] Copier contenus détaillés jours 6-10 depuis doc
- [ ] Restructurer `JEUNE_DAYS_CONTENT` avec sections complètes :
  - 🧠 Esprit (détails neurosciences)
  - 🧬 Corps (autophagie, cétose, etc.)
  - 🌀 Ressenti du jour
  - 💡 Astuce pratique
  - 🙏 Parole inspirante (Bible, Islam, Conversations avec Dieu)
  - ❤️ Résumé corps
- [ ] Vérifier que tous les jours 1-10 ont structure identique

**Test de validation** :
- [ ] Jour 6 affiche contenu complet (pas "Contenu à compléter")
- [ ] Références spirituelles présentes pour chaque jour

---

#### ✅ P0.2 - Intégration Supabase : Poids réel (2h) ⚡ CRITIQUE
- [ ] **Fichier** : `/pages/jeune.js`
- [ ] **Problème actuel** : Fonction `getPoidsDepart()` retourne 72.4 kg en dur (mocké)
- [ ] Remplacer par vraie requête Supabase :
```javascript
async function getPoidsDepart() {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Option 1 : Depuis table profils
  const { data: profil } = await supabase
    .from('profils')
    .select('poids_actuel')
    .eq('user_id', user.id)
    .single();
  
  if (profil?.poids_actuel) return profil.poids_actuel;
  
  // Option 2 : Depuis historique suivi_poids (dernier enregistré)
  const { data: dernier } = await supabase
    .from('suivi_poids')
    .select('poids')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(1)
    .single();
  
  return dernier?.poids || null;
}
```

**Test de validation** :
- [ ] Poids affiché correspond au dernier saisi par l'utilisateur
- [ ] Si aucun poids, afficher "Non renseigné" avec lien vers `/profil`

---

#### ✅ P0.3 - Intégration Supabase : Repas réels (3h) ⚡ CRITIQUE
- [ ] **Fichier** : `/pages/jeune.js`
- [ ] **Problème actuel** : Fonction `getRepasRecents()` retourne fausses données
- [ ] Remplacer par vraie requête :
```javascript
async function getRepasRecents() {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: repas } = await supabase
    .from('repas_reels')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(3);
  
  return repas || [];
}

async function getDernierRepas() {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: repas } = await supabase
    .from('repas_reels')
    .select('aliment, categorie, date, type')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(1)
    .single();
  
  return repas || { aliment: "Aucun repas enregistré", categorie: "" };
}
```

**Test de validation** :
- [ ] Analyse comportementale J1 affiche les VRAIS 3 derniers repas
- [ ] Dernier repas affiché est le vrai dernier saisi
- [ ] Message adapté au VRAI profil alimentaire utilisateur

---

#### ✅ P0.4 - Table `parcours_jeune` dans Supabase (2h)
- [ ] Créer table BDD avec structure suivante :
```sql
CREATE TABLE parcours_jeune (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'preparation', 'jeune', 'reprise', 'consolidation'
  date_debut DATE NOT NULL,
  date_fin DATE,
  duree_jours INTEGER,
  statut VARCHAR(20) DEFAULT 'en_cours', -- 'en_cours', 'termine', 'abandonne'
  progression JSONB DEFAULT '{}'::jsonb,
  message_perso TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_parcours_jeune_user ON parcours_jeune(user_id);
CREATE INDEX idx_parcours_jeune_type ON parcours_jeune(type);
CREATE INDEX idx_parcours_jeune_statut ON parcours_jeune(statut);

ALTER TABLE parcours_jeune ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own parcours" ON parcours_jeune
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own parcours" ON parcours_jeune
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own parcours" ON parcours_jeune
  FOR UPDATE USING (auth.uid() = user_id);
```

**Test de validation** :
- [ ] Table créée avec toutes les colonnes
- [ ] Indexes créés
- [ ] RLS activé

---

#### ✅ P0.5 - Stockage jeûne en BDD (au lieu de localStorage) (4h)
- [ ] **Fichier** : `/pages/jeune.js`
- [ ] **Problème actuel** : Tout est stocké en localStorage (volatile, non synchronisé)
- [ ] Créer jeûne dans `parcours_jeune` au démarrage
- [ ] Sauvegarder :
  - Jours validés
  - Outils utilisés
  - Message personnel
  - Progression
- [ ] Garder localStorage uniquement comme cache

**Test de validation** :
- [ ] Jeûne persiste après rechargement page
- [ ] Consultation possible depuis autre appareil
- [ ] Historique des jeûnes accessible

---

## 🟡 PRIORITÉ P1 - CRÉER LE CONTINUUM (30h)
**⚡ À FAIRE APRÈS P0 - WORKFLOW COMPLET**

### 📋 Checklist P1

#### ✅ P1.1 - Créer page `/preparation-jeune.js` (15h) ⚡ HAUTE PRIORITÉ
- [ ] **Statut** : Page n'existe pas actuellement
- [ ] **Référence** : `/docs/Préparation aux jeune` (exemple utilisateur complet)
- [ ] Créer page Next.js `/pages/preparation-jeune.js`
- [ ] Implémenter timeline J-30 → J-0
- [ ] 9 critères progressifs (voir détails ci-dessous)
- [ ] Barre de progression 0/9 → 9/9
- [ ] Message personnel personnalisé
- [ ] Notifications clés (J-17, J-14, J-12, J-7)
- [ ] Bouton "Lancer mon jeûne" (actif si 9/9 validés)

**9 critères à suivre** :
1. **J-30** : Quantités (Réduire progressivement portions)
2. **J-17** : Féculents midi uniquement (plus le soir)
3. **J-14** : 1 repas/jour light
4. **J-12** : Fenêtre alimentaire 8h (ex: 12h-20h)
5. **J-10** : Petit-déjeuner simple (fruits, yaourt)
6. **J-7** : Zéro extras (aucun écart)
7. **J-5** : Pleine conscience repas (manger lentement)
8. **J-3** : Hydratation renforcée (2L+ eau/jour)
9. **J-1** : Dernier repas avant 18h

**Détection automatique dans RepasBloc.js** :
- [ ] Enrichir `/components/RepasBloc.js` pour détecter :
  - Féculents le soir (après J-17)
  - Quantités excessives
  - Fenêtre alimentaire dépassée
  - Extras pendant période J-7 à J-0

**Test de validation** :
- [ ] Timeline s'affiche correctement
- [ ] Critères se débloquent aux bonnes dates
- [ ] RepasBloc détecte violations et alerte utilisateur
- [ ] Bouton "Lancer jeûne" actif seulement si 9/9 validés
- [ ] Lien vers `/jeune.js` avec contexte pré-rempli

---

#### ✅ P1.2 - Enrichir page `/reprise-alimentaire.js` (10h)
- [ ] **Fichier** : `/pages/reprise alimentaire après jeûne.js`
- [ ] **Problème actuel** : Page presque vide
- [ ] **Référence** : `/docs/reprise`
- [ ] Calcul automatique durée : `duree_reprise = duree_jeune × 2`
  - Jeûne 3j → Reprise 4-5j
  - Jeûne 5j → Reprise 7-8j
  - Jeûne 7j → Reprise 10-12j
  - Jeûne 10j → Reprise 15-18j
- [ ] Planning détaillé jour par jour :
  - **J1-J3** : Jus fruits dilués, bouillons, compotes
  - **J4-J7** : Fruits crus, légumes cuits, yaourts
  - **J8-J12** : Protéines légères (poisson, œufs), céréales
  - **J12+** : Retour progressif normal
- [ ] Affichage aliments autorisés par phase
- [ ] Validation quotidienne
- [ ] Bouton "Commencer ma consolidation 45 jours" (dernier jour)

**Test de validation** :
- [ ] Durée calculée automatiquement depuis durée jeûne
- [ ] Aliments affichés correspondent à la phase du jour
- [ ] Validation quotidienne enregistrée
- [ ] Lien vers consolidation activé au dernier jour reprise

---

#### ✅ P1.3 - Composant `<TransitionPhase />` (3h)
- [ ] **Fichier** : `/components/TransitionPhase.js` (à créer)
- [ ] Créer composant réutilisable pour transitions entre phases
- [ ] Props :
  - `fromPhase` : "preparation" | "jeune" | "reprise" | "consolidation"
  - `toPhase` : "jeune" | "reprise" | "consolidation" | "portes"
  - `stats` : Objet avec statistiques du parcours
  - `onContinue` : Callback navigation
- [ ] Design cohérent avec l'app
- [ ] Affichage différent selon transition

**Exemple d'affichage** :
```
🎉 Préparation terminée !
✅ 9/9 critères validés
📈 Prêt pour votre jeûne de 5 jours

[Lancer mon jeûne →]
```

**Test de validation** :
- [ ] Composant s'affiche correctement pour chaque transition
- [ ] Boutons fonctionnels
- [ ] Design responsive

---

#### ✅ P1.4 - Lier les 3 pages avec workflow automatique (2h)
- [ ] Modification `/preparation-jeune.js` :
  - Bouton vers `/jeune.js` avec contexte (durée prévue, critères validés)
- [ ] Modification `/jeune.js` :
  - Charger contexte préparation
  - Bouton vers `/reprise` avec contexte (durée jeûne, date début)
- [ ] Modification `/reprise.js` :
  - Charger contexte jeûne
  - Bouton vers `/consolidation` avec contexte

**Test de validation** :
- [ ] Parcours complet prépa→jeûne→reprise fonctionne
- [ ] Données passent correctement entre pages
- [ ] Aucune rupture dans le workflow

---

## 🟢 PRIORITÉ P2 - CONSOLIDATION & PORTES (35h)
**⚡ À FAIRE APRÈS P1 - ANCRER LES GAINS**

### 📋 Checklist P2

#### ✅ P2.1 - Créer page `/consolidation-45-jours.js` (25h)
- [ ] **Statut** : Page n'existe pas
- [ ] **Référence** : `/docs/CLARIFICATION_ARCHITECTURE_JEUNE.md`
- [ ] Créer page Next.js `/pages/consolidation-45-jours.js`
- [ ] Planning hebdomadaire structuré (7 semaines)
- [ ] **Intégration progressive jeûnes** :
  - **Semaine 1-2** : Jeûne intermittent 16h (tous les jours)
  - **Semaine 3-4** : Jeûne 24h (lundi)
  - **Semaine 5-6** : Jeûne 48h possible (weekend)
  - **Semaine 7** : Jeûne 3j possible (validation finale)
- [ ] **Suivi gains conservés** :
  - Évolution poids depuis post-reprise
  - Nombre extras par semaine
  - Score satiété moyen
  - Jours sans sucre consécutifs
- [ ] **Défis comportementaux** (liste à piocher) :
  - "Cuisiner tous mes repas cette semaine"
  - "Aucune commande/fast-food pendant 10 jours"
  - "Marcher 30min après chaque repas"
  - "Méditer 10min avant chaque repas"
- [ ] **Indicateurs de réussite** :
  - Progression J/45
  - Taux conformité (jours respectés / jours écoulés)
  - Badge "En bonne voie" / "Vigilance" / "Dérive"
- [ ] Bouton "Passer les Portes de Constance" (actif à J45 si critères OK)

**Test de validation** :
- [ ] Planning hebdomadaire s'affiche correctement
- [ ] Jeûnes débloqués progressivement selon semaine
- [ ] Gains trackés quotidiennement depuis Supabase
- [ ] Défis disponibles et validables
- [ ] À J45, activation Portes si taux conformité ≥ 80%

---

#### ✅ P2.2 - Portes de Constance dans `/tableau-de-bord.js` (10h)
- [ ] **Fichier** : `/pages/tableau-de-bord.js`
- [ ] **Référence** : `/docs/CLARIFICATION_ARCHITECTURE_JEUNE.md`
- [ ] Calcul automatique des 3 critères depuis Supabase :
  - **Porte 1** : 7 jours consécutifs sans excès
  - **Porte 2** : 3 jours consécutifs sans sucre ni grignotage
  - **Porte 3** : Jeûne sans compensation (pas de suralimentation post-reprise)
- [ ] Affichage messages symboliques :
```
🚪 PORTE 1 - DISCIPLINE
✅ 7 jours consécutifs sans excès
"Tu as démontré ta maîtrise. Continue."

🚪 PORTE 2 - SOBRIÉTÉ
✅ 3 jours sans sucre ni grignotage
"Tu es libre des chaînes de l'impulsion."

🚪 PORTE 3 - ÉQUILIBRE
✅ Jeûne terminé sans compensation
"Tu as respecté le cycle. Tu es prêt."
```
- [ ] Badge de validation finale "🎖️ Portes Franchies"

**Test de validation** :
- [ ] Portes s'activent APRÈS consolidation 45j (pas avant)
- [ ] Critères calculés depuis historique réel Supabase
- [ ] Messages affichés correctement
- [ ] Badge affiché si 3/3 portes franchies

---

## 🔵 PRIORITÉ P3 - JEÛNES RÉCURRENTS (10h)
**⚡ À FAIRE APRÈS P2 - ROUTINE DE VIE**

### 📋 Checklist P3

#### ✅ P3.1 - Mode "jeûne récurrent" dans `/jeune.js` (6h)
- [ ] **Fichier** : `/pages/jeune.js`
- [ ] Ajouter option "Jeûne récurrent" (ex: chaque lundi, tous les 15j, etc.)
- [ ] Planification automatique dans calendrier
- [ ] Distinction jeûnes courts (3-7j) vs longs (10+j)
- [ ] Notifications rappel avant début jeûne

**Test de validation** :
- [ ] Option récurrent disponible et fonctionnelle
- [ ] Planification automatique fonctionne
- [ ] Notifications envoyées correctement

---

#### ✅ P3.2 - Contrôle fréquence jeûnes longs (2h) ⚠️ RÈGLE CRITIQUE
- [ ] **Règle** : Jeûnes ≥10 jours limités à 1×/trimestre (4×/an MAX)
- [ ] Vérifier historique :
```javascript
async function peutCommencerJeuneLong(duree) {
  if (duree < 10) return true; // Jeûnes courts OK
  
  const { data: jeunesLongs } = await supabase
    .from('parcours_jeune')
    .select('date_debut')
    .eq('type', 'jeune')
    .gte('duree_jours', 10)
    .gte('date_debut', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) // 3 derniers mois
    .eq('statut', 'termine');
  
  return jeunesLongs.length === 0; // Bloquer si jeûne long déjà fait
}
```
- [ ] Message pédagogique si blocage :
```
⚠️ Jeûnes longs (≥10 jours) limités à 1×/trimestre

Vous avez déjà effectué un jeûne long il y a XX jours.
Prochain jeûne long autorisé le : JJ/MM/AAAA

💡 En attendant, vous pouvez :
- Jeûnes courts (3-7j) sans limite
- Jeûnes intermittents quotidiens
- Consolider vos acquis
```

**Test de validation** :
- [ ] Blocage effectif si jeûne long déjà fait ce trimestre
- [ ] Message clair avec date prochain jeûne autorisé
- [ ] Alternatives proposées

---

#### ✅ P3.3 - Historique et statistiques (2h)
- [ ] **Nouvelle page** : `/pages/historique-jeunes.js`
- [ ] Afficher tous les jeûnes passés :
  - Date début/fin
  - Durée
  - Type (court/long)
  - Statut (terminé/abandonné)
  - Poids avant/après
- [ ] Statistiques comparatives :
  - Graphique évolution poids sur jeûnes
  - Fréquence jeûnes par mois
  - Taux réussite (terminé vs abandonné)
  - Durée moyenne jeûnes

**Test de validation** :
- [ ] Tous les jeûnes affichés
- [ ] Graphiques pertinents et lisibles
- [ ] Filtres fonctionnels (par date, par type, etc.)

---

## 📊 RÉCAPITULATIF TEMPS & ORDRE D'EXÉCUTION

| Priorité | Objectif | Temps estimé | Ordre | Statut |
|----------|----------|--------------|-------|--------|
| **P0** | Consolider l'existant | 15h | **1er** | ❌ À FAIRE |
| **P1** | Continuum prépa→jeûne→reprise | 30h | **2ème** | ❌ Après P0 |
| **P2** | Consolidation 45j + Portes | 35h | **3ème** | ❌ Après P1 |
| **P3** | Jeûnes récurrents | 10h | **4ème** | ❌ Après P2 |
| **TOTAL** | | **90h** | **~9 semaines** | |

---

## 🎯 PLANNING SUGGÉRÉ (9 semaines)

```
SEMAINE 1-2 : P0 (15h)
├─ P0.1 : Contenus J6-J10 (4h)
├─ P0.2 : Poids Supabase (2h)
├─ P0.3 : Repas Supabase (3h)
├─ P0.4 : Table BDD (2h)
└─ P0.5 : Stockage BDD (4h)

SEMAINE 3-5 : P1 (30h)
├─ P1.1 : /preparation-jeune.js (15h)
├─ P1.2 : /reprise-alimentaire.js (10h)
├─ P1.3 : <TransitionPhase /> (3h)
└─ P1.4 : Workflow (2h)

SEMAINE 6-8 : P2 (35h)
├─ P2.1 : /consolidation-45-jours.js (25h)
└─ P2.2 : Portes Constance (10h)

SEMAINE 9 : P3 (10h)
├─ P3.1 : Mode récurrent (6h)
├─ P3.2 : Contrôle fréquence (2h)
└─ P3.3 : Historique (2h)
```

---

## ✅ CHECKLIST GLOBALE DE VALIDATION FINALE

### ✅ Phase P0 (Existant consolidé)
- [ ] Contenus J6-J10 complets dans `/jeune.js`
- [ ] Poids réel depuis Supabase (pas mocké)
- [ ] Repas réels depuis Supabase (pas mockés)
- [ ] Table `parcours_jeune` créée et opérationnelle
- [ ] Jeûnes stockés en BDD (pas localStorage)

### ✅ Phase P1 (Continuum)
- [ ] Page `/preparation-jeune.js` fonctionnelle (9 critères)
- [ ] Page `/reprise-alimentaire.js` enrichie et fonctionnelle
- [ ] Composant `<TransitionPhase />` créé et réutilisable
- [ ] Workflow prépa→jeûne→reprise opérationnel
- [ ] Données passent correctement entre toutes les pages

### ✅ Phase P2 (Consolidation)
- [ ] Page `/consolidation-45-jours.js` fonctionnelle
- [ ] Planning hebdomadaire avec jeûnes progressifs
- [ ] Gains conservés trackés quotidiennement
- [ ] Défis comportementaux disponibles
- [ ] Portes de Constance activées après J45

### ✅ Phase P3 (Récurrent)
- [ ] Mode jeûne récurrent disponible dans `/jeune.js`
- [ ] Contrôle fréquence jeûnes longs (1×/trimestre) actif
- [ ] Message blocage clair avec alternatives
- [ ] Historique et statistiques accessibles

---

## 🚀 POUR COMMENCER IMMÉDIATEMENT

**1. Ouvrir fichier** : `/pages/jeune.js`
**2. Commencer par** : P0.1 - Compléter contenus J6-J10 (4h)
**3. Document référence** : `/docs/Complement info page jeune`
**4. Objectif** : Remplacer "Contenu à compléter" par contenus détaillés

**Prochaines étapes visibles** dans `/docs/a faire` (TODO existantes en cours).

---

**Durée totale : 90h (~2 mois à temps partiel)**
**Complexité : Moyenne-élevée**
**Impact : Transformation complète de l'expérience jeûne** 🌙
