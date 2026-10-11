import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, PagedResponse, PaginationMeta } from '../../../core/models/api.model';
import { CreateDisputeRequest, DisputeResponse } from '../../../core/models/dispute.model';

/** Reflète DisputeController côté backend — un utilisateur ne voit/crée que ses propres litiges. */
@Injectable({ providedIn: 'root' })
export class DisputeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/disputes`;

  create(request: CreateDisputeRequest): Observable<DisputeResponse> {
    return this.http.post<ApiResponse<DisputeResponse>>(this.baseUrl, request).pipe(map((res) => res.data));
  }

  listMine(page = 0, size = 10): Observable<{ disputes: DisputeResponse[]; pagination: PaginationMeta }> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<PagedResponse<DisputeResponse>>(`${this.baseUrl}/me`, { params })
      .pipe(map((res) => ({ disputes: res.data, pagination: res.pagination })));
  }
}
