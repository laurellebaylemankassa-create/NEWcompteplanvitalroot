# GitHub Codespaces - Guide de dépannage

## Problème : Impossible de créer un nouveau Codespace

### Comprendre les limites GitHub Codespaces

Même avec un compte GitHub Pro, il existe plusieurs limites qui peuvent empêcher la création de nouveaux Codespaces :

#### Limites du compte GitHub Pro :
- **Nombre maximum de Codespaces actifs** : Par défaut limité (généralement 2-4 selon la configuration)
- **Heures d'utilisation mensuelles** : 120 heures/mois pour GitHub Pro
- **Stockage** : 15 GB de stockage

### Solutions pour créer un nouveau Codespace

#### 1. Vérifier et supprimer les Codespaces inactifs

1. Allez sur [github.com/codespaces](https://github.com/codespaces)
2. Vérifiez la liste de tous vos Codespaces
3. Supprimez les Codespaces que vous n'utilisez plus :
   - Cliquez sur les trois points `...` à côté du Codespace
   - Sélectionnez "Delete"

#### 2. Arrêter les Codespaces en cours d'exécution

Les Codespaces **arrêtés** comptent toujours dans votre limite. Vous devez les **supprimer** pour libérer de l'espace :

1. Arrêtez les Codespaces actifs
2. Puis **supprimez-les** (ne les laissez pas juste arrêtés)

#### 3. Vérifier les limites de votre organisation

Si vous travaillez dans une organisation :
1. Les limites peuvent être définies au niveau de l'organisation
2. Contactez l'administrateur de votre organisation
3. Demandez d'augmenter les limites ou de libérer des Codespaces

#### 4. Augmenter les limites (si possible)

Pour GitHub Pro :
1. Allez dans **Settings** > **Billing and plans** > **Plans and usage**
2. Cherchez la section **Codespaces**
3. Vérifiez vos limites actuelles et votre utilisation
4. Vous pouvez augmenter certaines limites (payant au-delà du quota gratuit)

### Commandes utiles pour gérer les Codespaces

```bash
# Lister tous vos Codespaces via GitHub CLI
gh codespace list

# Supprimer un Codespace spécifique
gh codespace delete -c <codespace-name>

# Supprimer tous les Codespaces arrêtés
gh codespace delete --all
```

### Optimisation de l'utilisation des Codespaces

1. **Utilisez des Codespaces plus petits** : Choisissez la machine la plus petite possible pour votre travail
2. **Arrêtez et supprimez** : N'oubliez pas de supprimer les Codespaces après utilisation
3. **Timeout automatique** : Configurez un timeout automatique court (30 minutes par défaut)
4. **Travail local** : Pour des tâches simples, utilisez votre environnement local

### Configuration du timeout automatique

Pour éviter les Codespaces qui restent actifs :

1. Dans votre Codespace, allez dans **Settings** (⚙️)
2. Cherchez "Idle Timeout"
3. Configurez à 30 minutes ou moins

### Références

- [Documentation GitHub Codespaces](https://docs.github.com/en/codespaces)
- [Limites et quotas Codespaces](https://docs.github.com/en/codespaces/overview#billing-for-codespaces)
- [Gestion des Codespaces](https://docs.github.com/en/codespaces/developing-in-codespaces/deleting-a-codespace)

## En résumé

**Le problème le plus courant** : Vous avez atteint la limite de Codespaces simultanés.

**Solution rapide** :
1. Allez sur https://github.com/codespaces
2. Supprimez (pas seulement arrêter) les Codespaces non utilisés
3. Essayez de créer un nouveau Codespace

Si le problème persiste, contactez le support GitHub ou vérifiez vos paramètres de facturation.
