import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, PagedResponse, PaginationMeta } from '../../../core/models/api.model';
import { CreatePaymentRequest, PaymentResponse } from '../../../core/models/payment.model';

export interface PaymentListResult {
  payments: PaymentResponse[];
  pagination: PaginationMeta;
}

/**
 * Reflète EXACTEMENT PaymentController côté backend. initiate() délègue à un PaymentProvider
 * mock côté backend (§16/§33) — aucun vrai formulaire bancaire n'est collecté ici, seule la
 * méthode (CASH, MOBILE_MONEY, CARD, BANK_TRANSFER, OTHER) est choisie par le passager.
 */
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/payments`;

  initiate(request: CreatePaymentRequest): Observable<PaymentResponse> {
    return this.http.post<ApiResponse<PaymentResponse>>(this.baseUrl, request).pipe(map((res) => res.data));
  }

  getById(id: string): Observable<PaymentResponse> {
    return this.http.get<ApiResponse<PaymentResponse>>(`${this.baseUrl}/${id}`).pipe(map((res) => res.data));
  }

  listMine(page = 0, size = 10): Observable<PaymentListResult> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<PagedResponse<PaymentResponse>>(`${this.baseUrl}/me`, { params })
      .pipe(map((res) => ({ payments: res.data, pagination: res.pagination })));
  }
}
