import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthorizationService } from '../../core/auth/authorization.service';
import { IconComponent, IconName } from '../../shared/components/icon/icon.component';
import { initials, primaryRoleLabel } from '../../shared/utils/user-display';
import { SupportWidgetComponent } from '../../shared/components/support-widget/support-widget.component';

const ADMIN_NAV = [
  { label: 'Tableau de bord', route: '/admin', icon: 'chart' },
  { label: 'Utilisateurs', route: '/admin/users', icon: 'users' },
  { label: 'Vérifications conducteurs', route: '/admin/verifications', icon: 'shield' },
  { label: 'Trajets', route: '/admin/trips', icon: 'route' },
  { label: 'Réservations', route: '/admin/bookings', icon: 'ticket' },
  { label: 'Paiements', route: '/admin/payments', icon: 'wallet' },
  { label: 'Signalements', route: '/admin/reports', icon: 'flag' },
  { label: 'Avis', route: '/admin/reviews', icon: 'star' },
] as const satisfies readonly { label: string; route: string; icon: IconName }[];

/** §56 : enveloppe /admin/** (protégé par adminGuard dans app.routes.ts). */
@Component({
  selector: 'app-admin-layout',
  imports: [BackButtonComponent, RouterOutlet, RouterLink, RouterLinkActive, SupportWidgetComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  protected readonly auth = inject(AuthorizationService);
  protected readonly navItems = ADMIN_NAV;
  protected readonly sidebarOpen = signal(false);
  protected readonly initials = computed(() => initials(this.auth.fullName()));
  protected readonly roleLabel = computed(() => primaryRoleLabel(this.auth.roles()));

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
