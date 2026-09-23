// Reflète EXACTEMENT web/dtos/report côté backend.

import { ReportReason, ReportStatus } from './enums';

export interface ReportResponse {
  id: string;
  reporterId: string;
  reportedUserId: string | null;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  resolution: string | null;
  resolvedAt: string | null; // Instant ISO
}

/** Au moins une cible (reportedUserId, tripId, bookingId ou reviewId) doit être fournie. */
export interface CreateReportRequest {
  reportedUserId?: string;
  tripId?: string;
  bookingId?: string;
  reviewId?: string;
  reason: ReportReason;
  description?: string;
}

export interface ResolveReportRequest {
  resolution?: string;
}
