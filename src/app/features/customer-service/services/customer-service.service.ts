import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, PagedResponse, PaginationMeta } from '../../../core/models/api.model';
import { UserResponse } from '../../../core/models/user.model';
import { BookingResponse } from '../../../core/models/booking.model';
import { TripResponse } from '../../../core/models/trip.model';
import { DisputeResponse } from '../../../core/models/dispute.model';

function paged(page: number, size: number) {
  return new HttpParams().set('page', page).set('size', size);
}

/**
 * Reflète EXACTEMENT CustomerServiceController côté backend (/api/v1/customer-service) — le
 * périmètre réel du rôle CUSTOMER_SERVICE (§43) : consulter les réservations, rechercher un
 * utilisateur, aider à traiter certaines annulations, consulter les litiges. Volontairement
 * distinct d'AdminService : aucune action de suspension/vérification/résolution ici.
 */
@Injectable({ providedIn: 'root' })
export class CustomerServiceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/customer-service`;

  searchUsers(search: string, page = 0, size = 20): Observable<{ users: UserResponse[]; pagination: PaginationMeta }> {
    const params = paged(page, size).set('search', search);
    return this.http
      .get<PagedResponse<UserResponse>>(`${this.baseUrl}/users`, { params })
      .pipe(map((res) => ({ users: res.data, pagination: res.pagination })));
  }

  listBookings(page = 0, size = 20): Observable<{ bookings: BookingResponse[]; pagination: PaginationMeta }> {
    return this.http
      .get<PagedResponse<BookingResponse>>(`${this.baseUrl}/bookings`, { params: paged(page, size) })
      .pipe(map((res) => ({ bookings: res.data, pagination: res.pagination })));
  }

  getBooking(id: string): Observable<BookingResponse> {
    return this.http.get<ApiResponse<BookingResponse>>(`${this.baseUrl}/bookings/${id}`).pipe(map((res) => res.data));
  }

  /** Motif obligatoire côté backend (traçabilité — voir BookingService.cancelOnBehalf). */
  cancelBooking(id: string, reason: string): Observable<BookingResponse> {
    return this.http
      .post<ApiResponse<BookingResponse>>(`${this.baseUrl}/bookings/${id}/cancel`, { reason })
      .pipe(map((res) => res.data));
  }

  listTrips(page = 0, size = 20): Observable<{ trips: TripResponse[]; pagination: PaginationMeta }> {
    return this.http
      .get<PagedResponse<TripResponse>>(`${this.baseUrl}/trips`, { params: paged(page, size) })
      .pipe(map((res) => ({ trips: res.data, pagination: res.pagination })));
  }

  listDisputes(page = 0, size = 20): Observable<{ disputes: DisputeResponse[]; pagination: PaginationMeta }> {
    return this.http
      .get<PagedResponse<DisputeResponse>>(`${this.baseUrl}/disputes`, { params: paged(page, size) })
      .pipe(map((res) => ({ disputes: res.data, pagination: res.pagination })));
  }

  getDispute(id: string): Observable<DisputeResponse> {
    return this.http.get<ApiResponse<DisputeResponse>>(`${this.baseUrl}/disputes/${id}`).pipe(map((res) => res.data));
  }
}
