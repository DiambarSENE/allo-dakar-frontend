import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { SearchTripFormComponent } from '../../../../shared/components/search-trip-form/search-trip-form.component';
import { TripSearchRequest } from '../../../../core/models/trip.model';

@Component({
  selector: 'app-home',
  imports: [SearchTripFormComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly router = inject(Router);

  protected onSearch(criteria: TripSearchRequest): void {
    // La recherche réelle est déléguée à /trips (§12) — la page d'accueil ne fait que
    // transmettre les critères via query params, une seule source de logique de recherche.
    void this.router.navigate(['/trips'], { queryParams: criteria });
  }
}
