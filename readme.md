# 🎬 CineStream

Application web de catalogue de films basée sur une architecture moderne **Front-end / Back-end / Base de données**, avec intégration de l’API **TMDB**.

---

## 📝 Description

**CineStream** est une plateforme immersive permettant de :

- **Afficher un catalogue de films dynamique** mis à jour en temps réel.
- **Rechercher des films** via une barre de recherche intelligente.
- **Filtrer par genre** (Action, Comédie, Thriller, etc.).
- **Gérer les comptes utilisateurs** (Création de compte et connexion sécurisée).
- **Gérer une liste de favoris** personnelle.
- **Visionner les bandes-annonces** officielles des films.

Le projet suit une démarche rigoureuse, proche du monde professionnel :
- **Architecture claire** et découplée (Full-Stack).
- **API REST** performante.
- **Base de données** relationnelle robuste.
- **Conteneurisation** complète des services.
- **Déploiement** moderne avec Docker et Kubernetes.

---

## 🏗️ Architecture

L’application repose sur une architecture **client–serveur** :

*   **Front-end** : React + Vite (Interface réactive et rapide).
*   **Back-end** : FastAPI (Python) pour une logique métier haute performance.
*   **Base de données** : PostgreSQL (Stockage sécurisé des utilisateurs et favoris).
*   **API externe** : TMDB (The Movie Database) pour les métadonnées de films.

### 🔄 Flux de données
1. Le **Front-end** envoie des requêtes HTTP asynchrones au **Back-end**.
2. Le **Back-end** traite la logique métier et l'authentification.
3. Le serveur interroge **TMDB** ou **PostgreSQL** selon la demande.
4. Les résultats sont renvoyés au format JSON.
5. Le **Front-end** met à jour l'interface utilisateur sans recharger la page.

---

## 🚀 Lancer le projet

### 🐳 Méthode Docker Compose (Recommandé)
Pour construire les images et lancer tous les conteneurs en une seule commande :

```bash
docker-compose up --build

Front-end : http://localhost:5173

Back-end : http://localhost:8000

Documentation API : http://localhost:8000/docs

# Appliquer tous les manifestes de déploiement et de services
kubectl apply -f k8s/

# Vérifier que tous les éléments sont en ligne (Running)
kubectl get pods
kubectl get services