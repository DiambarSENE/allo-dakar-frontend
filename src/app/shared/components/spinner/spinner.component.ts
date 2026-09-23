import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Indicateur de chargement générique (§23/§64). `label` reste visible pour les lecteurs d'écran. */
@Component({
  selector: 'app-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="spinner-wrapper" role="status">
      <span class="spinner" [style.width.px]="size()" [style.height.px]="size()"></span>
      <span class="spinner-label">{{ label() }}</span>
    </div>
  `,
  styles: [
    `
      .spinner-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        padding: 1.5rem;
        color: var(--color-muted, #6b7280);
      }

      .spinner {
        display: inline-block;
        border: 3px solid var(--color-border, #e5e1d8);
        border-top-color: var(--color-primary, #e2672a);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }

      .spinner-label {
        font-size: 0.9rem;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class SpinnerComponent {
  readonly size = input(28);
  readonly label = input('Chargement en cours…');
}
