import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { firstName } from '../../../../shared/utils/user-display';

/**
 * §87 : contenu adapté au rôle. Reste volontairement simple (liens vers les listes déjà
 * paginées côté service) plutôt que de dupliquer des requêtes de synthèse que le backend
 * n'expose pas (pas de GET /api/v1/passengers/me/stats ou équivalent — §117).
 */
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space">
      <section class="hero" [class.hero--driver]="auth.isDriver() && !auth.isPassenger()">
        <div>
          <span class="hero__eyebrow"><app-icon name="home" /> Tableau de bord</span>
          <h1>Bonjour{{ firstName() ? ', ' + firstName() : '' }} 👋</h1>
          <p>Retrouvez en un clin d'œil vos espaces et vos raccourcis.</p>
        </div>
        <div class="hero__actions">
          <a class="btn btn--light" routerLink="/trips"><app-icon name="search" /> Rechercher un trajet</a>
          @if (auth.isDriver()) {
            <a class="btn btn--glass" routerLink="/driver/trips/new"><app-icon name="plus" /> Publier un trajet</a>
          }
        </div>
      </section>

      <div class="tile-grid">
        @if (auth.isPassenger()) {
          <a class="tile" routerLink="/passenger">
            <span class="tile__icon"><app-icon name="user" /></span>
            <span><h3>Mon espace passager</h3><p>Prochaine réservation, paiements, notifications.</p></span>
            <app-icon class="tile__arrow" name="arrow" />
          </a>
        }
        @if (auth.isDriver()) {
          <a class="tile tile--teal" routerLink="/driver">
            <span class="tile__icon"><app-icon name="car" /></span>
            <span><h3>Mon espace conducteur</h3><p>Prochain départ, note, vérification, véhicules.</p></span>
            <app-icon class="tile__arrow" name="arrow" />
          </a>
          <a class="tile tile--green" routerLink="/driver/trips/new">
            <span class="tile__icon"><app-icon name="plus" /></span>
            <span><h3>Publier un trajet</h3><p>Créez un nouveau trajet en quelques minutes.</p></span>
            <app-icon class="tile__arrow" name="arrow" />
          </a>
        }
        <a class="tile tile--blue" routerLink="/trips">
          <span class="tile__icon"><app-icon name="search" /></span>
          <span><h3>Rechercher un trajet</h3><p>Trouvez un trajet disponible partout au Sénégal.</p></span>
          <app-icon class="tile__arrow" name="arrow" />
        </a>
        <a class="tile tile--amber" routerLink="/profile">
          <span class="tile__icon"><app-icon name="user" /></span>
          <span><h3>Mon profil</h3><p>Modifiez vos informations personnelles.</p></span>
          <app-icon class="tile__arrow" name="arrow" />
        </a>
      </div>
    </div>
  `,
})
export class DashboardPage {
  protected readonly auth = inject(AuthorizationService);
  protected readonly firstName = computed(() => firstName(this.auth.fullName()));
}
