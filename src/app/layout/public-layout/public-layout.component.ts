import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthorizationService } from '../../core/auth/authorization.service';

/**
 * Enveloppe les pages publiques (accueil, recherche, détail trajet) et sert aussi de coquille
 * pour les utilisateurs connectés qui naviguent sur ces mêmes pages — le header s'adapte à
 * l'état d'authentification via AuthorizationService (§56).
 */
@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss',
})
export class PublicLayoutComponent {
  protected readonly auth = inject(AuthorizationService);
  protected readonly menuOpen = signal(false);
  protected readonly currentYear = new Date().getFullYear();

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected login(): void {
    void this.auth.login();
  }

  protected register(): void {
    void this.auth.register();
  }

  protected logout(): void {
    void this.auth.logout();
  }
}
