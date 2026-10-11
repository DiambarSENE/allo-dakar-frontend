import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, PagedResponse, PaginationMeta } from '../../../core/models/api.model';
import { NotificationResponse } from '../../../core/models/notification.model';

export interface NotificationListResult {
  notifications: NotificationResponse[];
  pagination: PaginationMeta;
}

/** Reflète NotificationController — seul le canal IN_APP est consultable (voir le .java). */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/notifications`;

  listMine(page = 0, size = 20): Observable<NotificationListResult> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<PagedResponse<NotificationResponse>>(`${this.baseUrl}/me`, { params })
      .pipe(map((res) => ({ notifications: res.data, pagination: res.pagination })));
  }

  markRead(id: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${id}/read`, {}).pipe(map(() => undefined));
  }
}
