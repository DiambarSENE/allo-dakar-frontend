import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { PricingService } from '../../../../core/services/pricing.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SearchTripFormComponent } from '../../../../shared/components/search-trip-form/search-trip-form.component';
import { TripSearchRequest } from '../../../../core/models/trip.model';

@Component({
  selector: 'app-home',
  imports: [SearchTripFormComponent, RouterLink, IconComponent, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly router = inject(Router);
  protected readonly pricing = inject(PricingService);

  /** Destinations populaires au départ de Dakar : simples raccourcis de recherche. */
  protected readonly destinations = [
    { city: 'Thiès' }, { city: 'Mbour' }, { city: 'Saint-Louis' },
    { city: 'Touba' }, { city: 'Kaolack' }, { city: 'Ziguinchor' },
  ];

  protected quickSearch(city: string): void {
    void this.router.navigate(['/trips'], { queryParams: { departureCity: 'Dakar', destinationCity: city } });
  }

  protected onSearch(criteria: TripSearchRequest): void {
    // La recherche réelle est déléguée à /trips (§12) — la page d'accueil ne fait que
    // transmettre les critères via query params, une seule source de logique de recherche.
    void this.router.navigate(['/trips'], { queryParams: criteria });
  }
}
