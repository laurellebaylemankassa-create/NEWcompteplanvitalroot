# Mon Plan Vital Root

Application de suivi et gestion du plan vital, incluant la préparation aux jeûnes et le suivi nutritionnel.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20 ou supérieur
- npm ou yarn

### Installation locale

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local .env

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

### Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm start` - Lance l'application en mode production

## 💻 Développement avec GitHub Codespaces

Ce projet est configuré pour GitHub Codespaces avec un environnement de développement pré-configuré.

### Créer un Codespace

1. Cliquez sur le bouton vert **Code**
2. Sélectionnez l'onglet **Codespaces**
3. Cliquez sur **Create codespace on [branch]**

Le Codespace sera automatiquement configuré avec :
- Node.js 20
- Toutes les dépendances installées
- Extensions VSCode recommandées
- Port 3000 configuré

### ⚠️ Problème : "Impossible de créer un nouveau Codespace"

Si vous rencontrez ce message d'erreur avec votre compte Pro :

**Causes courantes :**
- Limite de Codespaces actifs atteinte (généralement 2-4)
- Codespaces arrêtés mais non supprimés qui comptent dans la limite
- Quota d'heures mensuelles dépassé

**Solutions rapides :**

1. **Vérifier vos Codespaces existants**
   - Visitez : https://github.com/codespaces
   - Supprimez (ne pas juste arrêter) les Codespaces non utilisés

2. **Via GitHub CLI**
   ```bash
   # Lister vos Codespaces
   gh codespace list
   
   # Supprimer un Codespace spécifique
   gh codespace delete -c <codespace-name>
   ```

3. **Vérifier vos limites**
   - Allez dans **Settings** > **Billing and plans** > **Plans and usage**
   - Consultez la section **Codespaces**

📖 **Guide complet** : Consultez [docs/CODESPACES_TROUBLESHOOTING.md](docs/CODESPACES_TROUBLESHOOTING.md) pour un guide détaillé de dépannage.

## 📁 Structure du projet

```
.
├── components/        # Composants React réutilisables
├── data/             # Données et fichiers de configuration
├── docs/             # Documentation du projet
├── lib/              # Bibliothèques et utilitaires
├── pages/            # Pages Next.js
├── scripts/          # Scripts utilitaires
├── .devcontainer/    # Configuration GitHub Codespaces
└── package.json      # Dépendances et scripts
```

## 🛠️ Technologies utilisées

- **Framework** : Next.js 15
- **UI** : React 18
- **État** : Redux Toolkit
- **Base de données** : Supabase
- **Graphiques** : Chart.js, Recharts
- **Utilitaires** : Axios, Papa Parse, XLSX

## 📚 Documentation

- [Guide de dépannage Codespaces](docs/CODESPACES_TROUBLESHOOTING.md)
- [Configuration Devcontainer](.devcontainer/README.md)
- [Règles de développement](Régle%20strict%20copilot%20.md)
- [Cahier des charges](docs/Cahier_des_charges.md)
- [Cahier technique](docs/Cahier_technique.md)

## 🔧 Configuration

Le fichier `.env.local` contient les variables d'environnement nécessaires. Assurez-vous de le configurer avant de lancer l'application.

## 🤝 Contribution

Consultez les [règles strictes de développement](Régle%20strict%20copilot%20.md) avant de contribuer au projet.

## 📄 Licence

Projet privé - Tous droits réservés.

## 🆘 Support

Pour toute question ou problème :
- Consultez la documentation dans le dossier `docs/`
- Vérifiez les issues existantes sur GitHub
- Contactez l'équipe de développement
