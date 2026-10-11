import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { StatusLabelPipe } from '../../../../shared/pipes/status.pipe';
import { RouterLink } from '@angular/router';

import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ReviewFormComponent } from '../../../../shared/components/review-form/review-form.component';
import { ReviewService } from '../../../reviews/services/review.service';
import { TripService } from '../../../trips/services/trip.service';
import { ToastService } from '../../../../core/services/toast.service';

import { BookingService } from '../../../bookings/services/booking.service';
import { BookingResponse } from '../../../../core/models/booking.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { DataTableDirective } from '../../../../shared/directives/data-table.directive';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-passenger-bookings-list',
  imports: [ModalComponent, ReviewFormComponent, StatusLabelPipe, DataTableDirective, RouterLink, SpinnerComponent, EmptyStateComponent, ErrorStateComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bookings-list.page.html',
})
export class PassengerBookingsListPage {
  private readonly bookingService = inject(BookingService);
  private readonly reviewService = inject(ReviewService);
  private readonly tripService = inject(TripService);
  private readonly toast = inject(ToastService);

  /** Réservation que le passager est en train de noter + l'identifiant du conducteur à noter. */
  protected readonly reviewing = signal<{ booking: BookingResponse; driverId: string } | null>(null);
  protected readonly openingId = signal<string | null>(null);
  /** Trajets déjà notés par ce passager (pour ne pas reproposer l'avis). */
  protected readonly reviewedTripIds = signal<ReadonlySet<string>>(new Set());

  protected readonly state = signal<LoadState>('loading');
  protected readonly bookings = signal<BookingResponse[]>([]);
  protected readonly pagination = signal<PaginationMeta>({ page: 0, size: 10, totalElements: 0, totalPages: 0 });

  constructor() {
    this.load(0);
    this.reviewService.listWritten(0, 100).subscribe({
      next: ({ reviews }) => this.reviewedTripIds.set(new Set(reviews.map((r) => r.tripId))),
    });
  }

  protected canReview(booking: BookingResponse): boolean {
    return booking.status === 'COMPLETED' && !this.reviewedTripIds().has(booking.trip.id);
  }

  protected openReview(booking: BookingResponse): void {
    this.openingId.set(booking.id);
    // TripSummaryResponse n'expose pas le conducteur : on le récupère via le détail du trajet.
    this.tripService.getById(booking.trip.id).subscribe({
      next: (trip) => {
        this.openingId.set(null);
        this.reviewing.set({ booking, driverId: trip.driverId });
      },
      error: () => this.openingId.set(null),
    });
  }

  protected onReviewSubmitted(): void {
    const current = this.reviewing();
    if (current) {
      this.reviewedTripIds.update((ids) => new Set([...ids, current.booking.trip.id]));
    }
    this.reviewing.set(null);
    this.toast.success('Merci pour votre avis !');
  }

  protected onPageChange(page: number): void {
    this.load(page);
  }

  protected retry(): void {
    this.load(this.pagination().page);
  }

  private load(page: number): void {
    this.state.set('loading');
    this.bookingService.listMine(page, 10).subscribe({
      next: ({ bookings, pagination }) => {
        this.bookings.set(bookings);
        this.pagination.set(pagination);
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }
}
