import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api.model';
import { UpdateUserRequest, UserResponse } from '../../../core/models/user.model';

/** Reflète UserController côté backend (§36) — le mot de passe reste géré exclusivement par Keycloak. */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  getMe(): Observable<UserResponse> {
    return this.http.get<ApiResponse<UserResponse>>(`${this.baseUrl}/me`).pipe(map((res) => res.data));
  }

  updateMe(request: UpdateUserRequest): Observable<UserResponse> {
    return this.http
      .put<ApiResponse<UserResponse>>(`${this.baseUrl}/me`, request)
      .pipe(map((res) => res.data));
  }
}
