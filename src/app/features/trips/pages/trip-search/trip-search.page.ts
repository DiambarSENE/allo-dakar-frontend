import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SearchTripFormComponent } from '../../../../shared/components/search-trip-form/search-trip-form.component';
import { TripCardComponent } from '../../../../shared/components/trip-card/trip-card.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { TripResponse, TripSearchRequest } from '../../../../core/models/trip.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { TripService } from '../../services/trip.service';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

/**
 * §12 : recherche paginée, triable, avec états loading/empty/error explicites (§23). Les
 * critères de recherche vivent dans l'URL (query params) plutôt que dans un state interne
 * seul, pour que l'URL reste partageable/rafraîchissable (ex: lien envoyé depuis la home).
 */
@Component({
  selector: 'app-trip-search',
  imports: [
    SearchTripFormComponent,
    TripCardComponent,
    SpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    PaginationComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trip-search.page.html',
  styleUrl: './trip-search.page.scss',
})
export class TripSearchPage {
  private readonly tripService = inject(TripService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly state = signal<LoadState>('idle');
  protected readonly trips = signal<TripResponse[]>([]);
  protected readonly pagination = signal<PaginationMeta>({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  protected readonly currentCriteria = signal<TripSearchRequest>({});

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const criteria: TripSearchRequest = {
        departureCity: params.get('departureCity') ?? undefined,
        destinationCity: params.get('destinationCity') ?? undefined,
        departureDate: params.get('departureDate') ?? undefined,
        minPrice: toNumber(params.get('minPrice')),
        maxPrice: toNumber(params.get('maxPrice')),
        minAvailableSeats: toNumber(params.get('minAvailableSeats')),
        page: toNumber(params.get('page')) ?? 0,
      };
      this.currentCriteria.set(criteria);
      this.load(criteria);
    });
  }

  protected onSearch(criteria: TripSearchRequest): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...criteria, page: 0 },
    });
  }

  protected onPageChange(page: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...this.currentCriteria(), page },
      queryParamsHandling: 'merge',
    });
  }

  protected retry(): void {
    this.load(this.currentCriteria());
  }

  private load(criteria: TripSearchRequest): void {
    this.state.set('loading');
    this.tripService.search({ ...criteria, size: 10 }).subscribe({
      next: ({ trips, pagination }) => {
        this.trips.set(trips);
        this.pagination.set(pagination);
        this.state.set('success');
      },
      error: () => {
        this.state.set('error');
      },
    });
  }
}

function toNumber(value: string | null): number | undefined {
  if (value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}
