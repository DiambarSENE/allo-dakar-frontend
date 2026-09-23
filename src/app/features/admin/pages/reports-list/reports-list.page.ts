import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { AdminService } from '../../services/admin.service';
import { ReportResponse } from '../../../../core/models/report.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ToastService } from '../../../../core/services/toast.service';

type LoadState = 'loading' | 'success' | 'error';

const OPEN_STATUSES = new Set(['OPEN', 'UNDER_REVIEW']);

@Component({
  selector: 'app-admin-reports-list',
  imports: [SpinnerComponent, EmptyStateComponent, ErrorStateComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reports-list.page.html',
})
export class AdminReportsListPage {
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly reports = signal<ReportResponse[]>([]);
  protected readonly pagination = signal<PaginationMeta>({ page: 0, size: 20, totalElements: 0, totalPages: 0 });
  protected readonly actingOnId = signal<string | null>(null);

  constructor() {
    this.load(0);
  }

  protected isOpen(report: ReportResponse): boolean {
    return OPEN_STATUSES.has(report.status);
  }

  protected onPageChange(page: number): void {
    this.load(page);
  }

  protected retry(): void {
    this.load(this.pagination().page);
  }

  protected resolve(report: ReportResponse): void {
    const resolution = prompt('Résolution (optionnel) :') ?? undefined;
    this.actingOnId.set(report.id);
    this.adminService.resolveReport(report.id, { resolution }).subscribe({
      next: () => {
        this.actingOnId.set(null);
        this.toast.success('Signalement résolu.');
        this.load(this.pagination().page);
      },
      error: () => this.actingOnId.set(null),
    });
  }

  protected reject(report: ReportResponse): void {
    const resolution = prompt('Motif du rejet (optionnel) :') ?? undefined;
    this.actingOnId.set(report.id);
    this.adminService.rejectReport(report.id, { resolution }).subscribe({
      next: () => {
        this.actingOnId.set(null);
        this.toast.success('Signalement rejeté.');
        this.load(this.pagination().page);
      },
      error: () => this.actingOnId.set(null),
    });
  }

  private load(page: number): void {
    this.state.set('loading');
    this.adminService.listAllReports(page, 20).subscribe({
      next: ({ reports, pagination }) => {
        this.reports.set(reports);
        this.pagination.set(pagination);
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }
}
