import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

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
  imports: [RouterLink, SpinnerComponent, RatingStarsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './passenger-space.page.html',
  styleUrl: './passenger-space.page.scss',
})
export class PassengerSpacePage {
  private readonly bookingService = inject(BookingService);
  private readonly userService = inject(UserService);
  private readonly reviewService = inject(ReviewService);

  protected readonly loading = signal(true);
  protected readonly nextBooking = signal<BookingResponse | null>(null);
  protected readonly reviews = signal<ReviewResponse[]>([]);
  protected readonly reviewsLoading = signal(true);

  constructor() {
    this.bookingService.listMine(0, 20).subscribe({
      next: ({ bookings }) => {
        this.nextBooking.set(
          bookings
            .filter((b) => UPCOMING_STATUSES.has(b.status))
            .sort((a, b) => a.trip.departureDate.localeCompare(b.trip.departureDate))[0] ?? null,
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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
