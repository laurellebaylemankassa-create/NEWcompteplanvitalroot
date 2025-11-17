// Référentiel des 10 mini-défis, conforme au cahier des charges et à la table Supabase 'defis'.
// Chaque défi respecte la structure : id, type, description, durée, thème, formulation, status, progress
// Aucun doublon, aucune altération des fonctionnalités existantes

export const defisReferentiel = [
  {
    id: 1,
    type: "comportemental",
    theme: "Dessert systématique à midi",
    nom: "🍎 Pas de dessert par automatisme",
    description: "Pendant 5 jours, termine ton déjeuner sans dessert, sauf vraie envie ou occasion spéciale.",
    duree: 5,
    unite: "jours",
    status: "en attente",
    progress: 0
  },
  {
    id: 2,
    type: "comportemental",
    theme: "Justification de trop manger",
    nom: "🧠 Je suis plus fort·e que mes excuses",
    description: "Pendant 3 repas, observe ton envie de ‘compenser’ un oubli ou une erreur, sans céder.",
    duree: 3,
    unite: "repas",
    status: "en attente",
    progress: 0
  },
  {
    id: 3,
    type: "comportemental",
    theme: "Double portion par automatisme",
    nom: "🧀 1 portion ça suffit",
    description: "Pendant 3 jours, respecte une seule portion de chaque aliment, même si c’est très bon.",
    duree: 3,
    unite: "jours",
    status: "en attente",
    progress: 0
  },
  {
    id: 4,
    type: "comportemental",
    theme: "Signaux de satiété ignorés",
    nom: "💡 J’écoute mon ventre",
    description: "Pendant 5 repas, pose ta fourchette dès que ton ventre se resserre. Observe, respire, choisis.",
    duree: 5,
    unite: "repas",
    status: "en attente",
    progress: 0
  },
  {
    id: 5,
    type: "comportemental",
    theme: "Substitution gâteau → fromage",
    nom: "🚫 Le faux allié",
    description: "Pendant 3 jours, ne remplace pas un extra par un autre aliment gras pour ‘compenser’.",
    duree: 3,
    unite: "jours",
    status: "en attente",
    progress: 0
  },
  {
    id: 6,
    type: "comportemental",
    theme: "Réduction de la charge digestive",
    nom: "🌡️ Chaud devant… mais doux !",
    description: "Pendant 4 dîners, choisis une cuisson douce (vapeur, mijoté, cru) pour t’alléger.",
    duree: 4,
    unite: "dîners",
    status: "en attente",
    progress: 0
  },
  {
    id: 7,
    type: "comportemental",
    theme: "Enchaînement sucre → gras",
    nom: "🔄 Je brise la chaîne",
    description: "Pendant 5 jours, stoppe la chaîne sucre-gras (ex : fruit sucré → fromage). Respire entre les deux.",
    duree: 5,
    unite: "jours",
    status: "en attente",
    progress: 0
  },
  {
    id: 8,
    type: "comportemental",
    theme: "Grignotage émotionnel post-sucre",
    nom: "🔥 1 vraie faim = 1 vrai repas",
    description: "Observe si ta faim est réelle ou émotionnelle pendant 5 envies soudaines de manger.",
    duree: 5,
    unite: "tentatives",
    status: "en attente",
    progress: 0
  },
  {
    id: 9,
    type: "comportemental",
    theme: "Anticipation d’extra",
    nom: "✨ Je me programme du plaisir",
    description: "Planifie 1 extra dans ta semaine et profite pleinement, sans culpabilité.",
    duree: 1,
    unite: "semaine",
    status: "en attente",
    progress: 0
  },
  {
    id: 10,
    type: "comportemental",
    theme: "Alimentation trop transformée",
    nom: "💧 1 cru par jour",
    description: "Ajoute un aliment cru et non sucré à 1 repas par jour pendant 5 jours.",
    duree: 5,
    unite: "jours",
    status: "en attente",
    progress: 0
  }
]
