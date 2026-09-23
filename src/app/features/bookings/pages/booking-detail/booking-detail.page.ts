import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BookingService } from '../../services/booking.service';
import { BookingResponse } from '../../../../core/models/booking.model';
import { TripService } from '../../../trips/services/trip.service';
import { PaymentService } from '../../../payments/services/payment.service';
import { PaymentMethod } from '../../../../core/models/enums';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { ReviewFormComponent } from '../../../../shared/components/review-form/review-form.component';
import { ToastService } from '../../../../core/services/toast.service';

type LoadState = 'loading' | 'success' | 'error';

const CANCELLABLE_STATUSES = new Set(['PENDING', 'CONFIRMED']);
const PAYMENT_METHODS: PaymentMethod[] = ['MOBILE_MONEY', 'CASH', 'CARD', 'BANK_TRANSFER', 'OTHER'];

/**
 * §32/§33/§40 : sur une réservation PENDING sans paiement réussi, propose de payer (le backend
 * confirme automatiquement la réservation quand le Payment associé passe à SUCCESS — règle
 * §48-3, voir PaymentServiceImpl). Sur une réservation COMPLETED, propose de laisser un avis sur
 * le conducteur — driverId n'est exposé que par TripResponse, pas par TripSummaryResponse
 * embarqué ici (voir booking.model.ts), d'où le second appel à TripService.getById().
 */
@Component({
  selector: 'app-booking-detail',
  imports: [RouterLink, ReactiveFormsModule, SpinnerComponent, ErrorStateComponent, DatePipe, ReviewFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking-detail.page.html',
})
export class BookingDetailPage {
  private readonly bookingService = inject(BookingService);
  private readonly tripService = inject(TripService);
  private readonly paymentService = inject(PaymentService);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly fb = new FormBuilder();

  protected readonly state = signal<LoadState>('loading');
  protected readonly booking = signal<BookingResponse | null>(null);
  protected readonly cancelling = signal(false);
  protected readonly paying = signal(false);
  protected readonly driverUserId = signal<string | null>(null);
  protected readonly reviewSubmitted = signal(false);
  protected readonly paymentMethods = PAYMENT_METHODS;

  protected readonly paymentForm = this.fb.nonNullable.group({
    paymentMethod: ['MOBILE_MONEY' as PaymentMethod, Validators.required],
  });

  private readonly id = this.route.snapshot.paramMap.get('id')!;

  constructor() {
    this.load();
  }

  protected canCancel(booking: BookingResponse): boolean {
    return CANCELLABLE_STATUSES.has(booking.status);
  }

  protected canPay(booking: BookingResponse): boolean {
    return booking.status === 'PENDING' && booking.paymentStatus !== 'SUCCESS';
  }

  protected pay(): void {
    this.paying.set(true);
    this.paymentService
      .initiate({ bookingId: this.id, paymentMethod: this.paymentForm.getRawValue().paymentMethod })
      .subscribe({
        next: (payment) => {
          this.paying.set(false);
          if (payment.status === 'SUCCESS') {
            this.toast.success('Paiement effectué — réservation confirmée.');
          } else {
            this.toast.error(payment.failureReason ?? 'Le paiement a échoué, veuillez réessayer.');
          }
          this.load();
        },
        error: () => this.paying.set(false),
      });
  }

  protected cancel(): void {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }
    this.cancelling.set(true);
    this.bookingService.cancel(this.id).subscribe({
      next: (booking) => {
        this.booking.set(booking);
        this.cancelling.set(false);
        this.toast.success('Réservation annulée.');
      },
      error: () => this.cancelling.set(false),
    });
  }

  private load(): void {
    this.state.set('loading');
    this.bookingService.getById(this.id).subscribe({
      next: (booking) => {
        this.booking.set(booking);
        this.state.set('success');
        if (booking.status === 'COMPLETED') {
          this.tripService.getById(booking.trip.id).subscribe((trip) => this.driverUserId.set(trip.driverId));
        }
      },
      error: () => this.state.set('error'),
    });
  }
}
