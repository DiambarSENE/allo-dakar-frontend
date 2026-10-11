import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AdminService } from '../../services/admin.service';
import { ReviewResponse } from '../../../../core/models/review.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { RatingStarsComponent } from '../../../../shared/components/rating-stars/rating-stars.component';
import { ToastService } from '../../../../core/services/toast.service';
import { DataTableDirective } from '../../../../shared/directives/data-table.directive';
import { REVIEW_STATUS_LABELS } from '../../../../shared/constants/labels';

type LoadState = 'loading' | 'success' | 'error';

/** Modération des avis : masquer / republier (POST /admin/reviews/{id}/moderate). */
@Component({
  selector: 'app-admin-reviews-list',
  imports: [DataTableDirective, DatePipe, SpinnerComponent, EmptyStateComponent, ErrorStateComponent, PaginationComponent, RatingStarsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reviews-list.page.html',
})
export class AdminReviewsListPage {
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);

  protected readonly statusLabels = REVIEW_STATUS_LABELS;
  protected readonly state = signal<LoadState>('loading');
  protected readonly reviews = signal<ReviewResponse[]>([]);
  protected readonly pagination = signal<PaginationMeta>({ page: 0, size: 20, totalElements: 0, totalPages: 0 });
  protected readonly actingOnId = signal<string | null>(null);

  constructor() {
    this.load(0);
  }

  protected onPageChange(page: number): void {
    this.load(page);
  }

  protected retry(): void {
    this.load(this.pagination().page);
  }

  protected moderate(review: ReviewResponse, hide: boolean): void {
    if (hide && !confirm('Masquer cet avis ? Il ne sera plus visible publiquement.')) return;
    this.actingOnId.set(review.id);
    this.adminService.moderateReview(review.id, hide).subscribe({
      next: () => {
        this.actingOnId.set(null);
        this.reviews.update((list) =>
          list.map((r) => (r.id === review.id ? { ...r, status: hide ? 'HIDDEN' : 'PUBLISHED' } : r)),
        );
        this.toast.success(hide ? 'Avis masqué.' : 'Avis republié.');
      },
      error: () => this.actingOnId.set(null),
    });
  }

  private load(page: number): void {
    this.state.set('loading');
    this.adminService.listAllReviews(page, 20).subscribe({
      next: ({ reviews, pagination }) => {
        this.reviews.set(reviews);
        this.pagination.set(pagination);
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }
}
