import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, PagedResponse, PaginationMeta } from '../../../core/models/api.model';
import { CreateReviewRequest, ReviewResponse, UpdateReviewRequest } from '../../../core/models/review.model';

export interface ReviewListResult {
  reviews: ReviewResponse[];
  pagination: PaginationMeta;
}

/** Reflète ReviewController côté backend — chemins volontairement non uniformes (voir .java). */
@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  create(request: CreateReviewRequest): Observable<ReviewResponse> {
    return this.http
      .post<ApiResponse<ReviewResponse>>(`${this.apiUrl}/reviews`, request)
      .pipe(map((res) => res.data));
  }

  listForUser(userId: string, page = 0, size = 10): Observable<ReviewListResult> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<PagedResponse<ReviewResponse>>(`${this.apiUrl}/users/${userId}/reviews`, { params })
      .pipe(map((res) => ({ reviews: res.data, pagination: res.pagination })));
  }

  update(id: string, request: UpdateReviewRequest): Observable<ReviewResponse> {
    return this.http
      .put<ApiResponse<ReviewResponse>>(`${this.apiUrl}/reviews/${id}`, request)
      .pipe(map((res) => res.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/reviews/${id}`).pipe(map(() => undefined));
  }
}
