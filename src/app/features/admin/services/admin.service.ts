import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, PagedResponse, PaginationMeta } from '../../../core/models/api.model';
import { UserResponse } from '../../../core/models/user.model';
import { TripResponse } from '../../../core/models/trip.model';
import { BookingResponse } from '../../../core/models/booking.model';
import { PaymentResponse } from '../../../core/models/payment.model';
import { ReportResponse, ResolveReportRequest } from '../../../core/models/report.model';
import { ReviewVerificationRequest, VerificationResponse } from '../../../core/models/verification.model';

function paged<T>(page: number, size: number) {
  return new HttpParams().set('page', page).set('size', size);
}

/**
 * Reflète EXACTEMENT AdminController côté backend — un seul service plutôt qu'un par
 * sous-domaine, car toutes ces routes partagent le même préfixe /api/v1/admin et la même
 * autorisation (ADMIN, déjà appliquée par SecurityConfig, voir commentaire du .java).
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  listUsers(page = 0, size = 20): Observable<{ users: UserResponse[]; pagination: PaginationMeta }> {
    return this.http
      .get<PagedResponse<UserResponse>>(`${this.baseUrl}/users`, { params: paged(page, size) })
      .pipe(map((res) => ({ users: res.data, pagination: res.pagination })));
  }

  suspendUser(id: string, reason: string): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.baseUrl}/users/${id}/suspend`, { reason })
      .pipe(map(() => undefined));
  }

  activateUser(id: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/users/${id}/activate`, {}).pipe(map(() => undefined));
  }

  pendingVerifications(
    page = 0,
    size = 20,
  ): Observable<{ verifications: VerificationResponse[]; pagination: PaginationMeta }> {
    return this.http
      .get<PagedResponse<VerificationResponse>>(`${this.baseUrl}/drivers/verifications`, { params: paged(page, size) })
      .pipe(map((res) => ({ verifications: res.data, pagination: res.pagination })));
  }

  approveVerification(id: string, request: ReviewVerificationRequest = {}): Observable<VerificationResponse> {
    return this.http
      .post<ApiResponse<VerificationResponse>>(`${this.baseUrl}/verifications/${id}/approve`, request)
      .pipe(map((res) => res.data));
  }

  rejectVerification(id: string, request: ReviewVerificationRequest): Observable<VerificationResponse> {
    return this.http
      .post<ApiResponse<VerificationResponse>>(`${this.baseUrl}/verifications/${id}/reject`, request)
      .pipe(map((res) => res.data));
  }

  requireMoreInfo(id: string, request: ReviewVerificationRequest): Observable<VerificationResponse> {
    return this.http
      .post<ApiResponse<VerificationResponse>>(`${this.baseUrl}/verifications/${id}/require-more-info`, request)
      .pipe(map((res) => res.data));
  }

  listAllTrips(page = 0, size = 20): Observable<{ trips: TripResponse[]; pagination: PaginationMeta }> {
    return this.http
      .get<PagedResponse<TripResponse>>(`${this.baseUrl}/trips`, { params: paged(page, size) })
      .pipe(map((res) => ({ trips: res.data, pagination: res.pagination })));
  }

  listAllBookings(page = 0, size = 20): Observable<{ bookings: BookingResponse[]; pagination: PaginationMeta }> {
    return this.http
      .get<PagedResponse<BookingResponse>>(`${this.baseUrl}/bookings`, { params: paged(page, size) })
      .pipe(map((res) => ({ bookings: res.data, pagination: res.pagination })));
  }

  listAllPayments(page = 0, size = 20): Observable<{ payments: PaymentResponse[]; pagination: PaginationMeta }> {
    return this.http
      .get<PagedResponse<PaymentResponse>>(`${this.baseUrl}/payments`, { params: paged(page, size) })
      .pipe(map((res) => ({ payments: res.data, pagination: res.pagination })));
  }

  listAllReports(page = 0, size = 20): Observable<{ reports: ReportResponse[]; pagination: PaginationMeta }> {
    return this.http
      .get<PagedResponse<ReportResponse>>(`${this.baseUrl}/reports`, { params: paged(page, size) })
      .pipe(map((res) => ({ reports: res.data, pagination: res.pagination })));
  }

  resolveReport(id: string, request: ResolveReportRequest = {}): Observable<ReportResponse> {
    return this.http
      .post<ApiResponse<ReportResponse>>(`${this.baseUrl}/reports/${id}/resolve`, request)
      .pipe(map((res) => res.data));
  }

  rejectReport(id: string, request: ResolveReportRequest = {}): Observable<ReportResponse> {
    return this.http
      .post<ApiResponse<ReportResponse>>(`${this.baseUrl}/reports/${id}/reject`, request)
      .pipe(map((res) => res.data));
  }

  moderateReview(id: string, hide: boolean): Observable<void> {
    const params = new HttpParams().set('hide', hide);
    return this.http
      .post<ApiResponse<void>>(`${this.baseUrl}/reviews/${id}/moderate`, {}, { params })
      .pipe(map(() => undefined));
  }
}
