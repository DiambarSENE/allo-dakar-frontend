import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { DashboardStatsResponse } from '../models/dashboard.model';

/** Endpoint commun aux dashboards ADMIN et CUSTOMER_SERVICE. */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/dashboard`;

  getStats(): Observable<DashboardStatsResponse> {
    return this.http
      .get<ApiResponse<DashboardStatsResponse>>(`${this.baseUrl}/stats`)
      .pipe(map((res) => res.data));
  }
}
