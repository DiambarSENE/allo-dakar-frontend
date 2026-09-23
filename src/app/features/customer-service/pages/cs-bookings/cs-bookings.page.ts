import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { CustomerServiceService } from '../../services/customer-service.service';
import { BookingResponse } from '../../../../core/models/booking.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ToastService } from '../../../../core/services/toast.service';

type LoadState = 'loading' | 'success' | 'error';
const CANCELLABLE_STATUSES = new Set(['PENDING', 'CONFIRMED']);

/**
 * §43 "aider à traiter certaines annulations" — un motif est OBLIGATOIRE côté backend
 * (cancelOnBehalf), demandé via prompt() par cohérence avec le reste du module admin.
 */
@Component({
  selector: 'app-cs-bookings',
  imports: [SpinnerComponent, ErrorStateComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cs-bookings.page.html',
})
export class CsBookingsPage {
  private readonly customerService = inject(CustomerServiceService);
  private readonly toast = inject(ToastService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly bookings = signal<BookingResponse[]>([]);
  protected readonly pagination = signal<PaginationMeta>({ page: 0, size: 20, totalElements: 0, totalPages: 0 });
  protected readonly cancellingId = signal<string | null>(null);

  constructor() {
    this.load(0);
  }

  protected canCancel(b: BookingResponse): boolean {
    return CANCELLABLE_STATUSES.has(b.status);
  }

  protected cancel(b: BookingResponse): void {
    const reason = prompt(`Motif d'annulation de la réservation ${b.bookingReference} (obligatoire) :`);
    if (!reason) return;
    this.cancellingId.set(b.id);
    this.customerService.cancelBooking(b.id, reason).subscribe({
      next: () => {
        this.cancellingId.set(null);
        this.toast.success('Réservation annulée.');
        this.load(this.pagination().page);
      },
      error: () => this.cancellingId.set(null),
    });
  }

  protected onPageChange(page: number): void {
    this.load(page);
  }

  protected retry(): void {
    this.load(this.pagination().page);
  }

  private load(page: number): void {
    this.state.set('loading');
    this.customerService.listBookings(page, 20).subscribe({
      next: ({ bookings, pagination }) => {
        this.bookings.set(bookings);
        this.pagination.set(pagination);
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }
}
