import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { IconComponent } from '../icon/icon.component';

/** Pages « racine » d'un espace : pas de flèche de retour à afficher. */
const ROOT_URLS = new Set(['/', '/dashboard', '/passenger', '/driver', '/admin', '/customer-service']);

/**
 * Flèche « Retour » : revient à la page précédente de l'application. Si l'utilisateur est arrivé
 * directement sur la page (lien, rafraîchissement), on retombe sur `fallback` plutôt que de
 * quitter le site.
 */
@Component({
  selector: 'app-back-button',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <button type="button" class="back-btn" (click)="goBack()" aria-label="Retour à la page précédente">
        <app-icon name="back" />
        <span>Retour</span>
      </button>
    }
  `,
  styles: [`
    .back-btn {
      display: inline-flex; align-items: center; gap: 8px;
      min-height: 38px; padding: 0 14px 0 10px;
      border: 1px solid var(--color-border, #e5e1d8); border-radius: 999px;
      background: var(--color-surface, #fff); color: var(--color-text, #1f2a24);
      font: inherit; font-size: 0.86rem; font-weight: 600; cursor: pointer;
      transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease;
    }
    .back-btn:hover { border-color: var(--color-primary, #e2672a); background: #fff6ef; transform: translateX(-2px); }
    .back-btn:focus-visible { outline: 3px solid rgba(226, 103, 42, 0.4); outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) { .back-btn { transition: none; } }
  `],
})
export class BackButtonComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  /** Destination si aucun historique interne n'est disponible. */
  readonly fallback = input('/');
  /** Force l'affichage même sur une page racine (ex. détail d'un trajet public). */
  readonly always = input(false);

  private readonly url = signal(this.router.url);
  protected readonly visible = computed(() => this.always() || !ROOT_URLS.has(this.url().split('?')[0].split('#')[0]));

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe((e) => this.url.set(e.urlAfterRedirects));
  }

  protected goBack(): void {
    // Angular stocke un navigationId dans history.state : > 1 = une navigation interne a eu lieu.
    const hasInternalHistory = ((history.state as { navigationId?: number } | null)?.navigationId ?? 1) > 1;
    if (hasInternalHistory) {
      this.location.back();
    } else {
      void this.router.navigateByUrl(this.fallback());
    }
  }
}
