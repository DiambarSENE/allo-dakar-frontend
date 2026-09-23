// Reflète EXACTEMENT web/dtos/dispute côté backend.

import { DisputeStatus, DisputeType } from './enums';

export interface DisputeResponse {
  id: string;
  raisedByUserId: string;
  raisedByFullName: string;
  bookingId: string | null;
  paymentId: string | null;
  type: DisputeType;
  status: DisputeStatus;
  description: string | null;
  resolution: string | null;
  resolvedAt: string | null; // Instant ISO
  createdAt: string; // Instant ISO
}

export interface CreateDisputeRequest {
  type: DisputeType;
  bookingId?: string;
  paymentId?: string;
  description?: string;
}

export interface ResolveDisputeRequest {
  resolution?: string;
}
