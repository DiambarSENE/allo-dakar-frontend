import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, PagedResponse, PaginationMeta } from '../../../core/models/api.model';
import { BookingResponse, CreateBookingRequest } from '../../../core/models/booking.model';
import { skipErrorToast } from '../../../core/interceptors/http-context.tokens';

export interface BookingListResult {
  bookings: BookingResponse[];
  pagination: PaginationMeta;
}

/**
 * Reflète BookingController côté backend. create() utilise skipErrorToast() : le 409
 * BOOKING_SEATS_UNAVAILABLE (§30) doit être géré spécifiquement par l'appelant (message
 * contextuel + rafraîchissement du trajet) plutôt que par le toast générique.
 */
@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/bookings`;

  create(request: CreateBookingRequest): Observable<BookingResponse> {
    return this.http
      .post<ApiResponse<BookingResponse>>(this.baseUrl, request, { context: skipErrorToast() })
      .pipe(map((res) => res.data));
  }

  getById(id: string): Observable<BookingResponse> {
    return this.http.get<ApiResponse<BookingResponse>>(`${this.baseUrl}/${id}`).pipe(map((res) => res.data));
  }

  listMine(page = 0, size = 10): Observable<BookingListResult> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<PagedResponse<BookingResponse>>(`${this.baseUrl}/me`, { params })
      .pipe(map((res) => ({ bookings: res.data, pagination: res.pagination })));
  }

  /** Réservations reçues sur les trajets du conducteur connecté (GET /api/v1/bookings/received). */
  listReceived(page = 0, size = 10): Observable<BookingListResult> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<PagedResponse<BookingResponse>>(`${this.baseUrl}/received`, { params })
      .pipe(map((res) => ({ bookings: res.data, pagination: res.pagination })));
  }

  cancel(id: string, reason?: string): Observable<BookingResponse> {
    return this.http
      .post<ApiResponse<BookingResponse>>(`${this.baseUrl}/${id}/cancel`, reason ? { reason } : {})
      .pipe(map((res) => res.data));
  }
}
