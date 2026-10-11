import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { BackButtonComponent } from '../../shared/components/back-button/back-button.component';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthorizationService } from '../../core/auth/authorization.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { initials, primaryRoleLabel } from '../../shared/utils/user-display';
import { SupportWidgetComponent } from '../../shared/components/support-widget/support-widget.component';
import { AUTHENTICATED_NAV, BottomNavItem, DRIVER_BOTTOM_NAV, PASSENGER_BOTTOM_NAV } from '../../shared/constants/nav.config';

/**
 * Enveloppe /dashboard, /passenger/**, /driver/**, /profile, /notifications, /reports (§56).
 * Le menu est généré depuis AUTHENTICATED_NAV, filtré par rôle — aucune vérification de rôle
 * dispersée dans ce composant (§15/§88). Le toast global est déjà rendu une seule fois dans
 * app.html (racine) — ne pas le dupliquer ici.
 */
@Component({
  selector: 'app-authenticated-layout',
  imports: [BackButtonComponent, RouterOutlet, RouterLink, RouterLinkActive, SupportWidgetComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './authenticated-layout.component.html',
  styleUrl: './authenticated-layout.component.scss',
})
export class AuthenticatedLayoutComponent {
  protected readonly auth = inject(AuthorizationService);
  protected readonly sidebarOpen = signal(false);
  protected readonly initials = computed(() => initials(this.auth.fullName()));
  protected readonly roleLabel = computed(() => primaryRoleLabel(this.auth.roles()));

  protected readonly navItems = computed(() =>
    AUTHENTICATED_NAV.filter((item) => !item.roles || this.auth.hasAnyRole(item.roles)),
  );

  /** Menu groupé : un intitulé (« Voyager », « Conduire »…) à chaque changement de section. */
  protected readonly navGroups = computed(() => {
    const groups: { section: string | null; items: typeof AUTHENTICATED_NAV[number][] }[] = [];
    for (const item of this.navItems()) {
      const section = item.section ?? null;
      const last = groups[groups.length - 1];
      if (last && last.section === section) last.items.push(item);
      else groups.push({ section, items: [item] });
    }
    return groups;
  });

  /** Barre du bas (mobile) : jeu d'accès rapides selon le rôle ; absente pour les autres profils. */
  protected readonly bottomNav = computed<readonly BottomNavItem[]>(() => {
    if (this.auth.isDriver() && !this.auth.isPassenger()) return DRIVER_BOTTOM_NAV;
    if (this.auth.isPassenger()) return PASSENGER_BOTTOM_NAV;
    return [];
  });

  /** Les entrées « Mon espace » sont des préfixes d'autres routes : on exige la correspondance exacte. */
  protected isExact(route: string): boolean {
    return route === '/dashboard' || route === '/passenger' || route === '/driver' || route === '/admin' || route === '/customer-service';
  }

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
