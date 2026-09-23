import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * §44 : pas de statistiques agrégées ici (nombre d'utilisateurs, revenus…) — le backend
 * n'expose aucun endpoint de statistiques (§44 : "ne pas inventer de statistiques"). Chaque
 * tuile renvoie vers une liste paginée réelle plutôt qu'un chiffre fabriqué.
 */
@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container" style="padding-block: 2rem;">
      <h1>Administration</h1>
      <div class="dashboard__grid">
        <a class="card card--interactive dashboard__tile" routerLink="/admin/users"><h2>Utilisateurs</h2></a>
        <a class="card card--interactive dashboard__tile" routerLink="/admin/verifications"><h2>Vérifications conducteurs</h2></a>
        <a class="card card--interactive dashboard__tile" routerLink="/admin/trips"><h2>Trajets</h2></a>
        <a class="card card--interactive dashboard__tile" routerLink="/admin/bookings"><h2>Réservations</h2></a>
        <a class="card card--interactive dashboard__tile" routerLink="/admin/payments"><h2>Paiements</h2></a>
        <a class="card card--interactive dashboard__tile" routerLink="/admin/reports"><h2>Signalements</h2></a>
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
export class AdminDashboardPage {}
