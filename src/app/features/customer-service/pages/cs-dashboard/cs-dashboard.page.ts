import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { firstName } from '../../../../shared/utils/user-display';

@Component({
  selector: 'app-cs-dashboard',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cs-dashboard.page.html',
})
export class CsDashboardPage {
  private readonly dashboardService = inject(DashboardService);
  private readonly auth = inject(AuthorizationService);

  protected readonly firstName = computed(() => firstName(this.auth.fullName()));
  protected readonly driversCount = signal(0);
  protected readonly passengersCount = signal(0);
  protected readonly statsLoading = signal(true);
  protected readonly statsError = signal(false);

  constructor() {
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.driversCount.set(stats.driversCount);
        this.passengersCount.set(stats.passengersCount);
        this.statsLoading.set(false);
      },
      error: () => {
        this.statsLoading.set(false);
        this.statsError.set(true);
      },
    });
  }
}
