import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** État d'erreur générique pour toute liste/page dépendant d'un appel API (§23/§65). */
@Component({
  selector: 'app-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="error-state alert alert--danger" role="alert">
      <div>
        <p class="error-state__title">{{ title() }}</p>
        @if (message()) {
          <p class="error-state__message">{{ message() }}</p>
        }
      </div>
      @if (retryable()) {
        <button type="button" class="btn btn--outline btn--sm" (click)="retry.emit()">
          Réessayer
        </button>
      }
    </div>
  `,
  styles: [
    `
      .error-state {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .error-state__title {
        font-weight: 600;
        margin: 0;
      }

      .error-state__message {
        margin: 0.25rem 0 0;
      }
    `,
  ],
})
export class ErrorStateComponent {
  readonly title = input('Une erreur est survenue');
  readonly message = input<string | null>(null);
  readonly retryable = input(true);
  readonly retry = output<void>();
}
