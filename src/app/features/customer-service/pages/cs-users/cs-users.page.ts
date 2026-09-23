import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { CustomerServiceService } from '../../services/customer-service.service';
import { UserResponse } from '../../../../core/models/user.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

/** §43 "Rechercher un utilisateur" — recherche vide = liste complète (voir UserService.search backend). */
@Component({
  selector: 'app-cs-users',
  imports: [ReactiveFormsModule, SpinnerComponent, EmptyStateComponent, ErrorStateComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cs-users.page.html',
})
export class CsUsersPage {
  private readonly customerService = inject(CustomerServiceService);
  private readonly fb = new FormBuilder();

  protected readonly state = signal<LoadState>('loading');
  protected readonly users = signal<UserResponse[]>([]);
  protected readonly pagination = signal<PaginationMeta>({ page: 0, size: 20, totalElements: 0, totalPages: 0 });

  protected readonly searchForm = this.fb.nonNullable.group({ search: [''] });

  constructor() {
    this.load(0);
  }

  protected search(): void {
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
    this.customerService.searchUsers(this.searchForm.getRawValue().search, page, 20).subscribe({
      next: ({ users, pagination }) => {
        this.users.set(users);
        this.pagination.set(pagination);
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }
}
