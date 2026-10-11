import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PagedResponse } from '../../../core/models/api.model';

export interface SupportMessage {
  id: string;
  /** null : message d'un visiteur non connecté (chat flottant public). */
  userId: string | null;
  phoneNumber: string | null;
  message: string;
  fromStaff: boolean;
  createdAt: string;
}
/** Le téléphone n'est requis que pour un visiteur non connecté (voir PublicSupportMessageRequest). */
export interface SupportMessageRequest { message: string; phoneNumber?: string; }
export interface PublicSupportMessageRequest { phoneNumber: string; message: string; }

@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/support`;
  send(request: SupportMessageRequest): Observable<SupportMessage> {
    return this.http.post<ApiResponse<SupportMessage>>(`${this.url}/messages`, request).pipe(map(r => r.data));
  }
  /** Visiteur non connecté : téléphone + message, endpoint public (aucun token envoyé). */
  sendPublic(request: PublicSupportMessageRequest): Observable<SupportMessage> {
    return this.http.post<ApiResponse<SupportMessage>>(`${this.url}/public-messages`, request).pipe(map(r => r.data));
  }
  mine(page = 0, size = 100): Observable<SupportMessage[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<SupportMessage>>(`${this.url}/messages/me`, { params }).pipe(map(r => r.data));
  }
  all(page = 0, size = 100): Observable<SupportMessage[]> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<SupportMessage>>(`${this.url}/messages`, { params }).pipe(map(r => r.data));
  }
  reply(userId: string, request: SupportMessageRequest): Observable<SupportMessage> {
    return this.http.post<ApiResponse<SupportMessage>>(`${this.url}/messages/${userId}/reply`, request).pipe(map(r => r.data));
  }
}
