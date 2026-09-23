import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/**
 * Supporte 'display' (readonly, ex. note moyenne conducteur) et 'input' (formulaire d'avis,
 * §59). En mode input, chaque étoile est un bouton accessible (aria-label explicite, pas
 * seulement une icône — §10).
 */
@Component({
  selector: 'app-rating-stars',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rating" [attr.role]="mode() === 'input' ? 'radiogroup' : null" [attr.aria-label]="mode() === 'input' ? 'Note' : null">
      @for (star of stars(); track star) {
        @if (mode() === 'input') {
          <button
            type="button"
            class="rating__star rating__star--button"
            role="radio"
            [attr.aria-checked]="star <= value()"
            [attr.aria-label]="star + ' étoile' + (star > 1 ? 's' : '')"
            [class.rating__star--filled]="star <= value()"
            (click)="valueChange.emit(star)"
          >
            ★
          </button>
        } @else {
          <span class="rating__star" [class.rating__star--filled]="star <= roundedValue()" aria-hidden="true">★</span>
        }
      }
      @if (mode() !== 'input') {
        <span class="visually-hidden">Note : {{ value() }} sur 5</span>
        <span class="rating__value">{{ value().toFixed(1) }}</span>
      }
    </div>
  `,
  styles: [
    `
      .rating {
        display: inline-flex;
        align-items: center;
        gap: 2px;
      }

      .rating__star {
        color: var(--color-border, #e5e1d8);
        font-size: 1.1rem;
        line-height: 1;
      }

      .rating__star--filled {
        color: #f5a623;
      }

      .rating__star--button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        min-width: 32px;
        min-height: 32px;
      }

      .rating__value {
        margin-left: 0.35rem;
        font-size: 0.85rem;
        color: var(--color-muted, #6b7280);
        font-weight: 600;
      }
    `,
  ],
})
export class RatingStarsComponent {
  readonly value = input(0);
  readonly mode = input<'display' | 'input'>('display');
  readonly valueChange = output<number>();

  protected readonly stars = computed(() => [1, 2, 3, 4, 5]);
  protected readonly roundedValue = computed(() => Math.round(this.value()));
}
