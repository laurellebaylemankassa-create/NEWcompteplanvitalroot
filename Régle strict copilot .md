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
### Ordre d’initialisation des hooks et variables (règle stricte)
- Tous les hooks `useState` et variables doivent être déclarés AVANT tout hook `useEffect`, calcul, handler ou rendu qui les utilise.
- Aucun hook, variable ou handler ne doit être utilisé avant sa déclaration.
- Relire l’ordre de déclaration des hooks et variables après chaque modification.
- En cas de doute, déplacer tous les hooks `useState` en tout début du composant, puis les hooks `useEffect`, puis la logique métier, puis les handlers, puis le rendu.

### Checklist à valider pour chaque modification
- [ ] Tous les hooks, variables et handlers/fonctions utilisés dans le rendu sont initialisés avant usage
- [ ] Vérification explicite : tout handler/fonction utilisé dans le rendu (ex : onClick, onChange, etc.) est présent et initialisé dans le composant principal avant le rendu JSX
- [ ] Aucune déclaration en double (hook, variable, fonction)
- [ ] La nouvelle logique est insérée après l’initialisation des variables nécessaires
- [ ] Contrôle des erreurs effectué (compilation, runtime, rendu)
- [ ] Test du rendu dans les différents cas d’usage

- [ ] Vérification de la portée et de l’ordre d’exécution des hooks et variables (tout doit être dans le composant, dans l’ordre logique)
- [ ] Relecture du code pour repérer toute utilisation avant déclaration ou hors contexte React
- [ ] l Ordre d’initialisation des hooks et variables a bien ete respecte confirmer en affichant ce qui a ete fait (règle stricte)

 [ ] Toute amélioration ou ajout s’intègre dans l’univers du code existant : aucune suppression ou modification ne doit générer la perte d’une fonction, d’une logique ou d’un fonctionnement. Aucun conflit, aucune anomalie ne doit être créée. Si un risque est détecté, il doit être signalé et une alternative sans risque doit être proposée.
 Si un point de la cheklist n a pas ete respecter la modification et qualifié non conforme et un rollback doit etre effectué et tout le process doit etre repris avec analyse de la raison du roll back et conserve dans le fichier anomalie avec date et heure si tous les point on ete respecté copilot doit demander qu un test soit fait pour valider la maj si la maj ets valider alors 
- [ ] Validation finale : la checklist est respectée
- Copilot invite suite a la preuve de validation de l utilisateur de faire un push " attention" copilot ne push rien c est une suggestion pour rappeler a l utilisateur de push chaque changement effectué, en invitant a faire un pull egalement avant de push
---

