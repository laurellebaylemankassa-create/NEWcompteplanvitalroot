# 🚨 Impossible de créer un nouveau Codespace ? Solution rapide !

## Problème
Vous voyez ce message : "Cannot create codespace" ou "You have reached the limit"

## Solution en 3 étapes ⚡

### 1️⃣ Accédez à vos Codespaces
Allez sur : **https://github.com/codespaces**

### 2️⃣ Supprimez les Codespaces inutilisés
- Trouvez les Codespaces que vous n'utilisez plus
- Cliquez sur les trois points `...` à droite
- Sélectionnez **"Delete"** (pas seulement Stop !)
- ⚠️ Les Codespaces **arrêtés** comptent toujours dans votre limite !

### 3️⃣ Créez votre nouveau Codespace
Retournez dans votre dépôt et créez un nouveau Codespace.

## 💡 Pourquoi ça arrive ?

Même avec GitHub Pro, vous avez des limites :
- **Maximum de Codespaces actifs** : 2-4 simultanés (selon configuration)
- **Heures mensuelles** : 120 heures/mois
- **Stockage** : 15 GB

Les Codespaces **arrêtés mais non supprimés** comptent dans votre limite !

## 📱 Via GitHub CLI (alternative)

```bash
# Voir tous vos Codespaces
gh codespace list

# Supprimer un Codespace
gh codespace delete -c <nom-du-codespace>

# Supprimer tous les Codespaces arrêtés
gh codespace delete --all
```

## 🔍 Vérifier vos quotas

1. Allez dans **Settings** (⚙️)
2. **Billing and plans** → **Plans and usage**
3. Section **Codespaces** → voyez votre utilisation

## 📚 Documentation complète

Pour plus de détails, consultez :
- [Guide de dépannage complet](docs/CODESPACES_TROUBLESHOOTING.md)
- [Configuration Devcontainer](.devcontainer/README.md)
- [README principal](README.md)

## 💬 Besoin d'aide ?

Si le problème persiste après avoir supprimé vos Codespaces :
1. Vérifiez que vous n'avez pas de limites au niveau organisation
2. Contactez le support GitHub
3. Vérifiez votre facturation et vos quotas

---

**Astuce** : Pensez à supprimer vos Codespaces après utilisation pour éviter d'atteindre la limite ! 🎯
