// Reflète EXACTEMENT web/dtos/review côté backend.

import { ReviewStatus } from './enums';

export interface ReviewResponse {
  id: string;
  tripId: string;
  authorId: string;
  authorFullName: string;
  targetUserId: string;
  rating: number; // 1 à 5
  comment: string | null;
  status: ReviewStatus;
}

export interface CreateReviewRequest {
  tripId: string;
  bookingId: string;
  targetUserId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}
