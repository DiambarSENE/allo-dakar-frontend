import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminService } from '../../services/admin.service';
import { TripResponse } from '../../../../core/models/trip.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

type LoadState = 'loading' | 'success' | 'error';

/**
 * §46 : consultation uniquement — AdminService.listAllTrips n'expose aucune action de
 * modération dédiée côté backend (annuler un trajet reste réservé au conducteur lui-même via
 * POST /api/v1/trips/{id}/cancel, non accessible à un admin sur un trajet qui n'est pas le
 * sien — voir TripServiceImpl.cancel). Documenté plutôt que contourné (§117).
 */
@Component({
  selector: 'app-admin-trips-list',
  imports: [RouterLink, SpinnerComponent, ErrorStateComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trips-list.page.html',
})
export class AdminTripsListPage {
  private readonly adminService = inject(AdminService);

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
    this.adminService.listAllTrips(page, 20).subscribe({
      next: ({ trips, pagination }) => {
        this.trips.set(trips);
        this.pagination.set(pagination);
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }
}
