// Reflète exactement sn.diafoune.allo_dakar.entities.enums côté backend — ne jamais diverger du
// contrat REST (voir README §API contract). Jetons/abonnements exclus (hors périmètre).

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING';

export type RoleType = 'PASSENGER' | 'DRIVER' | 'ADMIN' | 'CUSTOMER_SERVICE' | 'MODERATOR';

export type DriverVerificationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'REQUIRES_MORE_INFORMATION';

export type VehicleStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export type VehicleType = 'SEDAN' | 'SUV' | 'HATCHBACK' | 'MINIBUS' | 'PICKUP' | 'OTHER';

export type DocumentType =
  | 'NATIONAL_ID'
  | 'DRIVING_LICENSE'
  | 'VEHICLE_REGISTRATION'
  | 'INSURANCE'
  | 'OTHER';

export type VerificationWorkflowStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'REQUIRES_MORE_INFORMATION';

export type TripStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'FULL'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED' | 'COMPLETED' | 'EXPIRED';

export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'OTHER';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export type ReviewStatus = 'PENDING' | 'PUBLISHED' | 'HIDDEN' | 'REJECTED';

export type ReportReason =
  | 'INAPPROPRIATE_BEHAVIOR'
  | 'SAFETY_CONCERN'
  | 'FRAUD_OR_SCAM'
  | 'FAKE_PROFILE'
  | 'NO_SHOW'
  | 'OFFENSIVE_CONTENT'
  | 'PAYMENT_ISSUE'
  | 'OTHER';

export type ReportStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | 'CLOSED';

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | 'CLOSED';

export type DisputeType = 'BOOKING' | 'PAYMENT' | 'CANCELLATION' | 'TRIP' | 'BEHAVIOR';

export type NotificationType =
  | 'BOOKING_CREATED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'DRIVER_VERIFIED'
  | 'DRIVER_VERIFICATION_REJECTED'
  | 'REVIEW_RECEIVED'
  | 'REPORT_HANDLED';

export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'READ';
