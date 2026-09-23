import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api.model';
import {
  CreateVehicleRequest,
  DriverProfileResponse,
  UpdateDriverProfileRequest,
  UpdateVehicleRequest,
  VehicleResponse,
} from '../../../core/models/user.model';
import { SubmitVerificationRequest, VerificationResponse } from '../../../core/models/verification.model';

/**
 * Reflète DriverController côté backend (GET /api/v1/drivers/me ajouté suite à l'usage
 * identifié ici — auto-provisionne le profil conducteur au premier accès, voir DriverServiceImpl).
 */
@Injectable({ providedIn: 'root' })
export class DriverService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/drivers`;

  getById(id: string): Observable<DriverProfileResponse> {
    return this.http
      .get<ApiResponse<DriverProfileResponse>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  getMyProfile(): Observable<DriverProfileResponse> {
    return this.http.get<ApiResponse<DriverProfileResponse>>(`${this.baseUrl}/me`).pipe(map((res) => res.data));
  }

  updateMyProfile(request: UpdateDriverProfileRequest): Observable<DriverProfileResponse> {
    return this.http
      .put<ApiResponse<DriverProfileResponse>>(`${this.baseUrl}/me`, request)
      .pipe(map((res) => res.data));
  }

  listMyVehicles(): Observable<VehicleResponse[]> {
    return this.http
      .get<ApiResponse<VehicleResponse[]>>(`${this.baseUrl}/me/vehicles`)
      .pipe(map((res) => res.data));
  }

  addVehicle(request: CreateVehicleRequest): Observable<VehicleResponse> {
    return this.http
      .post<ApiResponse<VehicleResponse>>(`${this.baseUrl}/me/vehicles`, request)
      .pipe(map((res) => res.data));
  }

  updateVehicle(vehicleId: string, request: UpdateVehicleRequest): Observable<VehicleResponse> {
    return this.http
      .put<ApiResponse<VehicleResponse>>(`${this.baseUrl}/me/vehicles/${vehicleId}`, request)
      .pipe(map((res) => res.data));
  }

  deleteVehicle(vehicleId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/me/vehicles/${vehicleId}`).pipe(map(() => undefined));
  }

  submitVerification(request: SubmitVerificationRequest): Observable<VerificationResponse> {
    return this.http
      .post<ApiResponse<VerificationResponse>>(`${this.baseUrl}/me/verification`, request)
      .pipe(map((res) => res.data));
  }
}
