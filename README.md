# Allo Dakar — Frontend

Frontend web (Angular 21) de la plateforme de covoiturage Allo Dakar, consommant l'API REST
[`allo-dakar-backend`](../allo-dakar-backend) et déléguant l'authentification à Keycloak 26.

## 1. Architecture

```
src/app/
├── core/            auth (AuthorizationService), guards, interceptors, config, models TS
├── shared/          composants réutilisables, constants (nav.config.ts)
├── layout/          PublicLayout, AuthenticatedLayout, AdminLayout, CustomerServiceLayout
└── features/
    ├── home, trips, bookings, payments   — publiques / passager
    ├── passenger, driver, profile        — espaces authentifiés ("mon espace" par rôle)
    ├── reviews, notifications, reports
    ├── admin                             — réservé au rôle ADMIN
    └── customer-service                  — réservé à CUSTOMER_SERVICE/ADMIN (§43, périmètre
                                             volontairement restreint : utilisateurs, réservations,
                                             trajets, litiges — voir CustomerServiceController)
```

Feature-first (§6), standalone components uniquement, lazy loading par route (`loadComponent`),
zoneless (`provideZonelessChangeDetection`), Signals pour l'état local, Reactive Forms pour tous
les formulaires métier.

## 2. Technologies

- Angular 21 (standalone, signals, `@if`/`@for`/`@switch`, functional guards/interceptors)
- TypeScript strict
- `keycloak-angular` + `keycloak-js` — voir `core/config/keycloak.config.ts`
- RxJS pour la communication HTTP (`HttpClient` + intercepteurs fonctionnels)
- SCSS (design tokens centralisés dans `src/styles/`)
- Vitest (test runner par défaut d'Angular 21) — pas de Jasmine/Karma

Aucune librairie de state management externe (NgRx…) : l'état applicatif reste local aux
composants via signals, ce qui suffit à l'échelle actuelle de l'application (§22).

## 3. Prérequis

- Node.js 22.12+ (utilisé ici : 22.22.2)
- npm 10+
- Le backend `allo-dakar-backend` démarré (voir son propre README) et un realm Keycloak importé
  (`keycloak/realm-export.json` côté backend)

## 4. Installation

```bash
npm install
```

## 5. Configuration

Trois fichiers d'environnement (§18/§70), remplacés au build via `angular.json` /
`fileReplacements` :

| Fichier | Utilisé pour |
|---|---|
| `src/environments/environment.ts` | valeurs par défaut (dev local) |
| `src/environments/environment.development.ts` | `ng serve` / `ng build --configuration development` |
| `src/environments/environment.production.ts` | `ng build --configuration production` |

Chacun expose :

```ts
{
  production: boolean,
  apiUrl: string,        // ex: http://localhost:8080/api/v1
  keycloak: { url, realm, clientId }
}
```

⚠️ **Aucun secret ici** (§96) — `apiUrl`, `keycloak.url/realm/clientId` sont des informations
publiques visibles dans le bundle par construction. Le client Keycloak `allo-dakar-frontend` est
un client **public** (pas de secret, PKCE) — voir `keycloak/realm-export.json` côté backend.

## 6. Keycloak

Voir en détail le README du backend (§13 + section Keycloak). Ici, retenir uniquement :

- Realm : `allo-dakar`, client : `allo-dakar-frontend` (public, Authorization Code + PKCE)
- Rôles lus depuis le claim **realm** du token (`realm_access.roles`), pas des rôles client —
  voir `core/config/keycloak.config.ts` et `AuthorizationService`
- Le frontend ne gère ni mot de passe, ni émission/refresh de JWT — entièrement délégué à
  Keycloak (`withAutoRefreshToken`)

## 7. Lancement local

```bash
ng serve
```

Ouvre `http://localhost:4200`. Nécessite le backend sur `:8080` et Keycloak sur `:8081` (valeurs
par défaut de `environment.development.ts`).

## 8. Build

```bash
ng build                                  # développement
ng build --configuration production       # production, dans dist/allo-dakar-frontend/browser
```

## 9. Tests

```bash
ng test              # unitaires (Vitest)
```

Pas de suite E2E fournie (§78 — Playwright recommandé) : à ajouter selon les priorités du
projet plutôt qu'imposé ici sans environnement Keycloak de test dédié.

## 10. Docker

```bash
docker compose up --build
```

Sert uniquement le build statique via Nginx (`nginx.conf`) — ne proxifie jamais l'API ou
Keycloak (§95). `apiUrl`/`keycloak.url` dans `environment.production.ts` doivent pointer vers
des URLs publiquement accessibles depuis le navigateur de l'utilisateur, pas des hostnames
Docker internes.

## 11. Sécurité frontend (§66/§80)

- Le frontend **n'est jamais** l'autorité finale : chaque règle métier (places disponibles,
  permissions, statuts) est revalidée côté backend — voir la gestion explicite du `409
  BOOKING_SEATS_UNAVAILABLE` dans `trip-detail.page.ts`.
- Guards de rôle (`driverGuard`, `adminGuard`, `passengerGuard`…) protègent la navigation pour
  l'UX, mais chaque appel API reste soumis à `@PreAuthorize` côté Spring Security.
- Aucun mot de passe, secret client ou donnée bancaire n'est jamais stocké ni transmis par ce
  frontend (§76/§96).

## 12. Roadmap — ce qui n'est pas encore fait

Documenté plutôt que masqué (§117) :

- **Modération d'avis** : `AdminService.moderateReview()` existe côté frontend (appelle
  `POST /admin/reviews/{id}/moderate`) mais n'a pas encore de page dédiée dans `/admin`.
- **Avis conducteur → passager** : un conducteur ne peut pas encore noter un passager depuis
  l'UI (il faudrait une liste des réservations reçues par trajet, non construite) — seul le
  sens passager → conducteur est câblé (`booking-detail.page.ts`).
- **Upload de document de vérification** : le formulaire de vérification conducteur attend une
  URL déjà hébergée (`documentUrl`), pas un upload de fichier — le backend n'expose aucun
  endpoint de stockage de fichiers (voir `verification.page.ts`).
- **Note/badge vérifié du conducteur dans les résultats de recherche (§12)** : non affiché —
  `TripResponse` ne les expose pas côté backend (voir `trip-card.component.ts`).
- Jetons/abonnements (§34/§35 du cahier des charges) : exclus du périmètre sur demande explicite.
