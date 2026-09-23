import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthorizationService } from '../../core/auth/authorization.service';
import { AUTHENTICATED_NAV } from '../../shared/constants/nav.config';

/**
 * Enveloppe /dashboard, /passenger/**, /driver/**, /profile, /notifications, /reports (§56).
 * Le menu est généré depuis AUTHENTICATED_NAV, filtré par rôle — aucune vérification de rôle
 * dispersée dans ce composant (§15/§88). Le toast global est déjà rendu une seule fois dans
 * app.html (racine) — ne pas le dupliquer ici.
 */
@Component({
  selector: 'app-authenticated-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './authenticated-layout.component.html',
  styleUrl: './authenticated-layout.component.scss',
})
export class AuthenticatedLayoutComponent {
  protected readonly auth = inject(AuthorizationService);
  protected readonly sidebarOpen = signal(false);

  protected readonly navItems = computed(() =>
    AUTHENTICATED_NAV.filter((item) => !item.roles || this.auth.hasAnyRole(item.roles)),
  );

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
