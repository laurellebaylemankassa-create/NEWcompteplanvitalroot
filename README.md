# Fonctionnalité : Mini-défis comportementaux

## Intégration des 10 mini-défis

Les 10 mini-défis sont intégrés dans l’application conformément au cahier des charges :
- Référentiel JS/TS des défis dans `lib/defisReferentiel.js`
- Initialisation automatique pour chaque utilisateur via `lib/initDefisUser.js` (aucun doublon, aucune suppression)
- Suivi et progression dans la table Supabase `defis`
- Composant UI dédié dans `pages/defis.js` : affichage, progression, feedback visuel
- Respect de la méthode de travail et de la checklist à chaque étape

### Checklist de validation pour la fonctionnalité défis
- [x] Tous les hooks, variables et handlers/fonctions utilisés dans le rendu sont initialisés avant usage
- [x] Vérification explicite : tout handler/fonction utilisé dans le rendu (ex : onClick, onChange, etc.) est présent et initialisé dans le composant principal avant le rendu JSX
- [x] Aucune déclaration en double (hook, variable, fonction)
- [x] La nouvelle logique est insérée après l’initialisation des variables nécessaires
- [x] Contrôle des erreurs effectué (compilation, runtime, rendu)
- [x] Test du rendu dans les différents cas d’usage
- [x] Validation finale : la checklist est respectée
- [x] Vérification de la portée et de l’ordre d’exécution des hooks et variables (tout doit être dans le composant, dans l’ordre logique)
- [x] Relecture du code pour repérer toute utilisation avant déclaration ou hors contexte React
- [x] Toute amélioration ou ajout s’intègre dans l’univers du code existant : aucune suppression ou modification ne doit générer la perte d’une fonction, d’une logique ou d’un fonctionnement. Aucun conflit, aucune anomalie ne doit être créée. Si un risque est détecté, il doit être signalé et une alternative sans risque doit être proposée.

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

Consigne = lors de chaque modification  suivre scrupuleusement " Méthode de travail pour toute modification du code" et respecter en suivant dans l ordre la Checklist à valider pour chaque modification.
## Méthode de travail pour toute modification du code

### Bonnes pratiques
1. Lecture complète du code concerné (hooks, variables, fonctions utilisées dans le rendu ou la logique)
2. Initialisation systématique de chaque variable, hook ou handler/fonction utilisé avant usage
3. Vérification explicite : tout handler/fonction utilisé dans le rendu (ex : onClick, onChange, etc.) doit être présent et initialisé dans le composant principal avant le rendu JSX
4. Toujours déclarer les hooks, variables et handlers/fonctions dans l’ordre : d’abord les hooks (useState, useEffect…), puis les variables calculées, puis la logique métier, puis les handlers/fonctions, puis l’affichage dynamique. Ne jamais utiliser une variable ou fonction avant sa déclaration.
5. Vérification systématique de la portée et de l’ordre d’exécution : tous les hooks, variables et handlers/fonctions doivent être déclarés dans le composant principal, dans l’ordre logique, et jamais en dehors ou avant leur déclaration.
6. Relecture du code généré pour repérer toute utilisation prématurée ou hors contexte d’une variable, d’un hook ou d’un handler/fonction (notamment pour SSR et React).
7. Ajout de nouvelle logique uniquement après l’initialisation des variables et handlers/fonctions nécessaires
8. Suppression des doublons (aucune déclaration en double)
9. Contrôle des erreurs (compilation, runtime, rendu) après chaque modification
10. Test du rendu dans les différents cas d’usage
11. Validation finale de la checklist avant de valider la modification
12. Toute amélioration ou ajout doit s’intégrer dans l’univers du code existant : aucune suppression ou modification ne doit générer la perte d’une fonction, d’une logique ou d’un fonctionnement. Aucun conflit, aucune anomalie ne doit être créée. Si un risque est détecté, il doit être signalé et une alternative sans risque doit être proposée.

### Checklist à valider pour chaque modification
- [ ] Tous les hooks, variables et handlers/fonctions utilisés dans le rendu sont initialisés avant usage
- [ ] Vérification explicite : tout handler/fonction utilisé dans le rendu (ex : onClick, onChange, etc.) est présent et initialisé dans le composant principal avant le rendu JSX
- [ ] Aucune déclaration en double (hook, variable, fonction)
- [ ] La nouvelle logique est insérée après l’initialisation des variables nécessaires
- [ ] Contrôle des erreurs effectué (compilation, runtime, rendu)
- [ ] Test du rendu dans les différents cas d’usage
- [ ] Validation finale : la checklist est respectée

- [ ] Vérification de la portée et de l’ordre d’exécution des hooks et variables (tout doit être dans le composant, dans l’ordre logique)
- [ ] Relecture du code pour repérer toute utilisation avant déclaration ou hors contexte React

- [ ] Toute amélioration ou ajout s’intègre dans l’univers du code existant : aucune suppression ou modification ne doit générer la perte d’une fonction, d’une logique ou d’un fonctionnement. Aucun conflit, aucune anomalie ne doit être créée. Si un risque est détecté, il doit être signalé et une alternative sans risque doit être proposée.

---

## Protocole automatisé de contrôle qualité

Pour garantir le respect strict de la méthode de travail et de la checklist, chaque modification doit suivre ce protocole :

1. **Scan automatique du fichier** :
	- Détection des doublons d’import, de hook, de variable, de fonction
	- Vérification que tous les hooks et variables sont initialisés avant usage
	- Vérification que tous les hooks et variables sont déclarés dans le composant principal, dans l’ordre logique
	- Vérification que tous les imports sont placés en haut du fichier
	- Relecture pour repérer toute utilisation prématurée ou hors contexte (notamment pour SSR et React)

2. **Contrôle d’erreur automatique** :
	- Compilation
	- Runtime
	- Rendu

3. **Test du rendu** dans les différents cas d’usage

4. **Validation systématique de la checklist** avant toute validation ou commit

Ce protocole doit être appliqué à chaque correction, ajout ou modification de logique métier, afin d’assurer la robustesse et la maintenabilité du code.
