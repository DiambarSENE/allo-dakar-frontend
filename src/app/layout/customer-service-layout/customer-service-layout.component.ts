import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthorizationService } from '../../core/auth/authorization.service';

const CS_NAV = [
  { label: 'Tableau de bord', route: '/customer-service' },
  { label: 'Utilisateurs', route: '/customer-service/users' },
  { label: 'Réservations', route: '/customer-service/bookings' },
  { label: 'Trajets', route: '/customer-service/trips' },
  { label: 'Litiges', route: '/customer-service/disputes' },
] as const;

/** §56 : enveloppe /customer-service/** (protégé par customerServiceGuard dans app.routes.ts). */
@Component({
  selector: 'app-customer-service-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-service-layout.component.html',
  styleUrl: './customer-service-layout.component.scss',
})
export class CustomerServiceLayoutComponent {
  protected readonly auth = inject(AuthorizationService);
  protected readonly navItems = CS_NAV;
  protected readonly sidebarOpen = signal(false);

  protected toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected logout(): void {
    void this.auth.logout();
  }
}
