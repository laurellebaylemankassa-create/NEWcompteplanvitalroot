const alimentsRepriseJeune = [
  // ═══════════════════════════════════════════════════════════
  // 🥤 PHASE 1 - LIQUIDES (~11% durée reprise)
  // Objectif : Prévenir syndrome de réalimentation, réhydratation progressive
  // ═══════════════════════════════════════════════════════════
  
  { 
    nom: "Bouillon de légumes clair", 
    categorie: "liquide", 
    sousCategorie: "Bouillon", 
    kcal: 15,
    qn: 5,
    portionDefaut: "200ml",
    unite: "ml",
    kcalParUnite: 0.075,
    mesureRecommandee: "Tasse",
    phase: 1,
    favoriseCetose: true,
    conseil: "Filtré, sans morceaux, température tiède"
  },
  { 
    nom: "Bouillon de poulet maison", 
    categorie: "liquide", 
    sousCategorie: "Bouillon", 
    kcal: 20,
    qn: 5,
    portionDefaut: "200ml",
    unite: "ml",
    kcalParUnite: 0.1,
    mesureRecommandee: "Tasse",
    phase: 1,
    favoriseCetose: true,
    conseil: "Maison uniquement, dégraissé, filtré"
  },
  { 
    nom: "Jus de carotte filtré", 
    categorie: "liquide", 
    sousCategorie: "Jus de légumes", 
    kcal: 35,
    qn: 4,
    portionDefaut: "150ml",
    unite: "ml",
    kcalParUnite: 0.23,
    mesureRecommandee: "Verre",
    phase: 1,
    favoriseCetose: false,
    conseil: "Dilué 50% eau, siroter très lentement"
  },
  { 
    nom: "Jus de concombre", 
    categorie: "liquide", 
    sousCategorie: "Jus de légumes", 
    kcal: 12,
    qn: 5,
    portionDefaut: "150ml",
    unite: "ml",
    kcalParUnite: 0.08,
    mesureRecommandee: "Verre",
    phase: 1,
    favoriseCetose: true,
    conseil: "Frais pressé, dilué avec eau"
  },
  { 
    nom: "Eau citronnée", 
    categorie: "liquide", 
    sousCategorie: "Infusion", 
    kcal: 5,
    qn: 5,
    portionDefaut: "250ml",
    unite: "ml",
    kcalParUnite: 0.02,
    mesureRecommandee: "Verre",
    phase: 1,
    favoriseCetose: true,
    conseil: "1/4 citron pressé, eau tiède"
  },
  { 
    nom: "Infusion menthe", 
    categorie: "liquide", 
    sousCategorie: "Infusion", 
    kcal: 0,
    qn: 5,
    portionDefaut: "250ml",
    unite: "ml",
    kcalParUnite: 0,
    mesureRecommandee: "Tasse",
    phase: 1,
    favoriseCetose: true,
    conseil: "Feuilles fraîches ou séchées, sans sucre"
  },
  { 
    nom: "Infusion gingembre", 
    categorie: "liquide", 
    sousCategorie: "Infusion", 
    kcal: 2,
    qn: 5,
    portionDefaut: "250ml",
    unite: "ml",
    kcalParUnite: 0.008,
    mesureRecommandee: "Tasse",
    phase: 1,
    favoriseCetose: true,
    conseil: "Gingembre frais râpé, aide digestion"
  },
  { 
    nom: "Eau de coco nature", 
    categorie: "liquide", 
    sousCategorie: "Eau végétale", 
    kcal: 45,
    qn: 4,
    portionDefaut: "200ml",
    unite: "ml",
    kcalParUnite: 0.225,
    mesureRecommandee: "Verre",
    phase: 1,
    favoriseCetose: false,
    conseil: "100% pure, réhydratation électrolytes"
  },

  // ═══════════════════════════════════════════════════════════
  // 🥬 PHASE 2 - FIBRES DOUCES (~14% durée reprise)
  // Objectif : Réactivation intestinale douce, fibres cuites
  // ═══════════════════════════════════════════════════════════
  
  { 
    nom: "Courgette cuite vapeur", 
    categorie: "légume", 
    sousCategorie: "Légume doux", 
    kcal: 20,
    qn: 5,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 0.2,
    mesureRecommandee: "Assiette creuse",
    phase: 2,
    favoriseCetose: true,
    conseil: "Bien cuite, écrasée à la fourchette"
  },
  { 
    nom: "Carotte cuite vapeur", 
    categorie: "légume", 
    sousCategorie: "Légume doux", 
    kcal: 35,
    qn: 4,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 0.35,
    mesureRecommandee: "Assiette creuse",
    phase: 2,
    favoriseCetose: false,
    conseil: "Très cuite, mixée si besoin"
  },
  { 
    nom: "Soupe de légumes sans féculents", 
    categorie: "liquide", 
    sousCategorie: "Soupe", 
    kcal: 50,
    qn: 5,
    portionDefaut: "250ml",
    unite: "ml",
    kcalParUnite: 0.2,
    mesureRecommandee: "Bol",
    phase: 2,
    favoriseCetose: true,
    conseil: "Courgette, carotte, bouillon, mixée"
  },
  { 
    nom: "Poisson blanc vapeur", 
    categorie: "protéine", 
    sousCategorie: "Poisson maigre", 
    kcal: 80,
    qn: 5,
    portionDefaut: "80g",
    unite: "g",
    kcalParUnite: 1,
    mesureRecommandee: "Pavé petit",
    phase: 2,
    favoriseCetose: true,
    conseil: "Cabillaud, colin, sole - vapeur uniquement"
  },
  { 
    nom: "Betterave cuite", 
    categorie: "légume", 
    sousCategorie: "Légume doux", 
    kcal: 45,
    qn: 4,
    portionDefaut: "80g",
    unite: "g",
    kcalParUnite: 0.56,
    mesureRecommandee: "Petite assiette",
    phase: 2,
    favoriseCetose: false,
    conseil: "Cuite vapeur, mixée, sans vinaigre"
  },
  { 
    nom: "Courge butternut cuite", 
    categorie: "légume", 
    sousCategorie: "Légume doux", 
    kcal: 40,
    qn: 5,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 0.4,
    mesureRecommandee: "Assiette creuse",
    phase: 2,
    favoriseCetose: false,
    conseil: "Cuite au four, écrasée en purée"
  },
  { 
    nom: "Purée de courgette", 
    categorie: "légume", 
    sousCategorie: "Purée", 
    kcal: 25,
    qn: 5,
    portionDefaut: "150g",
    unite: "g",
    kcalParUnite: 0.17,
    mesureRecommandee: "Bol",
    phase: 2,
    favoriseCetose: true,
    conseil: "100% courgette, sans ajout, lisse"
  },
  { 
    nom: "Compote pomme sans sucre", 
    categorie: "fruit", 
    sousCategorie: "Compote", 
    kcal: 50,
    qn: 4,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 0.5,
    mesureRecommandee: "Petite coupelle",
    phase: 2,
    favoriseCetose: false,
    conseil: "Maison ou sans sucre ajouté, lisse"
  },
  { 
    nom: "Blanc de poulet vapeur", 
    categorie: "protéine", 
    sousCategorie: "Volaille maigre", 
    kcal: 90,
    qn: 5,
    portionDefaut: "80g",
    unite: "g",
    kcalParUnite: 1.13,
    mesureRecommandee: "Petit morceau",
    phase: 2,
    favoriseCetose: true,
    conseil: "Vapeur uniquement, mâcher longtemps"
  },
  { 
    nom: "Fenouil cuit", 
    categorie: "légume", 
    sousCategorie: "Légume doux", 
    kcal: 30,
    qn: 5,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 0.3,
    mesureRecommandee: "Assiette creuse",
    phase: 2,
    favoriseCetose: true,
    conseil: "Cuit vapeur, aide digestion"
  },
  { 
    nom: "Épinards cuits", 
    categorie: "légume", 
    sousCategorie: "Légume vert", 
    kcal: 25,
    qn: 5,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 0.25,
    mesureRecommandee: "Assiette creuse",
    phase: 2,
    favoriseCetose: true,
    conseil: "Bien cuits, hachés finement"
  },

  // ═══════════════════════════════════════════════════════════
  // 🥚 PHASE 3 - PROTÉINES & LIPIDES (~18% durée reprise)
  // Objectif : Reconstruction tissulaire, maintien cétose
  // ═══════════════════════════════════════════════════════════
  
  { 
    nom: "Œuf mollet", 
    categorie: "protéine", 
    sousCategorie: "Œuf", 
    kcal: 75,
    qn: 5,
    portionDefaut: "1 unité",
    unite: "unité",
    kcalParUnite: 75,
    mesureRecommandee: "Œuf moyen",
    phase: 3,
    favoriseCetose: true,
    conseil: "Bien cuit, mâcher lentement"
  },
  { 
    nom: "Œuf poché", 
    categorie: "protéine", 
    sousCategorie: "Œuf", 
    kcal: 70,
    qn: 5,
    portionDefaut: "1 unité",
    unite: "unité",
    kcalParUnite: 70,
    mesureRecommandee: "Œuf moyen",
    phase: 3,
    favoriseCetose: true,
    conseil: "Sans matière grasse, jaune coulant"
  },
  { 
    nom: "Avocat", 
    categorie: "lipide", 
    sousCategorie: "Fruit gras", 
    kcal: 80,
    qn: 5,
    portionDefaut: "1/4 unité",
    unite: "unité",
    kcalParUnite: 320,
    mesureRecommandee: "Quart d'avocat",
    phase: 3,
    favoriseCetose: true,
    conseil: "Bien mûr, écrasé, petit à petit"
  },
  { 
    nom: "Huile d'olive vierge", 
    categorie: "lipide", 
    sousCategorie: "Huile", 
    kcal: 45,
    qn: 5,
    portionDefaut: "0.5 CS",
    unite: "CS",
    kcalParUnite: 90,
    mesureRecommandee: "Demi cuillère à soupe",
    phase: 3,
    favoriseCetose: true,
    conseil: "Première pression, sur légumes cuits"
  },
  { 
    nom: "Huile de coco", 
    categorie: "lipide", 
    sousCategorie: "Huile", 
    kcal: 45,
    qn: 5,
    portionDefaut: "0.5 CS",
    unite: "CS",
    kcalParUnite: 90,
    mesureRecommandee: "Demi cuillère à soupe",
    phase: 3,
    favoriseCetose: true,
    conseil: "Vierge, TCM favorise cétose"
  },
  { 
    nom: "Yaourt nature 0%", 
    categorie: "protéine", 
    sousCategorie: "Laitage", 
    kcal: 45,
    qn: 4,
    portionDefaut: "125g",
    unite: "g",
    kcalParUnite: 0.36,
    mesureRecommandee: "Pot individuel",
    phase: 3,
    favoriseCetose: false,
    conseil: "Nature, sans sucre, si tolérance lactose"
  },
  { 
    nom: "Saumon vapeur", 
    categorie: "protéine", 
    sousCategorie: "Poisson gras", 
    kcal: 140,
    qn: 5,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 1.4,
    mesureRecommandee: "Pavé moyen",
    phase: 3,
    favoriseCetose: true,
    conseil: "Sauvage si possible, oméga-3"
  },
  { 
    nom: "Sardines nature", 
    categorie: "protéine", 
    sousCategorie: "Poisson gras", 
    kcal: 120,
    qn: 5,
    portionDefaut: "80g",
    unite: "g",
    kcalParUnite: 1.5,
    mesureRecommandee: "Petite boîte",
    phase: 3,
    favoriseCetose: true,
    conseil: "À l'eau, égouttées, oméga-3"
  },
  { 
    nom: "Beurre clarifié (ghee)", 
    categorie: "lipide", 
    sousCategorie: "Beurre", 
    kcal: 45,
    qn: 4,
    portionDefaut: "0.5 CS",
    unite: "CS",
    kcalParUnite: 90,
    mesureRecommandee: "Demi cuillère à soupe",
    phase: 3,
    favoriseCetose: true,
    conseil: "Sans lactose, digestion facile"
  },
  { 
    nom: "Purée d'amandes", 
    categorie: "lipide", 
    sousCategorie: "Purée oléagineuse", 
    kcal: 60,
    qn: 5,
    portionDefaut: "1 cc",
    unite: "cc",
    kcalParUnite: 60,
    mesureRecommandee: "Cuillère à café rase",
    phase: 3,
    favoriseCetose: true,
    conseil: "100% amandes, sans sucre ni sel"
  },
  { 
    nom: "Fromage blanc 0%", 
    categorie: "protéine", 
    sousCategorie: "Laitage", 
    kcal: 50,
    qn: 4,
    portionDefaut: "100g",
    unite: "g",
    kcalParUnite: 0.5,
    mesureRecommandee: "Petit bol",
    phase: 3,
    favoriseCetose: false,
    conseil: "Nature, si tolérance lactose OK"
  },
  { 
    nom: "Thon au naturel", 
    categorie: "protéine", 
    sousCategorie: "Poisson maigre", 
    kcal: 100,
    qn: 5,
    portionDefaut: "80g",
    unite: "g",
    kcalParUnite: 1.25,
    mesureRecommandee: "Petite boîte",
    phase: 3,
    favoriseCetose: true,
    conseil: "Égoutté, sans huile"
  },

  // ═══════════════════════════════════════════════════════════
  // 🍠 PHASE 4 - FÉCULENTS DOUX (~57% durée reprise)
  // Objectif : Réintroduction progressive glucides, sortie cétose
  // ═══════════════════════════════════════════════════════════
  
  { 
    nom: "Patate douce", 
    categorie: "féculent", 
    sousCategorie: "Tubercule", 
    kcal: 90,
    qn: 5,
    portionDefaut: "80g",
    unite: "g",
    kcalParUnite: 1.13,
    mesureRecommandee: "Petit morceau",
    phase: 4,
    favoriseCetose: false,
    conseil: "Cuite au four, MIDI UNIQUEMENT"
  },
  { 
    nom: "Riz complet", 
    categorie: "féculent", 
    sousCategorie: "Riz", 
    kcal: 110,
    qn: 4,
    portionDefaut: "1.5 CS",
    unite: "CS",
    kcalParUnite: 73.3,
    mesureRecommandee: "Cuillère à soupe",
    phase: 4,
    favoriseCetose: false,
    conseil: "Bien cuit, petite quantité, midi"
  },
  { 
    nom: "Quinoa", 
    categorie: "féculent", 
    sousCategorie: "Graine", 
    kcal: 100,
    qn: 5,
    portionDefaut: "1.5 CS",
    unite: "CS",
    kcalParUnite: 66.7,
    mesureRecommandee: "Cuillère à soupe",
    phase: 4,
    favoriseCetose: false,
    conseil: "Bien rincé, bien cuit, midi"
  },
  { 
    nom: "Flocons d'avoine", 
    categorie: "féculent", 
    sousCategorie: "Céréale", 
    kcal: 70,
    qn: 4,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 35,
    mesureRecommandee: "Cuillère à soupe",
    phase: 4,
    favoriseCetose: false,
    conseil: "Cuits dans eau/lait végétal, matin"
  },
  { 
    nom: "Sarrasin", 
    categorie: "féculent", 
    sousCategorie: "Graine", 
    kcal: 95,
    qn: 5,
    portionDefaut: "1.5 CS",
    unite: "CS",
    kcalParUnite: 63.3,
    mesureRecommandee: "Cuillère à soupe",
    phase: 4,
    favoriseCetose: false,
    conseil: "Sans gluten, bien cuit, midi"
  },
  { 
    nom: "Lentilles corail", 
    categorie: "féculent", 
    sousCategorie: "Légumineuse", 
    kcal: 80,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 40,
    mesureRecommandee: "Cuillère à soupe",
    phase: 4,
    favoriseCetose: false,
    conseil: "Plus digestes que vertes, midi"
  },
  { 
    nom: "Pain complet au levain", 
    categorie: "féculent", 
    sousCategorie: "Pain", 
    kcal: 60,
    qn: 3,
    portionDefaut: "1 tranche fine",
    unite: "tranche",
    kcalParUnite: 60,
    mesureRecommandee: "Tranche fine",
    phase: 4,
    favoriseCetose: false,
    conseil: "Levain uniquement, grillé, midi"
  },
  { 
    nom: "Banane mûre", 
    categorie: "fruit", 
    sousCategorie: "Fruit frais", 
    kcal: 90,
    qn: 4,
    portionDefaut: "1/2 unité",
    unite: "unité",
    kcalParUnite: 180,
    mesureRecommandee: "Demi banane",
    phase: 4,
    favoriseCetose: false,
    conseil: "Bien mûre, écrasée si besoin"
  },
  { 
    nom: "Pois chiches cuits", 
    categorie: "féculent", 
    sousCategorie: "Légumineuse", 
    kcal: 90,
    qn: 5,
    portionDefaut: "2 CS",
    unite: "CS",
    kcalParUnite: 45,
    mesureRecommandee: "Cuillère à soupe",
    phase: 4,
    favoriseCetose: false,
    conseil: "Bien cuits, écrasés, midi"
  },
  { 
    nom: "Pomme de terre vapeur", 
    categorie: "féculent", 
    sousCategorie: "Tubercule", 
    kcal: 70,
    qn: 3,
    portionDefaut: "80g",
    unite: "g",
    kcalParUnite: 0.88,
    mesureRecommandee: "Petite pomme de terre",
    phase: 4,
    favoriseCetose: false,
    conseil: "Vapeur uniquement, petite, midi"
  },
  { 
    nom: "Courge spaghetti", 
    categorie: "légume", 
    sousCategorie: "Courge", 
    kcal: 30,
    qn: 5,
    portionDefaut: "150g",
    unite: "g",
    kcalParUnite: 0.2,
    mesureRecommandee: "Assiette creuse",
    phase: 4,
    favoriseCetose: true,
    conseil: "Alternative féculents, toute journée OK"
  },
  { 
    nom: "Millet", 
    categorie: "féculent", 
    sousCategorie: "Céréale", 
    kcal: 100,
    qn: 4,
    portionDefaut: "1.5 CS",
    unite: "CS",
    kcalParUnite: 66.7,
    mesureRecommandee: "Cuillère à soupe",
    phase: 4,
    favoriseCetose: false,
    conseil: "Sans gluten, digeste, midi"
  },
];

// Export par défaut
export default alimentsRepriseJeune;

// Export nommé pour compatibilité
export { alimentsRepriseJeune };

// ═══════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════

/**
 * Récupère les aliments d'une phase spécifique
 * @param {number} phase - Numéro de la phase (1-4)
 * @returns {Array} - Tableau des aliments de la phase
 */
export function getAlimentsParPhase(phase) {
  return alimentsRepriseJeune.filter(aliment => aliment.phase === phase);
}

/**
 * Récupère tous les aliments favorisant la cétose
 * @returns {Array} - Tableau des aliments cétogènes
 */
export function getAlimentsCetogenes() {
  return alimentsRepriseJeune.filter(aliment => aliment.favoriseCetose === true);
}

/**
 * Récupère les aliments par catégorie
 * @param {string} categorie - Catégorie recherchée
 * @returns {Array} - Tableau des aliments de la catégorie
 */
export function getAlimentsParCategorie(categorie) {
  return alimentsRepriseJeune.filter(aliment => aliment.categorie === categorie);
}

/**
 * Calcule les kcal pour une quantité personnalisée
 * @param {Object} aliment - L'aliment du référentiel
 * @param {number} quantite - La quantité saisie
 * @returns {number} - Calories calculées
 */
export function calculerKcal(aliment, quantite) {
  return Math.round(aliment.kcalParUnite * quantite);
}
