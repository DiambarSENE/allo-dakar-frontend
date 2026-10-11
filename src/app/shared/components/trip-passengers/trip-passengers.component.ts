import { RouterLink } from '@angular/router';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';

import { AuthorizationService } from '../../../core/auth/authorization.service';
import { TripPassengerResponse } from '../../../core/models/trip-passenger.model';
import { TripService } from '../../../features/trips/services/trip.service';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-trip-passengers',
  imports: [SpinnerComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="passengers">
      <button type="button" class="btn btn--outline btn--sm" (click)="toggle()">
        {{ opened() ? 'Masquer les passagers' : 'Voir les passagers' }}
      </button>

      @if (opened()) {
        <div class="passengers__panel">
          @if (loading()) {
            <app-spinner [size]="20" label="Chargement des passagers…" />
          } @else if (error()) {
            <div class="passengers__error">
              <span>Impossible de charger les passagers.</span>
              <button type="button" class="btn btn--outline btn--sm" (click)="load()">Réessayer</button>
            </div>
          } @else if (passengers().length === 0) {
            <p class="passengers__empty">Aucun passager pour ce trajet.</p>
          } @else {
            <div class="table-wrapper">
              <table class="data-table passengers__table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    @if (showPhone()) {
                      <th>Téléphone</th>
                    }
                    <th>Places</th>
                    <th>Statut</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (passenger of passengers(); track passenger.bookingId) {
                    <tr>
                      <td>{{ passenger.lastName }}</td>
                      <td>{{ passenger.firstName }}</td>
                      @if (showPhone()) {
                        <td>{{ passenger.phone || '—' }}</td>
                      }
                      <td>{{ passenger.numberOfSeats }}</td>
                      <td><span class="badge badge--muted">{{ passenger.bookingStatus }}</span></td>
                      <td>
                        <a [routerLink]="['/reports/new']" [queryParams]="{ reportedUserId: passenger.passengerId, bookingId: passenger.bookingId }">Signaler</a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .passengers { display: flex; flex-direction: column; gap: .65rem; min-width: 220px; }
    .passengers__panel { padding: .75rem; border: 1px solid var(--color-border, #e5e1d8); border-radius: .65rem; background: var(--color-surface, #fff); }
    .passengers__empty, .passengers__error { margin: .25rem 0; color: var(--color-muted, #6b7280); }
    .passengers__error { display: flex; align-items: center; justify-content: space-between; gap: .75rem; }
    .passengers__table { margin: 0; }
  `],
})
export class TripPassengersComponent {
  readonly tripId = input.required<string>();

  private readonly tripService = inject(TripService);
  private readonly authorization = inject(AuthorizationService);

  protected readonly opened = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);
  protected readonly passengers = signal<TripPassengerResponse[]>([]);

  protected readonly showPhone = computed(() => this.authorization.isAdmin() || this.authorization.isCustomerService());

  protected toggle(): void {
    const next = !this.opened();
    this.opened.set(next);
    if (next && this.passengers().length === 0) {
      this.load();
    }
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.tripService.listPassengers(this.tripId()).subscribe({
      next: (passengers) => {
        this.passengers.set(passengers);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}
