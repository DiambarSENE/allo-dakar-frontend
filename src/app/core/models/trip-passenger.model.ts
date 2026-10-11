import { BookingStatus } from './enums';

export interface TripPassengerResponse {
  bookingId: string;
  passengerId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  numberOfSeats: number;
  bookingStatus: BookingStatus;
}
