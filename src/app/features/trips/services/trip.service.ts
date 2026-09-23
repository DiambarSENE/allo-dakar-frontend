import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, PagedResponse, PaginationMeta } from '../../../core/models/api.model';
import {
  CreateTripRequest,
  TripResponse,
  TripSearchRequest,
  UpdateTripRequest,
} from '../../../core/models/trip.model';

export interface TripSearchResult {
  trips: TripResponse[];
  pagination: PaginationMeta;
}

/**
 * Reflète exactement TripController côté backend (§68 : analyser le contrat réel avant de
 * coder). GET /search et GET /{id} sont publics — aucune conséquence ici, HttpClient ne sait
 * pas si une route nécessite un token, c'est SecurityConfig côté backend qui en décide ; ce
 * service reste identique que l'appelant soit connecté ou non.
 */
@Injectable({ providedIn: 'root' })
export class TripService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/trips`;

  search(criteria: TripSearchRequest): Observable<TripSearchResult> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(criteria)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http
      .get<PagedResponse<TripResponse>>(`${this.baseUrl}/search`, { params })
      .pipe(map((res) => ({ trips: res.data, pagination: res.pagination })));
  }

  getById(id: string): Observable<TripResponse> {
    return this.http.get<ApiResponse<TripResponse>>(`${this.baseUrl}/${id}`).pipe(map((res) => res.data));
  }

  create(request: CreateTripRequest): Observable<TripResponse> {
    return this.http.post<ApiResponse<TripResponse>>(this.baseUrl, request).pipe(map((res) => res.data));
  }

  update(id: string, request: UpdateTripRequest): Observable<TripResponse> {
    return this.http
      .put<ApiResponse<TripResponse>>(`${this.baseUrl}/${id}`, request)
      .pipe(map((res) => res.data));
  }

  publish(id: string): Observable<TripResponse> {
    return this.http
      .post<ApiResponse<TripResponse>>(`${this.baseUrl}/${id}/publish`, {})
      .pipe(map((res) => res.data));
  }

  cancel(id: string, reason?: string): Observable<TripResponse> {
    return this.http
      .post<ApiResponse<TripResponse>>(`${this.baseUrl}/${id}/cancel`, reason ? { reason } : {})
      .pipe(map((res) => res.data));
  }

  listMine(page = 0, size = 10): Observable<TripSearchResult> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<PagedResponse<TripResponse>>(`${environment.apiUrl}/drivers/me/trips`, { params })
      .pipe(map((res) => ({ trips: res.data, pagination: res.pagination })));
  }
}
