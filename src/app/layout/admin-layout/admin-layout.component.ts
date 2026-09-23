import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthorizationService } from '../../core/auth/authorization.service';

const ADMIN_NAV = [
  { label: 'Tableau de bord', route: '/admin' },
  { label: 'Utilisateurs', route: '/admin/users' },
  { label: 'Vérifications conducteurs', route: '/admin/verifications' },
  { label: 'Trajets', route: '/admin/trips' },
  { label: 'Réservations', route: '/admin/bookings' },
  { label: 'Paiements', route: '/admin/payments' },
  { label: 'Signalements', route: '/admin/reports' },
] as const;

/** §56 : enveloppe /admin/** (protégé par adminGuard dans app.routes.ts). */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  protected readonly auth = inject(AuthorizationService);
  protected readonly navItems = ADMIN_NAV;
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
