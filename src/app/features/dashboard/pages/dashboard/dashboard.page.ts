import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthorizationService } from '../../../../core/auth/authorization.service';

/**
 * §87 : contenu adapté au rôle. Reste volontairement simple (liens vers les listes déjà
 * paginées côté service) plutôt que de dupliquer des requêtes de synthèse que le backend
 * n'expose pas (pas de GET /api/v1/passengers/me/stats ou équivalent — §117).
 */
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container dashboard">
      <h1>Bonjour, {{ auth.fullName() }}</h1>

      <div class="dashboard__grid">
        @if (auth.isPassenger()) {
          <a class="card card--interactive dashboard__tile" routerLink="/passenger">
            <h2>Mon espace passager</h2>
            <p>Prochaine réservation, paiements, notifications.</p>
          </a>
        }
        @if (auth.isDriver()) {
          <a class="card card--interactive dashboard__tile" routerLink="/driver">
            <h2>Mon espace conducteur</h2>
            <p>Prochain départ, note, vérification, véhicules.</p>
          </a>
          <a class="card card--interactive dashboard__tile" routerLink="/driver/trips/new">
            <h2>Publier un trajet</h2>
            <p>Créez un nouveau trajet en quelques minutes.</p>
          </a>
        }
        <a class="card card--interactive dashboard__tile" routerLink="/trips">
          <h2>Rechercher un trajet</h2>
          <p>Trouvez un trajet disponible partout au Sénégal.</p>
        </a>
        <a class="card card--interactive dashboard__tile" routerLink="/profile">
          <h2>Mon profil</h2>
          <p>Modifiez vos informations personnelles.</p>
        </a>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard {
        padding-block: 2rem;
      }

      .dashboard__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .dashboard__tile h2 {
        font-size: 1.05rem;
        margin-bottom: 0.35rem;
      }

      .dashboard__tile p {
        margin: 0;
        font-size: 0.85rem;
        color: var(--color-muted, #6b7280);
      }
    `,
  ],
})
export class DashboardPage {
  protected readonly auth = inject(AuthorizationService);
}
