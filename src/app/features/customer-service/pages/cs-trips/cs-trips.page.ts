import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CustomerServiceService } from '../../services/customer-service.service';
import { TripResponse } from '../../../../core/models/trip.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

type LoadState = 'loading' | 'success' | 'error';

/** §43 "Consulter un trajet" — lecture seule (le détail complet reste GET /api/v1/trips/{id}, déjà public). */
@Component({
  selector: 'app-cs-trips',
  imports: [RouterLink, SpinnerComponent, ErrorStateComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cs-trips.page.html',
})
export class CsTripsPage {
  private readonly customerService = inject(CustomerServiceService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly trips = signal<TripResponse[]>([]);
  protected readonly pagination = signal<PaginationMeta>({ page: 0, size: 20, totalElements: 0, totalPages: 0 });

  constructor() {
    this.load(0);
  }

  protected onPageChange(page: number): void {
    this.load(page);
  }

  protected retry(): void {
    this.load(this.pagination().page);
  }

  private load(page: number): void {
    this.state.set('loading');
    this.customerService.listTrips(page, 20).subscribe({
      next: ({ trips, pagination }) => {
        this.trips.set(trips);
        this.pagination.set(pagination);
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }
}
