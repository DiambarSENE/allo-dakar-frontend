import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

/**
 * Supporte 'display' (readonly, ex. note moyenne conducteur) et 'input' (formulaire d'avis,
 * §59). En mode input, chaque étoile est un bouton accessible (aria-label explicite, pas
 * seulement une icône — §10), avec aperçu au survol et taille 'lg' pour les formulaires.
 */
@Component({
  selector: 'app-rating-stars',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="rating"
      [class.rating--lg]="size() === 'lg'"
      [attr.role]="mode() === 'input' ? 'radiogroup' : null"
      [attr.aria-label]="mode() === 'input' ? 'Note' : null"
      (mouseleave)="hover.set(0)"
    >
      @for (star of stars(); track star) {
        @if (mode() === 'input') {
          <button
            type="button"
            class="rating__star rating__star--button"
            role="radio"
            [attr.aria-checked]="star === value()"
            [attr.aria-label]="star + ' étoile' + (star > 1 ? 's' : '')"
            [class.rating__star--filled]="star <= (hover() || value())"
            [class.rating__star--preview]="hover() > 0 && star <= hover()"
            (mouseenter)="hover.set(star)"
            (focus)="hover.set(star)"
            (blur)="hover.set(0)"
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
        transition: color 0.12s ease, transform 0.12s ease;
      }

      .rating--lg .rating__star {
        font-size: 2.1rem;
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
        border-radius: 8px;
      }

      .rating__star--preview {
        transform: scale(1.12);
      }

      .rating__star--button:focus-visible {
        outline: 3px solid rgba(245, 166, 35, 0.5);
      }

      .rating__value {
        margin-left: 0.35rem;
        font-size: 0.85rem;
        color: var(--color-muted, #6b7280);
        font-weight: 600;
      }

      @media (prefers-reduced-motion: reduce) {
        .rating__star {
          transition: none;
        }
      }
    `,
  ],
})
export class RatingStarsComponent {
  readonly value = input(0);
  readonly mode = input<'display' | 'input'>('display');
  readonly size = input<'md' | 'lg'>('md');
  readonly valueChange = output<number>();

  protected readonly hover = signal(0);
  protected readonly stars = computed(() => [1, 2, 3, 4, 5]);
  protected readonly roundedValue = computed(() => Math.round(this.value()));
}
