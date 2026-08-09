# Configuration Devcontainer pour GitHub Codespaces

## À propos

Ce dossier contient la configuration pour GitHub Codespaces, optimisée pour le développement de l'application "Mon Plan Vital Root".

## Configuration

### Ressources allouées
- **CPU** : 2 cœurs
- **Mémoire** : 4 GB
- **Stockage** : 32 GB

Cette configuration est optimisée pour minimiser l'utilisation des ressources tout en permettant un développement efficace.

### Fonctionnalités

- Node.js 20 LTS
- Git
- Extensions VSCode pré-installées :
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - GitHub Copilot
  - GitHub Copilot Chat

### Démarrage automatique

Après la création d'un Codespace :
1. Les dépendances npm sont installées automatiquement (`npm install`)
2. Le port 3000 est configuré pour l'application Next.js

### Utilisation

#### Créer un Codespace

1. Depuis le dépôt GitHub, cliquez sur le bouton vert **Code**
2. Sélectionnez l'onglet **Codespaces**
3. Cliquez sur **Create codespace on [branch]**

#### Démarrer l'application

```bash
npm run dev
```

L'application sera accessible sur le port 3000, automatiquement forwardé.

#### Arrêter le Codespace

⚠️ **Important** : Pour économiser vos heures Codespaces :

1. Arrêtez le Codespace quand vous ne l'utilisez pas
2. **Supprimez** les Codespaces dont vous n'avez plus besoin
3. Le timeout d'inactivité est configuré à 30 minutes

## Gestion des Codespaces

### Voir tous vos Codespaces

```bash
gh codespace list
```

ou visitez : https://github.com/codespaces

### Supprimer un Codespace inutilisé

```bash
gh codespace delete -c <codespace-name>
```

### Problèmes courants

Si vous ne pouvez pas créer un nouveau Codespace :
- Vérifiez que vous n'avez pas atteint la limite de Codespaces actifs
- Supprimez les Codespaces inutilisés
- Consultez le guide de dépannage : `docs/CODESPACES_TROUBLESHOOTING.md`

## Configuration personnalisée

Pour personnaliser cette configuration :

1. Modifiez `devcontainer.json`
2. Commitez les changements
3. Reconstruisez votre Codespace : **Cmd/Ctrl+Shift+P** > **Codespaces: Rebuild Container**

## Ressources

- [Documentation GitHub Codespaces](https://docs.github.com/en/codespaces)
- [Référence devcontainer.json](https://containers.dev/implementors/json_reference/)
- [Guide de dépannage Codespaces](../docs/CODESPACES_TROUBLESHOOTING.md)
