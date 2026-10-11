import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthorizationService } from '../../core/auth/authorization.service';
import { IconComponent, IconName } from '../../shared/components/icon/icon.component';
import { initials, primaryRoleLabel } from '../../shared/utils/user-display';

const CS_NAV = [
  { label: 'Tableau de bord', route: '/customer-service', icon: 'chart' },
  { label: 'Utilisateurs', route: '/customer-service/users', icon: 'users' },
  { label: 'Réservations', route: '/customer-service/bookings', icon: 'ticket' },
  { label: 'Trajets', route: '/customer-service/trips', icon: 'route' },
  { label: 'Litiges', route: '/customer-service/disputes', icon: 'scale' },
  { label: 'Messages utilisateurs', route: '/customer-service/support', icon: 'message' },
] as const satisfies readonly { label: string; route: string; icon: IconName }[];

/** §56 : enveloppe /customer-service/** (protégé par customerServiceGuard dans app.routes.ts). */
@Component({
  selector: 'app-customer-service-layout',
  imports: [BackButtonComponent, RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './customer-service-layout.component.html',
  styleUrl: './customer-service-layout.component.scss',
})
export class CustomerServiceLayoutComponent {
  protected readonly auth = inject(AuthorizationService);
  protected readonly navItems = CS_NAV;
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
