// Reflète EXACTEMENT web/dtos/user, /driver, /vehicle côté backend — voir les .java correspondants.

import { DriverVerificationStatus, VehicleStatus, VehicleType } from './enums';

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null; // LocalDate ISO
  profilePicture: string | null;
  status: string; // UserStatus
  emailVerified: boolean;
  phoneVerified: boolean;
  roles: string[]; // Set<String> côté backend, ex. ["PASSENGER", "DRIVER"]
}

/** PATCH partiel : tous les champs sont optionnels, seuls les non-null sont appliqués côté backend. */
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  profilePicture?: string;
}

export interface SuspendUserRequest {
  reason: string;
}

export interface DriverProfileResponse {
  id: string;
  userId: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  verificationStatus: DriverVerificationStatus;
  averageRating: number;
  totalTrips: number;
  totalReviews: number;
}

export interface UpdateDriverProfileRequest {
  licenseNumber?: string;
  licenseExpiryDate?: string;
}

export interface VehicleResponse {
  id: string;
  driverId: string;
  brand: string;
  model: string;
  registrationNumber: string;
  color: string | null;
  year: number | null;
  numberOfSeats: number;
  vehicleType: VehicleType;
  status: VehicleStatus;
}

export interface CreateVehicleRequest {
  brand: string;
  model: string;
  registrationNumber: string;
  color?: string;
  year?: number;
  numberOfSeats: number;
  vehicleType: VehicleType;
}

export interface UpdateVehicleRequest {
  brand?: string;
  model?: string;
  color?: string;
  year?: number;
  numberOfSeats?: number;
  vehicleType?: VehicleType;
  status?: VehicleStatus;
}
