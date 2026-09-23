// Reflète EXACTEMENT web/dtos/booking côté backend.

import { BookingStatus, PaymentStatus } from './enums';
import { TripSummaryResponse } from './trip.model';

export interface BookingResponse {
  id: string;
  bookingReference: string;
  trip: TripSummaryResponse;
  passengerId: string;
  numberOfSeats: number;
  unitPrice: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  bookedAt: string; // Instant ISO
  confirmedAt: string | null;
  cancelledAt: string | null;
}

export interface CreateBookingRequest {
  tripId: string;
  numberOfSeats: number;
}

export interface CancelBookingRequest {
  reason?: string;
}
