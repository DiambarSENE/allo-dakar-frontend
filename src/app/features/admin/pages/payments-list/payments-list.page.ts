import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AdminService } from '../../services/admin.service';
import { PaymentResponse } from '../../../../core/models/payment.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

type LoadState = 'loading' | 'success' | 'error';

/**
 * §48 : ne jamais afficher de donnée bancaire sensible — PaymentResponse n'en contient de toute
 * façon aucune (pas de numéro de carte, voir payment.model.ts), donc rien à filtrer ici.
 */
@Component({
  selector: 'app-admin-payments-list',
  imports: [DatePipe, SpinnerComponent, ErrorStateComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payments-list.page.html',
})
export class AdminPaymentsListPage {
  private readonly adminService = inject(AdminService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly payments = signal<PaymentResponse[]>([]);
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
    this.adminService.listAllPayments(page, 20).subscribe({
      next: ({ payments, pagination }) => {
        this.payments.set(payments);
        this.pagination.set(pagination);
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }
}
