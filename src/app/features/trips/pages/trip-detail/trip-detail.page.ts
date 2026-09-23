import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TripService } from '../../services/trip.service';
import { BookingService } from '../../../bookings/services/booking.service';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ToastService } from '../../../../core/services/toast.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { TripResponse } from '../../../../core/models/trip.model';

type LoadState = 'loading' | 'success' | 'error';

const TRIP_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
  FULL: 'Complet',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  EXPIRED: 'Expiré',
};

/**
 * §13 : détail complet d'un trajet + entrée du parcours de réservation (§30). Le nombre de
 * places restantes affiché n'est qu'indicatif — le backend reste l'autorité finale à la
 * soumission (§116) : un 409 BOOKING_SEATS_UNAVAILABLE est géré explicitement ci-dessous,
 * avec rafraîchissement du trajet plutôt qu'un simple toast générique.
 */
@Component({
  selector: 'app-trip-detail',
  imports: [SpinnerComponent, ErrorStateComponent, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trip-detail.page.html',
  styleUrl: './trip-detail.page.scss',
})
export class TripDetailPage {
  private readonly tripService = inject(TripService);
  private readonly bookingService = inject(BookingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly toast = inject(ToastService);
  private readonly fb = new FormBuilder();

  protected readonly auth = inject(AuthorizationService);
  protected readonly state = signal<LoadState>('loading');
  protected readonly trip = signal<TripResponse | null>(null);
  protected readonly submitting = signal(false);
  protected readonly conflictMessage = signal<string | null>(null);

  protected readonly statusLabel = computed(() => {
    const t = this.trip();
    return t ? (TRIP_STATUS_LABELS[t.status] ?? t.status) : '';
  });

  protected readonly canReserve = computed(() => {
    const t = this.trip();
    return !!t && t.status === 'PUBLISHED' && t.availableSeats > 0;
  });

  protected readonly bookingForm = this.fb.nonNullable.group({
    numberOfSeats: [1, [Validators.required, Validators.min(1)]],
  });

  private readonly tripId = this.route.snapshot.paramMap.get('id')!;

  constructor() {
    this.loadTrip();
  }

  private loadTrip(): void {
    this.state.set('loading');
    this.tripService.getById(this.tripId).subscribe({
      next: (trip) => {
        this.trip.set(trip);
        this.state.set('success');
        const maxSeats = Math.max(1, trip.availableSeats);
        this.bookingForm.controls.numberOfSeats.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(maxSeats),
        ]);
        this.bookingForm.controls.numberOfSeats.updateValueAndValidity();
      },
      error: () => this.state.set('error'),
    });
  }

  protected reserve(): void {
    if (this.bookingForm.invalid || this.submitting()) {
      this.bookingForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.conflictMessage.set(null);

    this.bookingService
      .create({ tripId: this.tripId, numberOfSeats: this.bookingForm.getRawValue().numberOfSeats })
      .subscribe({
        next: (booking) => {
          this.submitting.set(false);
          void this.router.navigate(['/booking-confirmation', booking.id]);
        },
        error: (error: unknown) => {
          this.submitting.set(false);
          if (error instanceof HttpErrorResponse && error.status === 409) {
            // §30 : message dédié + rafraîchissement du trajet, jamais un simple toast.
            this.conflictMessage.set(
              'Désolé, les places disponibles viennent d’être modifiées. Le trajet a été actualisé.',
            );
            this.loadTrip();
          } else if (error instanceof HttpErrorResponse) {
            this.toast.error(this.errorHandler.resolveMessage(error));
          }
        },
      });
  }

  protected login(): void {
    void this.auth.login(window.location.href);
  }
}
