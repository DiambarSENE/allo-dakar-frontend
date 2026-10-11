import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PricingService } from '../../../core/services/pricing.service';
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
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="trip-card card card--interactive" [routerLink]="['/trips', trip().id]"
       [attr.aria-label]="trip().departureCity + ' vers ' + trip().destinationCity + ', départ le ' + trip().departureDate + ', ' + (trip().availableSeats > 0 ? trip().availableSeats + ' places disponibles' : 'complet')">
      <div class="trip-card__date">
        <span class="trip-card__date-icon" aria-hidden="true">▦</span>
        <time [attr.datetime]="trip().departureDate">{{ trip().departureDate | date: 'EEE d MMM yyyy' }}</time>
        <span class="trip-card__time">{{ trip().departureTime.slice(0, 5) }}</span>
      </div>
      <div class="trip-card__route">
        <div class="trip-card__location"><span class="trip-card__label">DÉPART</span><p class="trip-card__city">{{ trip().departureCity }}</p>
          @if (trip().departureAddress) { <p class="trip-card__address">{{ trip().departureAddress }}</p> }
        </div>
        <span class="trip-card__arrow" aria-hidden="true">→</span>
        <div class="trip-card__location"><span class="trip-card__label">ARRIVÉE</span><p class="trip-card__city">{{ trip().destinationCity }}</p>
          @if (trip().destinationAddress) { <p class="trip-card__address">{{ trip().destinationAddress }}</p> }
        </div>
      </div>
      <div class="trip-card__bottom">
        <p class="trip-card__price">{{ trip().pricePerSeat | number: '1.0-0' }} <span>FCFA</span><small>par place · + {{ pricing.reservationFee() | number: '1.0-0' }} FCFA de frais de réservation</small></p>
        @if (trip().availableSeats > 0) {
          <div class="trip-card__seats" aria-label="Places disponibles">
            <span class="trip-card__people" aria-hidden="true">@for (seat of seatIcons(); track seat) { <span>👤</span> }</span>
            <span class="trip-card__seat-text"><strong>{{ trip().availableSeats }} place{{ trip().availableSeats > 1 ? 's' : '' }}</strong><small>disponible{{ trip().availableSeats > 1 ? 's' : '' }}</small></span>
          </div>
        } @else { <span class="trip-card__full"><span aria-hidden="true">●</span> Complet</span> }
        <span class="trip-card__open" aria-hidden="true">›</span>
      </div>
    </a>`,
  styles: [
    `
      .trip-card { display:flex; flex-direction:column; gap:1rem; min-width:0; padding:1.2rem 1.35rem; color:inherit; text-decoration:none; border:1px solid #e8e1d8; border-radius:16px; background:#fff; box-shadow:0 4px 14px rgba(35,42,38,.035); transition:border-color .18s ease,box-shadow .18s ease,transform .18s ease; }
      .trip-card:hover,.trip-card:focus-visible { border-color:var(--color-primary,#e2672a); box-shadow:0 10px 26px rgba(35,42,38,.09); transform:translateY(-2px); outline:none; }
      .trip-card__date { display:flex; align-items:center; flex-wrap:wrap; gap:.55rem; color:#59645e; font-size:.86rem; }
      .trip-card__date-icon { color:var(--color-primary,#e2672a); font-size:1.1rem; }
      .trip-card__time { padding:.22rem .5rem; border-radius:7px; background:#f6f2ed; color:#293a33; font-weight:700; }
      .trip-card__route { display:grid; grid-template-columns:minmax(0,1fr) auto minmax(0,1fr); align-items:center; gap:.8rem; }
      .trip-card__location { min-width:0; }
      .trip-card__label { display:block; margin-bottom:.25rem; color:#8b938e; font-size:.68rem; font-weight:800; letter-spacing:.08em; }
      .trip-card__city { margin:0; overflow-wrap:anywhere; font-size:clamp(1rem,1.5vw,1.18rem); font-weight:800; color:#19352f; }
      .trip-card__address { margin:.25rem 0 0; color:#77827c; font-size:.8rem; line-height:1.4; overflow-wrap:anywhere; }
      .trip-card__arrow { color:var(--color-primary,#e2672a); font-size:1.35rem; }
      .trip-card__bottom { display:flex; align-items:center; gap:.85rem; padding-top:.9rem; border-top:1px solid #f0ece6; }
      .trip-card__price { margin:0 auto 0 0; color:var(--color-secondary,#0f6b5c); font-size:1.2rem; font-weight:850; white-space:nowrap; }
      .trip-card__price span { font-size:.9rem; } .trip-card__price small { display:block; margin-top:.12rem; color:#818a85; font-size:.73rem; font-weight:500; }
      .trip-card__seats { display:flex; align-items:center; gap:.55rem; }
      .trip-card__people { display:flex; align-items:center; gap:2px; color:#18765d; font-size:1.1rem; }
      .trip-card__seat-text strong,.trip-card__seat-text small { display:block; } .trip-card__seat-text strong { color:#18765d; font-size:.82rem; } .trip-card__seat-text small { color:#7b8580; font-size:.72rem; }
      .trip-card__full { padding:.45rem .65rem; border-radius:9px; background:#fff0ee; color:#b83e32; font-size:.83rem; font-weight:800; white-space:nowrap; }
      .trip-card__open { display:grid; place-items:center; flex:0 0 30px; width:30px; height:30px; border-radius:50%; background:#fff0e6; color:var(--color-primary,#e2672a); font-size:1.5rem; }
      @media(max-width:480px) { .trip-card { padding:1rem; gap:.85rem; } .trip-card__route { gap:.45rem; } .trip-card__bottom { flex-wrap:wrap; gap:.65rem; } .trip-card__price { flex:1 1 100%; } .trip-card__open { margin-left:auto; } }
    `,
  ]
})
export class TripCardComponent {
  protected readonly pricing = inject(PricingService);
  readonly trip = input.required<TripResponse>();

  protected seatIcons(): number[] {
    return Array.from({ length: Math.min(this.trip().availableSeats, 5) }, (_, index) => index);
  }

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
