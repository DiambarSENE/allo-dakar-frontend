import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { StatusLabelPipe } from '../../../../shared/pipes/status.pipe';

import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ASSIGNABLE_ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS } from '../../../../shared/constants/labels';
import { RoleType } from '../../../../core/models/enums';
import { AdminService } from '../../services/admin.service';
import { UserResponse } from '../../../../core/models/user.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ToastService } from '../../../../core/services/toast.service';
import { DataTableDirective } from '../../../../shared/directives/data-table.directive';

type LoadState = 'loading' | 'success' | 'error';

/** §45 : les actions sensibles (suspendre) demandent un motif + confirmation (§53). */
@Component({
  selector: 'app-admin-users-list',
  imports: [StatusLabelPipe, DataTableDirective, SpinnerComponent, ErrorStateComponent, PaginationComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './users-list.page.html',
})
export class AdminUsersListPage {
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthorizationService);

  protected readonly assignableRoles = ASSIGNABLE_ROLES;
  protected readonly roleLabels = ROLE_LABELS;
  protected readonly roleDescriptions = ROLE_DESCRIPTIONS;
  /** Utilisateur dont on édite les rôles (null = dialogue fermé). */
  protected readonly editingUser = signal<UserResponse | null>(null);
  protected readonly selectedRoles = signal<Set<string>>(new Set());
  protected readonly savingRoles = signal(false);

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

  protected roleLabel(role: string): string {
    return ROLE_LABELS[role as RoleType] ?? role;
  }

  protected openRoles(user: UserResponse): void {
    this.editingUser.set(user);
    this.selectedRoles.set(new Set(user.roles));
  }

  protected closeRoles(): void {
    if (this.savingRoles()) return;
    this.editingUser.set(null);
  }

  protected toggleRole(role: string, checked: boolean): void {
    this.selectedRoles.update((current) => {
      const next = new Set(current);
      if (checked) next.add(role); else next.delete(role);
      return next;
    });
  }

  protected isSelf(user: UserResponse): boolean {
    return !!this.auth.email() && this.auth.email()?.toLowerCase() === user.email.toLowerCase();
  }

  protected canSaveRoles(): boolean {
    return this.selectedRoles().size > 0 && !this.savingRoles();
  }

  protected saveRoles(): void {
    const user = this.editingUser();
    if (!user || !this.canSaveRoles()) return;
    this.savingRoles.set(true);
    this.adminService.updateUserRoles(user.id, [...this.selectedRoles()]).subscribe({
      next: (updated) => {
        this.savingRoles.set(false);
        this.editingUser.set(null);
        this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        this.toast.success(`Rôles de ${updated.firstName} ${updated.lastName} mis à jour.`);
      },
      error: () => this.savingRoles.set(false),
    });
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
