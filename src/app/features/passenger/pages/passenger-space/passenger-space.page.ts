import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { ActionItem, ActionListComponent } from '../../../../shared/components/action-list/action-list.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { firstName, initials } from '../../../../shared/utils/user-display';

import { BookingService } from '../../../bookings/services/booking.service';
import { BookingResponse } from '../../../../core/models/booking.model';
import { UserService } from '../../../profile/services/user.service';
import { ReviewService } from '../../../reviews/services/review.service';
import { ReviewResponse } from '../../../../core/models/review.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { RatingStarsComponent } from '../../../../shared/components/rating-stars/rating-stars.component';

const UPCOMING_STATUSES = new Set(['PENDING', 'CONFIRMED']);

/**
 * §26 : "Mes prochaines réservations, Historique, Paiements, Avis, Notifications, Profil"
 * (Jetons/Abonnement exclus du périmètre — voir README). LIMITATION CONNUE (§117) : aucun
 * endpoint n'agrège un profil passager complet (note moyenne, nombre de trajets) —
 * PassengerService existe côté backend mais n'est exposé par aucun PassengerController ;
 * les avis reçus (section ci-dessous) restent accessibles via GET /users/{id}/reviews, qui lui
 * est bien exposé (§40).
 */
@Component({
  selector: 'app-passenger-space',
  imports: [ActionListComponent, RouterLink, DatePipe, SpinnerComponent, RatingStarsComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './passenger-space.page.html',
  styleUrl: './passenger-space.page.scss',
})
export class PassengerSpacePage {
  private readonly auth = inject(AuthorizationService);
  private readonly bookingService = inject(BookingService);
  private readonly userService = inject(UserService);
  private readonly reviewService = inject(ReviewService);

  protected readonly firstName = computed(() => firstName(this.auth.fullName()));
  protected readonly initials = initials;
  protected readonly upcomingCount = signal(0);
  protected readonly totalBookings = signal(0);
  protected readonly loading = signal(true);
  protected readonly nextBooking = signal<BookingResponse | null>(null);
  private readonly recentBookings = signal<BookingResponse[]>([]);
  private readonly reviewedTripIds = signal<ReadonlySet<string>>(new Set());

  /** Prochaines actions utiles : régler une réservation, noter un conducteur après le trajet. */
  protected readonly actions = computed<ActionItem[]>(() => {
    const items: ActionItem[] = [];
    for (const b of this.recentBookings()) {
      const trip = `${b.trip.departureCity} → ${b.trip.destinationCity}`;
      if (b.status === 'PENDING' && b.paymentStatus !== 'SUCCESS') {
        items.push({ key: `pay-${b.id}`, icon: 'wallet', title: `Réglez votre réservation ${trip}`,
          hint: `Total à payer : ${b.totalAmount} FCFA`, cta: 'Payer', route: ['/bookings', b.id] });
      } else if (b.status === 'COMPLETED' && !this.reviewedTripIds().has(b.trip.id)) {
        items.push({ key: `review-${b.id}`, icon: 'star', title: `Comment s'est passé ${trip} ?`,
          hint: 'Votre avis aide les autres passagers.', cta: 'Donner mon avis', route: ['/bookings', b.id], tone: 'info' });
      }
    }
    return items;
  });
  protected readonly reviews = signal<ReviewResponse[]>([]);
  protected readonly reviewsLoading = signal(true);

  constructor() {
    this.bookingService.listMine(0, 20).subscribe({
      next: ({ bookings, pagination }) => {
        this.recentBookings.set(bookings);
        this.totalBookings.set(pagination.totalElements);
        this.upcomingCount.set(bookings.filter((b) => UPCOMING_STATUSES.has(b.status)).length);
        this.nextBooking.set(
          bookings
            .filter((b) => UPCOMING_STATUSES.has(b.status))
            .sort((a, b) => a.trip.departureDate.localeCompare(b.trip.departureDate))[0] ?? null,
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.reviewService.listWritten(0, 100).subscribe({
      next: ({ reviews }) => this.reviewedTripIds.set(new Set(reviews.map((r) => r.tripId))),
    });

    this.userService.getMe().subscribe({
      next: (me) => {
        this.reviewService.listForUser(me.id, 0, 3).subscribe({
          next: ({ reviews }) => {
            this.reviews.set(reviews);
            this.reviewsLoading.set(false);
          },
          error: () => this.reviewsLoading.set(false),
        });
      },
      error: () => this.reviewsLoading.set(false),
    });
  }
}
