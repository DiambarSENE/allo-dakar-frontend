import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { PaginationMeta } from '../../../core/models/api.model';

/**
 * Respecte le format de pagination du backend (§60) : page 0-indexée, totalPages fourni tel
 * quel par Spring Data. N'affiche rien si une seule page.
 */
@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pagination().totalPages > 1) {
      <nav class="pagination" aria-label="Pagination">
        <button
          type="button"
          class="btn btn--outline btn--sm"
          [disabled]="pagination().page === 0"
          (click)="pageChange.emit(pagination().page - 1)"
        >
          Précédent
        </button>

        <span class="pagination__status">
          Page {{ pagination().page + 1 }} sur {{ pagination().totalPages }}
          ({{ pagination().totalElements }} résultats)
        </span>

        <button
          type="button"
          class="btn btn--outline btn--sm"
          [disabled]="pagination().page >= pagination().totalPages - 1"
          (click)="pageChange.emit(pagination().page + 1)"
        >
          Suivant
        </button>
      </nav>
    }
  `,
  styles: [
    `
      .pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 1.5rem 0;
        flex-wrap: wrap;
      }

      .pagination__status {
        font-size: 0.85rem;
        color: var(--color-muted, #6b7280);
      }
    `,
  ],
})
export class PaginationComponent {
  readonly pagination = input.required<PaginationMeta>();
  readonly pageChange = output<number>();
}
