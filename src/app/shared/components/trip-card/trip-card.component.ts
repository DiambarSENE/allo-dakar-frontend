import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TripResponse } from '../../../core/models/trip.model';

/**
 * Carte de trajet réutilisable (§57/§58). LIMITATION CONNUE documentée (§117 — ne pas inventer
 * le backend) : TripResponse n'expose actuellement ni la note moyenne du conducteur, ni son
 * badge de vérification, ni sa photo — seul driverFullName est disponible. Le cahier des
 * charges frontend (§12) demande ces informations ; les afficher nécessiterait d'abord
 * d'étendre TripResponse côté backend (driverAverageRating, driverVerified) — signalé comme
 * évolution à faire plutôt que masqué ou inventé côté frontend.
 */
@Component({
  selector: 'app-trip-card',
  imports: [RouterLink, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="trip-card card card--interactive">
      <div class="trip-card__route">
        <div>
          <p class="trip-card__city">{{ trip().departureCity }}</p>
          <p class="trip-card__meta">{{ trip().departureTime.slice(0, 5) }}</p>
        </div>
        <span class="trip-card__arrow" aria-hidden="true">→</span>
        <div>
          <p class="trip-card__city">{{ trip().destinationCity }}</p>
        </div>
      </div>

      <div class="trip-card__details">
        <span class="badge badge--muted">{{ trip().departureDate }}</span>
        <span class="badge badge--muted">{{ trip().vehicle.brand }} {{ trip().vehicle.model }}</span>
        <span class="badge" [class.badge--success]="trip().availableSeats > 0" [class.badge--danger]="trip().availableSeats === 0">
          {{ trip().availableSeats }} place{{ trip().availableSeats > 1 ? 's' : '' }} restante{{
            trip().availableSeats > 1 ? 's' : ''
          }}
        </span>
      </div>

      <div class="trip-card__footer">
        <div class="trip-card__driver">
          <span class="trip-card__driver-avatar" aria-hidden="true">{{ initials() }}</span>
          <span>{{ trip().driverFullName }}</span>
        </div>
        <p class="trip-card__price">{{ trip().pricePerSeat | number: '1.0-0' }} FCFA<span> / place</span></p>
      </div>

      <a class="btn btn--primary btn--block" [routerLink]="['/trips', trip().id]">Voir le trajet</a>
    </article>
  `,
  styles: [
    `
      .trip-card {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .trip-card__route {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .trip-card__city {
        font-weight: 700;
        font-size: 1.05rem;
        margin: 0;
      }

      .trip-card__meta {
        margin: 0;
        font-size: 0.8rem;
        color: var(--color-muted, #6b7280);
      }

      .trip-card__arrow {
        color: var(--color-primary, #e2672a);
        font-size: 1.2rem;
      }

      .trip-card__details {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }

      .trip-card__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .trip-card__driver {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
      }

      .trip-card__driver-avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--color-primary, #e2672a);
        color: #fff;
        font-size: 0.75rem;
        font-weight: 700;
      }

      .trip-card__price {
        margin: 0;
        font-weight: 700;
        color: var(--color-secondary, #0f6b5c);

        span {
          font-weight: 400;
          font-size: 0.75rem;
          color: var(--color-muted, #6b7280);
        }
      }
    `,
  ],
})
export class TripCardComponent {
  readonly trip = input.required<TripResponse>();

  protected initials(): string {
    const name = this.trip().driverFullName ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }
}
