 PARTIE 2 : 10 mini-défis – adaptés à tes notes et comportements
🎯 Objectif : casser les automatismes inutiles, réancrer des réflexes sains, sans frustration.

Défi n°
Nom du défi 
Thème comportemental ciblé
Formulation du défi
Durée
1
🍎 “Pas de dessert par automatisme”
Dessert systématique à midi
“Pendant 5 jours, termine ton déjeuner sans dessert, sauf vraie envie ou occasion spéciale.”
5 jours
2
🧠 “Je suis plus fort·e que mes excuses”
Justification de trop manger
“Pendant 3 repas, observe ton envie de ‘compenser’ un oubli ou une erreur, sans céder.”
3 repas
3
🧀 “1 portion ça suffit”
Double portion par automatisme
“Pendant 3 jours, respecte une seule portion de chaque aliment, même si c’est très bon.”
3 jours
4
💡 “J’écoute mon ventre”
Signaux de satiété ignorés
“Pendant 5 repas, pose ta fourchette dès que ton ventre se resserre. Observe, respire, choisis.”
5 repas
5
🚫 “Le faux allié”
Substitution gâteau → fromage
“Pendant 3 jours, ne remplace pas un extra par un autre aliment gras pour ‘compenser’.”
3 jours
6
🌡️ “Chaud devant… mais doux !”
Réduction de la charge digestive
“Pendant 4 dîners, choisis une cuisson douce (vapeur, mijoté, cru) pour t’alléger.”
4 dîners
7
🔄 “Je brise la chaîne”
Enchaînement sucre → gras
“Pendant 5 jours, stoppe la chaîne sucre-gras (ex : fruit sucré → fromage). Respire entre les deux.”
5 jours
8
🔥 “1 vraie faim = 1 vrai repas”
Grignotage émotionnel post-sucre
“Observe si ta faim est réelle ou émotionnelle pendant 5 envies soudaines de manger.”
5 tentatives
9
✨ “Je me programme du plaisir”
Anticipation d’extra
“Planifie 1 extra dans ta semaine et profite pleinement, sans culpabilité.”
1 semaine
10
💧 “1 cru par jour”
Alimentation trop transformée
“Ajoute un aliment cru et non sucré à 1 repas par jour pendant 5 jours.”
5 jours



# Fonctionnalité : Mini-défis comportementaux

## Intégration des 10 mini-défis

Les 10 mini-défis sont intégrés dans l’application conformément au cahier des charges :
- Référentiel JS/TS des défis dans `lib/defisReferentiel.js`
- Initialisation automatique pour chaque utilisateur via `lib/initDefisUser.js` (aucun doublon, aucune suppression)
- Suivi et progression dans la table Supabase `defis`
- Composant UI dédié dans `pages/defis.js` : affichage, progression, feedback visuel
- Respect de la méthode de travail et de la checklist à chaque étape

---
# Mon Plan Vital

## Description
Mon Plan Vital est une application dédiée à la gestion de la santé et du bien-être. Elle permet aux utilisateurs de suivre leur alimentation, de gérer leur profil personnel, et d'accéder à divers outils pour améliorer leur qualité de vie.

## Fonctionnalités
- **Page d'accueil** : Présente un aperçu des fonctionnalités de l'application.
- **Profil utilisateur** : Permet aux utilisateurs de saisir et de modifier leurs informations personnelles telles que la taille et le poids.
- **Suivi des repas** : Affiche les repas du jour et permet de suivre l'alimentation.
- **Synthèse des extras** : Présente un récapitulatif des extras déclarés par l'utilisateur.
- **Déclaration d'extras** : Permet aux utilisateurs de déclarer des extras via un formulaire.
- **Règles d'usage** : Fournit des informations sur les règles et les bonnes pratiques d'utilisation de l'application.
- **Tableau de bord personnel** : Affiche des statistiques et des analyses sur les habitudes alimentaires.
- **Humeur du jour** : Permet aux utilisateurs de saisir leur humeur quotidienne.
- **Pause mentale** : Propose des exercices de pause mentale guidée.
- **Défis en cours** : Affiche les défis que l'utilisateur a entrepris.
- **Plan alimentaire structuré** : Présente un plan alimentaire personnalisé.

## Structure du projet
```
mon-plan-vital
├── pages
│   ├── index.js
│   ├── profil.js
│   ├── suivi.js
│   ├── extras.js
│   ├── declarer-extra.js
│   ├── regles.js
│   ├── statistiques.js
│   ├── checkin.js
│   ├── pause.js
│   ├── defis.js
│   ├── plan.js
│   └── _app.js
├── components
│   ├── Navigation.js
│   ├── FormulaireProfil.js
│   ├── SaisieRepas.js
│   ├── RecapAlignement.js
│   ├── ScoreBar.js
│   ├── FocusDuMois.js
│   └── (autres à créer)
├── lib
│   └── supabaseClient.js
├── public
│   └── (icônes / logos / images)
├── install.sh
├── vercel.json
├── .gitignore
├── package.json
└── package-lock.json
```

## Installation
Pour installer les dépendances du projet, exécutez le script suivant :

```bash
./install.sh
```

## Déploiement
Le projet est configuré pour être déployé sur Vercel. Assurez-vous que le fichier `vercel.json` est correctement configuré pour vos besoins.

## Contribuer
Les contributions sont les bienvenues ! N'hésitez pas à soumettre des demandes de tirage ou à ouvrir des problèmes pour discuter des améliorations.

## License
Ce projet est sous licence MIT.