// Reflète EXACTEMENT web/dtos/trip côté backend (voir TripResponse.java, CreateTripRequest.java,
// UpdateTripRequest.java, TripSearchRequest.java, TripSummaryResponse.java). Ne pas ajouter de
// champ qui n'existe pas côté backend (ex: pas de lat/lng ni de meetingPoints dans TripResponse).

import { TripStatus } from './enums';
import { VehicleResponse } from './user.model';

export interface TripResponse {
  id: string;
  driverId: string;
  driverFullName: string;
  vehicle: VehicleResponse;
  departureCity: string;
  departureAddress: string | null;
  destinationCity: string;
  destinationAddress: string | null;
  departureDate: string; // LocalDate ISO (yyyy-MM-dd)
  departureTime: string; // LocalTime ISO (HH:mm:ss)
  meetingPoint: string | null;
  pricePerSeat: number;
  availableSeats: number;
  totalSeats: number;
  description: string | null;
  rules: string | null;
  status: TripStatus;
  publishedAt: string | null; // Instant ISO
}

/** Version allégée utilisée dans BookingResponse.trip — voir TripSummaryResponse.java. */
export interface TripSummaryResponse {
  id: string;
  departureCity: string;
  destinationCity: string;
  departureDate: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  status: TripStatus;
}

export interface CreateTripRequest {
  vehicleId: string;
  departureCity: string;
  departureAddress?: string;
  departureLatitude?: number;
  departureLongitude?: number;
  destinationCity: string;
  destinationAddress?: string;
  destinationLatitude?: number;
  destinationLongitude?: number;
  departureDate: string;
  departureTime: string;
  meetingPoint?: string;
  pricePerSeat: number;
  totalSeats: number;
  description?: string;
  rules?: string;
}

/** Modification autorisée uniquement tant que le trajet est DRAFT/PUBLISHED sans réservation confirmée. */
export interface UpdateTripRequest {
  departureAddress?: string;
  destinationAddress?: string;
  departureDate?: string;
  departureTime?: string;
  meetingPoint?: string;
  pricePerSeat?: number;
  description?: string;
  rules?: string;
}

export interface TripSearchRequest {
  departureCity?: string;
  destinationCity?: string;
  departureDate?: string;
  minPrice?: number;
  maxPrice?: number;
  minAvailableSeats?: number;
  driver?: string;
  sort?: string;
  page?: number;
  size?: number;
}
