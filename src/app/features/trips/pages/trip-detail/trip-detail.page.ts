import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { BackButtonComponent } from '../../../../shared/components/back-button/back-button.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PricingService } from '../../../../core/services/pricing.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TripService } from '../../services/trip.service';
import { BookingService } from '../../../bookings/services/booking.service';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ToastService } from '../../../../core/services/toast.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { TripPassengersComponent } from '../../../../shared/components/trip-passengers/trip-passengers.component';
import { TripResponse } from '../../../../core/models/trip.model';
import { BookingResponse } from '../../../../core/models/booking.model';

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
  imports: [BackButtonComponent, DatePipe, DecimalPipe, IconComponent, SpinnerComponent, ErrorStateComponent, TripPassengersComponent, ReactiveFormsModule, RouterLink],
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
  protected readonly pricing = inject(PricingService);
  protected readonly state = signal<LoadState>('loading');
  protected readonly trip = signal<TripResponse | null>(null);
  protected readonly submitting = signal(false);
  protected readonly conflictMessage = signal<string | null>(null);
  protected readonly existingBooking = signal<BookingResponse | null>(null);
  protected readonly reservationCheckLoading = signal(false);

  /** Nombre de places saisi dans le formulaire de réservation (0 si invalide). */
  protected seats(): number {
    return Number(this.bookingForm.value.numberOfSeats) || 0;
  }

  protected readonly statusLabel = computed(() => {
    const t = this.trip();
    return t ? (TRIP_STATUS_LABELS[t.status] ?? t.status) : '';
  });

  protected readonly isRestrictedRole = computed(() =>
    this.auth.isDriver() || this.auth.isAdmin() || this.auth.isCustomerService(),
  );

  protected readonly activeBooking = computed(() => {
    const booking = this.existingBooking();
    if (!booking) return null;
    return ['PENDING', 'CONFIRMED', 'COMPLETED'].includes(booking.status) ? booking : null;
  });

  protected readonly canReserve = computed(() => {
    const t = this.trip();
    return (
      !!t &&
      t.status === 'PUBLISHED' &&
      t.availableSeats > 0 &&
      this.auth.isAuthenticated() &&
      this.auth.isPassenger() &&
      !this.isRestrictedRole() &&
      !this.activeBooking() &&
      !this.reservationCheckLoading()
    );
  });

  protected readonly reservationMessage = computed(() => {
    const booking = this.activeBooking();
    if (booking?.status === 'PENDING') {
      return 'Vous avez déjà une réservation en attente de paiement pour ce trajet.';
    }
    if (booking?.status === 'CONFIRMED') {
      return 'Vous avez déjà réservé ce trajet.';
    }
    if (booking?.status === 'COMPLETED') {
      return 'Vous avez déjà effectué ce trajet avec cette réservation.';
    }
    if (this.isRestrictedRole()) {
      return 'La réservation est disponible uniquement pour les passagers.';
    }
    if (this.auth.isAuthenticated() && !this.auth.isPassenger()) {
      return "Votre compte n'est pas autorisé à réserver un trajet.";
    }
    return null;
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
        this.loadExistingReservation(trip.id);
      },
      error: () => this.state.set('error'),
    });
  }

  private loadExistingReservation(tripId: string): void {
    this.existingBooking.set(null);

    // Seul un passager éligible a besoin de cette vérification. Les autres rôles ne
    // déclenchent donc pas une requête inutile vers /bookings/me.
    if (!this.auth.isAuthenticated() || !this.auth.isPassenger() || this.isRestrictedRole()) {
      return;
    }

    this.reservationCheckLoading.set(true);
    this.bookingService.listMine(0, 50).subscribe({
      next: ({ bookings }) => {
        const booking = bookings
          .filter((item) => item.trip.id === tripId)
          .filter((item) => ['PENDING', 'CONFIRMED', 'COMPLETED'].includes(item.status))
          .sort((a, b) => b.bookedAt.localeCompare(a.bookedAt))[0] ?? null;
        this.existingBooking.set(booking);
        this.reservationCheckLoading.set(false);
      },
      error: () => {
        // La vérification d'une réservation existante améliore l'UX mais ne doit pas
        // empêcher un passager de réserver si l'appel de contrôle échoue.
        this.reservationCheckLoading.set(false);
      },
    });
  }

  protected continuePayment(): void {
    const booking = this.activeBooking();
    if (booking) {
      void this.router.navigate(['/bookings', booking.id]);
    }
  }

  protected reserve(): void {
    if (!this.canReserve()) {
      this.bookingForm.markAllAsTouched();
      return;
    }
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
