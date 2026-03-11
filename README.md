# Train Tracker

Tableau de bord temps réel de surveillance du réseau ferroviaire SNCF. Visualise les perturbations par ligne et calcule un **Index de Stress** pour identifier les lignes les plus impactées.

**Live : [train-tracker.online](https://train-tracker.online)**

## Fonctionnalités

- **Carte interactive** : position des trains perturbés en temps réel (Leaflet)
- **Index de Stress** : score par ligne (LOW → CRITICAL) basé sur le nombre de trains et le retard moyen
- **Alertes temps réel** : notifications push via WebSocket (Socket.io) à chaque poll SNCF
- **Mise à jour automatique** : poll de l'API SNCF toutes les 60 secondes

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Mono-repo | Turborepo + npm workspaces |
| Backend | NestJS 10, TypeORM, Socket.io |
| Base de données | PostgreSQL 16 + TimescaleDB |
| Cache | Redis 7 |
| Frontend | Next.js 14, Tailwind CSS, Leaflet, Zustand |
| Infra | Docker, Traefik v2 (TLS/Let's Encrypt) |
| CI/CD | GitHub Actions → GHCR → VPS Hostinger |

## Architecture

```
train-tracker/
├── apps/
│   ├── api/          # NestJS — polling SNCF, calcul stress, WebSocket
│   └── web/          # Next.js — carte + dashboard
├── packages/
│   ├── shared-types/ # Types partagés (StressScore, Alert…)
│   └── ui/           # Composants React réutilisables
└── infra/
    └── docker/       # docker-compose.prod.yml (Traefik + services)
```

## Lancer en local

**Prérequis** : Docker, Node.js 20+, une clé API SNCF OpenData

```bash
# 1. Cloner le dépôt
git clone https://github.com/<your-username>/train-tracker.git
cd train-tracker

# 2. Variables d'environnement
cp .env.example apps/api/.env
# Renseigner DATABASE_URL, REDIS_URL, SNCF_API_KEY dans apps/api/.env

# 3. Démarrer la base de données et Redis
docker compose -f infra/docker/docker-compose.yml up -d db redis

# 4. Installer les dépendances
npm install

# 5. Démarrer l'API et le frontend
npm run dev
```

- Frontend : http://localhost:3000
- API : http://localhost:3001
- Adminer (DB) : http://localhost:8080

## Déploiement

Le déploiement est entièrement automatisé via GitHub Actions sur chaque push sur `main` :

1. Build des images Docker (API + Web) et push sur GitHub Container Registry
2. SSH sur le VPS → pull des nouvelles images → `docker compose up -d`

Les secrets nécessaires sont configurés dans les **Repository secrets** GitHub :
`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `SNCF_API_KEY`, `DOMAIN`, `ACME_EMAIL`

## Source des données

[SNCF OpenData](https://www.sncf-connect.com/aide/open-data) — API `/disruptions` (5 000 req/jour, poll toutes les 60 s)
