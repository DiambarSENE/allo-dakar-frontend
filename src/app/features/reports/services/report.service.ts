import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, PagedResponse, PaginationMeta } from '../../../core/models/api.model';
import { CreateReportRequest, ReportResponse } from '../../../core/models/report.model';

export interface ReportListResult {
  reports: ReportResponse[];
  pagination: PaginationMeta;
}

/** Reflète ReportController côté backend. */
@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reports`;

  create(request: CreateReportRequest): Observable<ReportResponse> {
    return this.http.post<ApiResponse<ReportResponse>>(this.baseUrl, request).pipe(map((res) => res.data));
  }

  listMine(page = 0, size = 10): Observable<ReportListResult> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<PagedResponse<ReportResponse>>(`${this.baseUrl}/me`, { params })
      .pipe(map((res) => ({ reports: res.data, pagination: res.pagination })));
  }
}
