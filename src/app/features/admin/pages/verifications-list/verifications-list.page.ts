import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { AdminService } from '../../services/admin.service';
import { VerificationResponse } from '../../../../core/models/verification.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ToastService } from '../../../../core/services/toast.service';

type LoadState = 'loading' | 'success' | 'error';

/**
 * §49 : la liste porte sur DriverVerification (une soumission de document), pas directement
 * sur le conducteur — voir commentaire d'AdminController côté backend. "ID conducteur" reste
 * un identifiant technique faute d'un endpoint exposant le nom associé à cet ID (§117).
 */
@Component({
  selector: 'app-admin-verifications-list',
  imports: [DatePipe, SpinnerComponent, EmptyStateComponent, ErrorStateComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './verifications-list.page.html',
})
export class AdminVerificationsListPage {
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly verifications = signal<VerificationResponse[]>([]);
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

  protected approve(v: VerificationResponse): void {
    this.actingOnId.set(v.id);
    this.adminService.approveVerification(v.id).subscribe({
      next: () => {
        this.actingOnId.set(null);
        this.toast.success('Conducteur vérifié.');
        this.load(this.pagination().page);
      },
      error: () => this.actingOnId.set(null),
    });
  }

  protected reject(v: VerificationResponse): void {
    const rejectionReason = prompt('Motif du rejet :');
    if (!rejectionReason) return;
    this.actingOnId.set(v.id);
    this.adminService.rejectVerification(v.id, { rejectionReason }).subscribe({
      next: () => {
        this.actingOnId.set(null);
        this.toast.success('Vérification rejetée.');
        this.load(this.pagination().page);
      },
      error: () => this.actingOnId.set(null),
    });
  }

  protected requireMoreInfo(v: VerificationResponse): void {
    const comment = prompt('Quelles informations complémentaires demander ?');
    if (!comment) return;
    this.actingOnId.set(v.id);
    this.adminService.requireMoreInfo(v.id, { comment }).subscribe({
      next: () => {
        this.actingOnId.set(null);
        this.toast.success('Complément demandé.');
        this.load(this.pagination().page);
      },
      error: () => this.actingOnId.set(null),
    });
  }

  private load(page: number): void {
    this.state.set('loading');
    this.adminService.pendingVerifications(page, 20).subscribe({
      next: ({ verifications, pagination }) => {
        this.verifications.set(verifications);
        this.pagination.set(pagination);
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }
}
