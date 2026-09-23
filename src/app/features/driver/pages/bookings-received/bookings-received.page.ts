import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BookingService } from '../../../bookings/services/booking.service';
import { BookingResponse } from '../../../../core/models/booking.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

type LoadState = 'loading' | 'success' | 'error';

/** §27 : réservations reçues sur les trajets du conducteur (GET /api/v1/bookings/received). */
@Component({
  selector: 'app-driver-bookings-received',
  imports: [RouterLink, SpinnerComponent, EmptyStateComponent, ErrorStateComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bookings-received.page.html',
})
export class DriverBookingsReceivedPage {
  private readonly bookingService = inject(BookingService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly bookings = signal<BookingResponse[]>([]);
  protected readonly pagination = signal<PaginationMeta>({ page: 0, size: 10, totalElements: 0, totalPages: 0 });

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
    this.bookingService.listReceived(page, 10).subscribe({
      next: ({ bookings, pagination }) => {
        this.bookings.set(bookings);
        this.pagination.set(pagination);
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }
}
