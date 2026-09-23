import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { AdminService } from '../../services/admin.service';
import { BookingResponse } from '../../../../core/models/booking.model';
import { PaginationMeta } from '../../../../core/models/api.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

type LoadState = 'loading' | 'success' | 'error';

/** §47 : consultation uniquement — aucune action d'intervention n'est exposée côté backend. */
@Component({
  selector: 'app-admin-bookings-list',
  imports: [SpinnerComponent, ErrorStateComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bookings-list.page.html',
})
export class AdminBookingsListPage {
  private readonly adminService = inject(AdminService);

  protected readonly state = signal<LoadState>('loading');
  protected readonly bookings = signal<BookingResponse[]>([]);
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
    this.adminService.listAllBookings(page, 20).subscribe({
      next: ({ bookings, pagination }) => {
        this.bookings.set(bookings);
        this.pagination.set(pagination);
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }
}
