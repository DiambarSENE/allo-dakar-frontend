import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ReviewService } from '../../services/review.service';
import { UserService } from '../../../profile/services/user.service';
import { ReviewResponse } from '../../../../core/models/review.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { RatingStarsComponent } from '../../../../shared/components/rating-stars/rating-stars.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ToastService } from '../../../../core/services/toast.service';
import { REVIEW_STATUS_LABELS } from '../../../../shared/constants/labels';

type LoadState = 'loading' | 'success' | 'error';
type Tab = 'received' | 'written';

/**
 * « Mes avis » : avis reçus (avec signalement) et avis rédigés (modification, suppression).
 * Les règles métier (auteur uniquement, note 1-5) restent appliquées par le backend.
 */
@Component({
  selector: 'app-my-reviews',
  imports: [
    DatePipe, RouterLink, SpinnerComponent, EmptyStateComponent, ErrorStateComponent,
    PaginationComponent, RatingStarsComponent, ModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-reviews.page.html',
})
export class MyReviewsPage {
  private readonly reviewService = inject(ReviewService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);

  protected readonly statusLabels = REVIEW_STATUS_LABELS;
  protected readonly tab = signal<Tab>('received');
  protected readonly state = signal<LoadState>('loading');
  protected readonly reviews = signal<ReviewResponse[]>([]);
  protected readonly pagination = signal<PaginationMeta>({ page: 0, size: 10, totalElements: 0, totalPages: 0 });
  protected readonly actingOnId = signal<string | null>(null);

  protected readonly editing = signal<ReviewResponse | null>(null);
  protected readonly editRating = signal(0);
  protected readonly editComment = signal('');
  protected readonly saving = signal(false);

  private myId: string | null = null;

  constructor() {
    this.load(0);
  }

  protected selectTab(tab: Tab): void {
    if (this.tab() === tab) return;
    this.tab.set(tab);
    this.load(0);
  }

  protected onPageChange(page: number): void {
    this.load(page);
  }

  protected retry(): void {
    this.load(this.pagination().page);
  }

  protected startEdit(review: ReviewResponse): void {
    this.editing.set(review);
    this.editRating.set(review.rating);
    this.editComment.set(review.comment ?? '');
  }

  protected cancelEdit(): void {
    if (this.saving()) return;
    this.editing.set(null);
  }

  protected setComment(event: Event): void {
    this.editComment.set((event.target as HTMLTextAreaElement).value);
  }

  protected saveEdit(): void {
    const review = this.editing();
    if (!review || this.editRating() < 1) return;
    this.saving.set(true);
    this.reviewService.update(review.id, { rating: this.editRating(), comment: this.editComment().trim() }).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.editing.set(null);
        this.reviews.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
        this.toast.success('Avis mis à jour.');
      },
      error: () => this.saving.set(false),
    });
  }

  protected remove(review: ReviewResponse): void {
    if (!confirm('Supprimer définitivement cet avis ?')) return;
    this.actingOnId.set(review.id);
    this.reviewService.delete(review.id).subscribe({
      next: () => {
        this.actingOnId.set(null);
        this.toast.success('Avis supprimé.');
        this.load(this.pagination().page);
      },
      error: () => this.actingOnId.set(null),
    });
  }

  private load(page: number): void {
    this.state.set('loading');
    if (this.tab() === 'written') {
      this.reviewService.listWritten(page, 10).subscribe({
        next: (result) => this.onLoaded(result),
        error: () => this.state.set('error'),
      });
      return;
    }
    const fetchReceived = (id: string) =>
      this.reviewService.listForUser(id, page, 10).subscribe({
        next: (result) => this.onLoaded(result),
        error: () => this.state.set('error'),
      });
    if (this.myId) {
      fetchReceived(this.myId);
    } else {
      this.userService.getMe().subscribe({
        next: (me) => { this.myId = me.id; fetchReceived(me.id); },
        error: () => this.state.set('error'),
      });
    }
  }

  private onLoaded(result: { reviews: ReviewResponse[]; pagination: PaginationMeta }): void {
    this.reviews.set(result.reviews);
    this.pagination.set(result.pagination);
    this.state.set('success');
  }
}
