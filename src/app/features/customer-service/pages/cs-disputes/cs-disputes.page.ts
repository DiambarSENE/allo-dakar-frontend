import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { CustomerServiceService } from '../../services/customer-service.service';
import { DisputeResponse } from '../../../../core/models/dispute.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

type LoadState = 'loading' | 'success' | 'error';

/**
 * §43/§51 : consultation uniquement — la résolution d'un litige reste une action ADMIN (voir
 * AdminController.resolveDispute/rejectDispute), pas exposée à CUSTOMER_SERVICE côté backend.
 */
@Component({
  selector: 'app-cs-disputes',
  imports: [DatePipe, SpinnerComponent, EmptyStateComponent, ErrorStateComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cs-disputes.page.html',
})
export class CsDisputesPage {
  private readonly customerService = inject(CustomerServiceService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly disputes = signal<DisputeResponse[]>([]);
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

  private load(page: number): void {
    this.state.set('loading');
    this.customerService.listDisputes(page, 20).subscribe({
      next: ({ disputes, pagination }) => {
        this.disputes.set(disputes);
        this.pagination.set(pagination);
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }
}
