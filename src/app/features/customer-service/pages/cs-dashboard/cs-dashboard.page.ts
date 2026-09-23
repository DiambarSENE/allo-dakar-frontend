import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cs-dashboard',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container" style="padding-block: 2rem;">
      <h1>Service client</h1>
      <div class="dashboard__grid">
        <a class="card card--interactive dashboard__tile" routerLink="/customer-service/users"><h2>Utilisateurs</h2></a>
        <a class="card card--interactive dashboard__tile" routerLink="/customer-service/bookings"><h2>Réservations</h2></a>
        <a class="card card--interactive dashboard__tile" routerLink="/customer-service/trips"><h2>Trajets</h2></a>
        <a class="card card--interactive dashboard__tile" routerLink="/customer-service/disputes"><h2>Litiges</h2></a>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .dashboard__tile h2 {
        margin: 0;
        font-size: 1.05rem;
      }
    `,
  ],
})
export class CsDashboardPage {}
