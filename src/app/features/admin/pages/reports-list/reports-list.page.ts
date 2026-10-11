import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AdminService } from '../../services/admin.service';
import { ReportResponse } from '../../../../core/models/report.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ToastService } from '../../../../core/services/toast.service';
import { DataTableDirective } from '../../../../shared/directives/data-table.directive';
import { REPORT_REASON_LABELS, REPORT_STATUS_LABELS, reportStatusBadgeClass } from '../../../../shared/constants/labels';

type LoadState = 'loading' | 'success' | 'error';
type Decision = 'resolve' | 'reject';

const OPEN_STATUSES = new Set(['OPEN', 'UNDER_REVIEW']);

/** Traitement des signalements : consultation détaillée, résolution/rejet avec commentaire, masquage d'un avis signalé. */
@Component({
  selector: 'app-admin-reports-list',
  imports: [
    DataTableDirective, DatePipe, RouterLink, SpinnerComponent, EmptyStateComponent,
    ErrorStateComponent, PaginationComponent, ModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reports-list.page.html',
})
export class AdminReportsListPage {
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);

  protected readonly reasonLabels = REPORT_REASON_LABELS;
  protected readonly statusLabels = REPORT_STATUS_LABELS;
  protected readonly badgeClass = reportStatusBadgeClass;

  protected readonly state = signal<LoadState>('loading');
  protected readonly reports = signal<ReportResponse[]>([]);
  protected readonly pagination = signal<PaginationMeta>({ page: 0, size: 20, totalElements: 0, totalPages: 0 });
  protected readonly actingOnId = signal<string | null>(null);

  /** Signalement en cours de traitement dans la boîte de dialogue + décision choisie. */
  protected readonly deciding = signal<{ report: ReportResponse; decision: Decision } | null>(null);
  protected readonly resolutionText = signal('');

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

  protected startDecision(report: ReportResponse, decision: Decision): void {
    this.resolutionText.set('');
    this.deciding.set({ report, decision });
  }

  protected cancelDecision(): void {
    if (this.actingOnId()) return;
    this.deciding.set(null);
  }

  protected setResolution(event: Event): void {
    this.resolutionText.set((event.target as HTMLTextAreaElement).value);
  }

  protected confirmDecision(): void {
    const current = this.deciding();
    if (!current) return;
    const { report, decision } = current;
    const resolution = this.resolutionText().trim() || undefined;
    this.actingOnId.set(report.id);
    const call =
      decision === 'resolve'
        ? this.adminService.resolveReport(report.id, { resolution })
        : this.adminService.rejectReport(report.id, { resolution });
    call.subscribe({
      next: () => {
        this.actingOnId.set(null);
        this.deciding.set(null);
        this.toast.success(decision === 'resolve' ? 'Signalement résolu.' : 'Signalement rejeté.');
        this.load(this.pagination().page);
      },
      error: () => this.actingOnId.set(null),
    });
  }

  /** Masque l'avis visé par le signalement (modération), sans clore le signalement. */
  protected hideReview(report: ReportResponse): void {
    if (!report.reviewId || !confirm('Masquer cet avis ? Il ne sera plus visible publiquement.')) return;
    this.actingOnId.set(report.id);
    this.adminService.moderateReview(report.reviewId, true).subscribe({
      next: () => {
        this.actingOnId.set(null);
        this.toast.success('Avis masqué.');
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
