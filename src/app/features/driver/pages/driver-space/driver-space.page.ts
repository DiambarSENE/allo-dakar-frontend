import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TripService } from '../../../trips/services/trip.service';
import { DriverService } from '../../services/driver.service';
import { ReviewService } from '../../../reviews/services/review.service';
import { TripResponse } from '../../../../core/models/trip.model';
import { DriverProfileResponse } from '../../../../core/models/user.model';
import { ReviewResponse } from '../../../../core/models/review.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { RatingStarsComponent } from '../../../../shared/components/rating-stars/rating-stars.component';

const VERIFICATION_LABELS: Record<string, string> = {
  PENDING: 'En attente de soumission',
  UNDER_REVIEW: "En cours d'examen",
  VERIFIED: 'Vérifié',
  REJECTED: 'Rejeté',
  REQUIRES_MORE_INFORMATION: 'Complément requis',
};

/**
 * §27 : "Prochain départ, Réservations, Places, Note, Vérification, Revenus" — les "Revenus"
 * ne sont pas affichés : aucun endpoint n'agrège les paiements reçus par un conducteur (voir
 * §117, à spécifier côté backend si besoin). Statistiques simples uniquement (§27 : "créer des
 * statistiques simples"), dérivées de DriverProfileResponse et des listes déjà exposées.
 */
@Component({
  selector: 'app-driver-space',
  imports: [RouterLink, SpinnerComponent, RatingStarsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './driver-space.page.html',
  styleUrl: './driver-space.page.scss',
})
export class DriverSpacePage {
  private readonly tripService = inject(TripService);
  private readonly driverService = inject(DriverService);
  private readonly reviewService = inject(ReviewService);

  protected readonly loading = signal(true);
  protected readonly profile = signal<DriverProfileResponse | null>(null);
  protected readonly nextTrip = signal<TripResponse | null>(null);
  protected readonly reviews = signal<ReviewResponse[]>([]);
  protected readonly reviewsLoading = signal(true);
  protected readonly verificationLabels = VERIFICATION_LABELS;

  constructor() {
    this.driverService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.reviewService.listForUser(profile.userId, 0, 3).subscribe({
          next: ({ reviews }) => {
            this.reviews.set(reviews);
            this.reviewsLoading.set(false);
          },
          error: () => this.reviewsLoading.set(false),
        });
      },
      error: () => this.reviewsLoading.set(false),
    });

    this.tripService.listMine(0, 20).subscribe({
      next: ({ trips }) => {
        this.nextTrip.set(
          trips
            .filter((t) => t.status === 'PUBLISHED')
            .sort((a, b) => a.departureDate.localeCompare(b.departureDate))[0] ?? null,
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
