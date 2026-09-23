import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { NotificationService } from '../../services/notification.service';
import { NotificationResponse } from '../../../../core/models/notification.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

type LoadState = 'loading' | 'success' | 'error';

const TYPE_LABELS: Record<string, string> = {
  BOOKING_CREATED: 'Réservation créée',
  BOOKING_CONFIRMED: 'Réservation confirmée',
  BOOKING_CANCELLED: 'Réservation annulée',
  PAYMENT_SUCCESS: 'Paiement réussi',
  PAYMENT_FAILED: 'Paiement échoué',
  DRIVER_VERIFIED: 'Vérification approuvée',
  DRIVER_VERIFICATION_REJECTED: 'Vérification rejetée',
  REVIEW_RECEIVED: 'Nouvel avis',
  REPORT_HANDLED: 'Signalement traité',
};

@Component({
  selector: 'app-notification-center',
  imports: [DatePipe, SpinnerComponent, EmptyStateComponent, ErrorStateComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-center.page.html',
  styles: [
    `
      .notification-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .notification-item {
        cursor: pointer;
        transition: background-color 0.15s ease;
      }

      .notification-item--unread {
        border-left: 3px solid var(--color-primary, #e2672a);
      }

      .notification-item__title {
        font-weight: 600;
        margin: 0.4rem 0 0.15rem;
      }

      .notification-item__message {
        margin: 0;
        font-size: 0.9rem;
        color: var(--color-muted, #6b7280);
      }

      .notification-item__date {
        margin: 0.4rem 0 0;
        font-size: 0.78rem;
        color: var(--color-muted, #6b7280);
      }
    `,
  ],
})
export class NotificationCenterPage {
  private readonly notificationService = inject(NotificationService);

  protected readonly typeLabels = TYPE_LABELS;
  protected readonly state = signal<LoadState>('loading');
  protected readonly notifications = signal<NotificationResponse[]>([]);
  protected readonly pagination = signal<PaginationMeta>({ page: 0, size: 20, totalElements: 0, totalPages: 0 });

  constructor() {
    this.load(0);
  }

  protected onPageChange(page: number): void {
    this.load(page);
  }

  protected retry(): void {
    this.load(this.pagination().page);
  }

  protected markRead(notification: NotificationResponse): void {
    if (notification.status === 'READ') return;
    this.notificationService.markRead(notification.id).subscribe(() => {
      this.notifications.update((list) =>
        list.map((n) => (n.id === notification.id ? { ...n, status: 'READ' } : n)),
      );
    });
  }

  private load(page: number): void {
    this.state.set('loading');
    this.notificationService.listMine(page, 20).subscribe({
      next: ({ notifications, pagination }) => {
        this.notifications.set(notifications);
        this.pagination.set(pagination);
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }
}
