import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

import { PaymentService } from '../../services/payment.service';
import { PaymentResponse } from '../../../../core/models/payment.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-payments-list',
  imports: [RouterLink, DatePipe, SpinnerComponent, EmptyStateComponent, ErrorStateComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payments-list.page.html',
})
export class PaymentsListPage {
  private readonly paymentService = inject(PaymentService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly payments = signal<PaymentResponse[]>([]);
  protected readonly pagination = signal<PaginationMeta>({ page: 0, size: 10, totalElements: 0, totalPages: 0 });

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
    this.paymentService.listMine(page, 10).subscribe({
      next: ({ payments, pagination }) => {
        this.payments.set(payments);
        this.pagination.set(pagination);
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }
}
