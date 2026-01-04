# Morpion (TD4 VueJS)

Application Vue 3 / Vue Router qui implémente le TD4 : création de parties, rejoint/joue via websockets et édition du profil.

## Pré-requis
- Node 20+
- Une clé API personnelle (`/api/apikeys` sur https://morpion-api.edu.netlor.fr avec un `name` et un `email`). Chaque développeur doit saisir sa propre clé.

## Configuration
1. Copier le fichier d'exemple : `cp .env.example .env`.
2. Remplacer `VITE_MORPION_API_KEY` par votre clé retournée par l'API.

## Installation
```sh
npm install
```

## Lancement en développement
```sh
npm run dev
```
Le serveur Vite affiche ensuite l'URL (par défaut http://localhost:5173). Ouvrir deux onglets/navigateurs pour simuler deux joueurs.

## Vérification
```sh
npm run lint
```
Lint Vue/JS selon les règles vues en cours.
