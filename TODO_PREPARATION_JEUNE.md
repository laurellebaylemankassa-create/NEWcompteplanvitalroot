# 🟢 TODO – Intégration de la préparation au jeûne

## Progression globale : 0/7 étapes complétées (0%)

- [ ] **Enrichir `/pages/preparation-jeune.js`**
  - Ajouter la progression réelle, la validation des critères, le message personnel et la synthèse finale sur `/pages/preparation-jeune.js`. Se limiter à la phase de préparation et à la transition vers le jeûne, sans toucher à la logique métier du jeûne ou de la reprise.
- [ ] **Créer/adapter timeline et critères**
  - Créer ou adapter `TimelineProgressionPreparation`, `CriterePreparationCard`, conseils, pour une timeline interactive et détaillée. Ne concerner que la préparation et ses transitions.
- [ ] **Améliorer validation automatique dans `/suivi.js`**
  - Permettre la validation automatique des critères selon la saisie du repas, synchroniser avec la timeline de préparation. Ne pas gérer la logique du jeûne ou de la reprise.
- [ ] **Ajouter bannière sur `/tableau-de-bord.js`**
  - Détecter un jeûne programmé et afficher la bannière d'entrée dans la préparation sur `/tableau-de-bord.js`. Limité à la préparation et à la transition.
- [ ] **Tester le workflow complet**
  - Tester le déclenchement, la validation, la progression, le feedback et le passage au jeûne sur l'ensemble du parcours de préparation. Ne pas tester la logique métier du jeûne ou de la reprise.
- [ ] **Ajouter conseils et feedbacks UX**
  - Enrichir les pages et composants avec des conseils pratiques, messages motivationnels et feedbacks contextuels, uniquement pour la préparation et ses transitions.
- [ ] **Valider accessibilité et robustesse**
  - Tester la solution sur plusieurs devices, cas limites, accessibilité, gestion des retours arrière et modification de date, uniquement pour la préparation et ses transitions.

---

**Légende** :
- [x] Étape complétée
- [ ] Étape à faire

La progression sera mise à jour à chaque étape validée.
