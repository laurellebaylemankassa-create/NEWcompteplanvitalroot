# Rapport Markdown Copilot — Anomalie React « Invalid hook call »

## Date : 2025-11-18

---

## État AVANT correction

- Le template d’implémentation ne comportait pas de contrôle explicite sur l’emplacement des hooks React (useState, useEffect, etc.).
- Risque : possibilité d’introduire un bug « Invalid hook call » si un hook est déclaré dans une fonction, une boucle, un map, un if, etc.
- Historique : aucune mention de ce point dans la checklist stricte sécurité & qualité.
- Conséquence : apparition d’une erreur bloquante lors de l’ajout du feedback UX « Palier validé ! » dans `/pages/ideaux.js`.

---

## Anomalie détectée

- Date/heure : 2025-11-18
- Fichier : `/pages/ideaux.js`
- Erreur : « Invalid hook call. Hooks can only be called inside of the body of a function component. »
- Cause : hook React déclaré en dehors du corps principal du composant fonctionnel.
- Action immédiate : documentation de l’anomalie dans `Anomalie roll back`.

---

## État APRÈS correction

- Le template a été mis à jour :
  - Ajout d’une ligne explicite dans la checklist stricte sécurité & qualité :
    > [ ] Tous les hooks React (useState, useEffect, etc.) sont déclarés uniquement en haut du corps du composant fonctionnel, jamais dans une fonction, une boucle, un map, un if, etc. (respect strict des règles officielles des hooks)
- L’anomalie est documentée dans le fichier `Anomalie roll back`.
- La procédure de traçabilité et de prévention est renforcée pour toutes les futures tâches.

---

## Prochaine étape

- Corriger le code de `/pages/ideaux.js` si le bug est encore présent (déplacer tous les hooks en haut du composant fonctionnel).
- Tester le rendu et valider la correction.
- Continuer la documentation et la validation utilisateur.

---

*Rapport généré automatiquement par Copilot le 18/11/2025.*
