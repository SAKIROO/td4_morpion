# Morpion (TD4 VueJS)

Application Vue 3 / Vue Router pour le TD4 : création de parties, rejoindre/jouer via WebSockets et édition du profil.
##Réalisé par Robin Carette & Noé Franoux

## Aperçu
- UI/UX moderne (glassmorphism, layout dense, responsive)
- Temps réel via WebSockets + fallback polling
- Profils joueurs + noms dynamiques

## Pré-requis
- Node.js 20+ (voir `package.json` > `engines`)
- npm (fourni avec Node)
- Une clé API personnelle : `/api/apikeys` sur https://morpion-api.edu.netlor.fr (renseigner `name` et `email`)

## Configuration de la clé API
1. Créer un fichier `.env` à la racine du projet s'il n'existe pas.
2. Ajouter votre clé :
```env
VITE_MORPION_API_KEY=VOTRE_CLE_ICI
```
Chaque développeur doit utiliser sa propre clé.

## Installation
```sh
npm install
```

## Lancement en développement
```sh
npm run dev
```
Vite affiche ensuite l'URL locale (par défaut `http://localhost:5173`).
Ouvrir deux onglets/navigateurs pour simuler deux joueurs.

### Lancer un 2e joueur (autre clé API)
```sh
VITE_MORPION_API_KEY='VOTRE_AUTRE_CLE' npm run dev -- --port 5174
```
Ouvrir `http://localhost:5174` pour le second joueur.

## Construction et prévisualisation (optionnel)
```sh
npm run build
npm run preview
```

## Lint
```sh
npm run lint
```

## Captures d'écran

Page d'acceuil
![Accueil](docs/screenshots/01-home.png)
---------------------------------------------------
Lobby de matchmaking
![Partie en attente](docs/screenshots/02-lobby.png)
---------------------------------------------------
Partie en cours
![Partie en cours](docs/screenshots/03-game.png)
---------------------------------------------------

## Dépannage rapide
- Si la clé API est invalide, régénérez-la sur https://morpion-api.edu.netlor.fr
- En cas d'erreur de version Node, mettez à jour Node.js pour respecter `engines`
