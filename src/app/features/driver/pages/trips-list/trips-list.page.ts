import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TripService } from '../../../trips/services/trip.service';
import { TripResponse } from '../../../../core/models/trip.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ToastService } from '../../../../core/services/toast.service';

type LoadState = 'loading' | 'success' | 'error';

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'badge--muted',
  PUBLISHED: 'badge--success',
  FULL: 'badge--info',
  IN_PROGRESS: 'badge--info',
  COMPLETED: 'badge--muted',
  CANCELLED: 'badge--danger',
  EXPIRED: 'badge--danger',
};

@Component({
  selector: 'app-driver-trips-list',
  imports: [RouterLink, SpinnerComponent, EmptyStateComponent, ErrorStateComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trips-list.page.html',
})
export class DriverTripsListPage {
  private readonly tripService = inject(TripService);
  private readonly toast = inject(ToastService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly trips = signal<TripResponse[]>([]);
  protected readonly pagination = signal<PaginationMeta>({ page: 0, size: 10, totalElements: 0, totalPages: 0 });
  protected readonly publishingId = signal<string | null>(null);

  constructor() {
    this.load(0);
  }

  protected badgeClass(status: string): string {
    return STATUS_BADGE[status] ?? 'badge--muted';
  }

  protected onPageChange(page: number): void {
    this.load(page);
  }

  protected retry(): void {
    this.load(this.pagination().page);
  }

  protected publish(trip: TripResponse): void {
    this.publishingId.set(trip.id);
    this.tripService.publish(trip.id).subscribe({
      next: () => {
        this.publishingId.set(null);
        this.toast.success('Trajet publié.');
        this.load(this.pagination().page);
      },
      error: () => this.publishingId.set(null),
    });
  }

  protected cancel(trip: TripResponse): void {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce trajet ?')) {
      return;
    }
    this.tripService.cancel(trip.id).subscribe({
      next: () => {
        this.toast.success('Trajet annulé.');
        this.load(this.pagination().page);
      },
    });
  }

  private load(page: number): void {
    this.state.set('loading');
    this.tripService.listMine(page, 10).subscribe({
      next: ({ trips, pagination }) => {
        this.trips.set(trips);
        this.pagination.set(pagination);
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }
}
