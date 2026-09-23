import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** État vide générique pour toute liste (§63). Le contenu projeté permet un CTA optionnel. */
@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <p class="empty-state__title">{{ title() }}</p>
      @if (description()) {
        <p class="empty-state__description">{{ description() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: [
    `
      .empty-state {
        text-align: center;
        padding: 2.5rem 1.5rem;
        color: var(--color-muted, #6b7280);
      }

      .empty-state__title {
        font-weight: 600;
        color: var(--color-text, #1f2a24);
        margin-bottom: 0.25rem;
      }

      .empty-state__description {
        font-size: 0.9rem;
      }
    `,
  ],
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
}
