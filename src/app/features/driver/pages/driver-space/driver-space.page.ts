import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { ActionItem, ActionListComponent } from '../../../../shared/components/action-list/action-list.component';
import { ChecklistComponent, ChecklistStep } from '../../../../shared/components/checklist/checklist.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { firstName, initials } from '../../../../shared/utils/user-display';

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
  imports: [ActionListComponent, ChecklistComponent, RouterLink, DatePipe, SpinnerComponent, RatingStarsComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './driver-space.page.html',
  styleUrl: './driver-space.page.scss',
})
export class DriverSpacePage {
  private readonly auth = inject(AuthorizationService);
  private readonly tripService = inject(TripService);
  private readonly driverService = inject(DriverService);
  private readonly reviewService = inject(ReviewService);

  protected readonly firstName = computed(() => firstName(this.auth.fullName()));
  protected readonly initials = initials;
  protected readonly loading = signal(true);
  protected readonly profile = signal<DriverProfileResponse | null>(null);
  protected readonly isVerified = computed(() => this.profile()?.verificationStatus === 'VERIFIED');
  protected readonly nextTrip = signal<TripResponse | null>(null);
  private readonly myTrips = signal<TripResponse[]>([]);
  private readonly vehiclesCount = signal<number | null>(null);
  private readonly tripsLoaded = signal(false);

  /** Démarrage guidé : vérification → véhicule → premier trajet (affiché tant que tout n'est pas fait). */
  protected readonly steps = computed<ChecklistStep[]>(() => [
    { label: 'Faire vérifier votre profil', hint: 'Permis de conduire et carte grise.', done: this.isVerified(), route: '/driver/verification', cta: 'Commencer' },
    { label: 'Ajouter votre véhicule', hint: 'Marque, modèle, immatriculation et places.', done: (this.vehiclesCount() ?? 0) > 0, route: '/driver/vehicles', cta: 'Ajouter' },
    { label: 'Publier votre premier trajet', hint: 'Itinéraire, horaires, places et prix.', done: this.myTrips().some((t) => t.status !== 'DRAFT'), route: '/driver/trips/new', cta: 'Publier' },
  ]);
  protected readonly showSteps = computed(() => !!this.profile() && this.vehiclesCount() !== null && this.tripsLoaded());

  /** À faire : terminer les trajets passés (ouvre les avis) et publier les brouillons. */
  protected readonly actions = computed<ActionItem[]>(() => {
    const items: ActionItem[] = [];
    for (const t of this.myTrips()) {
      const route = `${t.departureCity} → ${t.destinationCity}`;
      const past = new Date(`${t.departureDate}T${t.departureTime}`).getTime() <= Date.now();
      if (past && (t.status === 'PUBLISHED' || t.status === 'FULL' || t.status === 'EXPIRED')) {
        items.push({ key: `done-${t.id}`, icon: 'clock', title: `Terminez votre trajet ${route}`,
          hint: 'Vos passagers pourront alors laisser leur avis.', cta: 'Terminer', route: '/driver/trips' });
      } else if (t.status === 'DRAFT') {
        items.push({ key: `draft-${t.id}`, icon: 'route', title: `Publiez votre brouillon ${route}`,
          hint: 'Il n\'est pas encore visible des passagers.', cta: 'Publier', route: '/driver/trips', tone: 'info' });
      }
    }
    return items;
  });
  protected readonly reviews = signal<ReviewResponse[]>([]);
  protected readonly reviewsLoading = signal(true);
  protected readonly verificationLabels = VERIFICATION_LABELS;

  protected bookedSeats(t: TripResponse): number {
    return Math.max(0, t.totalSeats - t.availableSeats);
  }

  protected fillPercent(t: TripResponse): number {
    return t.totalSeats > 0 ? Math.round((this.bookedSeats(t) / t.totalSeats) * 100) : 0;
  }

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

    this.driverService.listMyVehicles().subscribe({
      next: (vehicles) => this.vehiclesCount.set(vehicles.length),
      error: () => this.vehiclesCount.set(0),
    });

    this.tripService.listMine(0, 20).subscribe({
      next: ({ trips }) => {
        this.myTrips.set(trips);
        this.tripsLoaded.set(true);
        this.nextTrip.set(
          trips
            .filter((t) => t.status === 'PUBLISHED')
            .sort((a, b) => a.departureDate.localeCompare(b.departureDate))[0] ?? null,
        );
        this.loading.set(false);
      },
      error: () => {
        this.tripsLoaded.set(true);
        this.loading.set(false);
      },
    });
  }
}
