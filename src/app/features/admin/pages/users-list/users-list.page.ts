import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { AdminService } from '../../services/admin.service';
import { UserResponse } from '../../../../core/models/user.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ToastService } from '../../../../core/services/toast.service';

type LoadState = 'loading' | 'success' | 'error';

/** §45 : les actions sensibles (suspendre) demandent un motif + confirmation (§53). */
@Component({
  selector: 'app-admin-users-list',
  imports: [SpinnerComponent, ErrorStateComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users-list.page.html',
})
export class AdminUsersListPage {
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly users = signal<UserResponse[]>([]);
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

  protected suspend(user: UserResponse): void {
    const reason = prompt(`Motif de suspension de ${user.firstName} ${user.lastName} :`);
    if (!reason) return;
    this.actingOnId.set(user.id);
    this.adminService.suspendUser(user.id, reason).subscribe({
      next: () => {
        this.actingOnId.set(null);
        this.toast.success('Utilisateur suspendu.');
        this.load(this.pagination().page);
      },
      error: () => this.actingOnId.set(null),
    });
  }

  protected activate(user: UserResponse): void {
    if (!confirm(`Réactiver le compte de ${user.firstName} ${user.lastName} ?`)) return;
    this.actingOnId.set(user.id);
    this.adminService.activateUser(user.id).subscribe({
      next: () => {
        this.actingOnId.set(null);
        this.toast.success('Utilisateur réactivé.');
        this.load(this.pagination().page);
      },
      error: () => this.actingOnId.set(null),
    });
  }

  private load(page: number): void {
    this.state.set('loading');
    this.adminService.listUsers(page, 20).subscribe({
      next: ({ users, pagination }) => {
        this.users.set(users);
        this.pagination.set(pagination);
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }
}
