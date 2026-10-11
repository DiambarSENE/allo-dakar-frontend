import { PaymentMethod, ReportReason, ReportStatus, ReviewStatus, RoleType, VehicleType } from '../../core/models/enums';

/** Libellés français centralisés (évite de dupliquer les enums bruts dans les écrans). */
export const REPORT_REASONS: readonly ReportReason[] = [
  'INAPPROPRIATE_BEHAVIOR',
  'SAFETY_CONCERN',
  'FRAUD_OR_SCAM',
  'FAKE_PROFILE',
  'NO_SHOW',
  'OFFENSIVE_CONTENT',
  'PAYMENT_ISSUE',
  'OTHER',
];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  INAPPROPRIATE_BEHAVIOR: 'Comportement inapproprié',
  SAFETY_CONCERN: 'Problème de sécurité',
  FRAUD_OR_SCAM: 'Fraude / arnaque',
  FAKE_PROFILE: 'Faux profil',
  NO_SHOW: 'Absence au rendez-vous',
  OFFENSIVE_CONTENT: 'Contenu offensant',
  PAYMENT_ISSUE: 'Problème de paiement',
  OTHER: 'Autre',
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  OPEN: 'Ouvert',
  UNDER_REVIEW: 'En cours d’examen',
  RESOLVED: 'Résolu',
  REJECTED: 'Rejeté',
  CLOSED: 'Clos',
};

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING: 'En attente',
  PUBLISHED: 'Publié',
  HIDDEN: 'Masqué',
  REJECTED: 'Refusé',
};

export const ROLE_LABELS: Record<RoleType, string> = {
  PASSENGER: 'Passager',
  DRIVER: 'Conducteur',
  ADMIN: 'Administrateur',
  CUSTOMER_SERVICE: 'Service client',
  MODERATOR: 'Modérateur',
};

export const ROLE_DESCRIPTIONS: Record<RoleType, string> = {
  PASSENGER: 'Rechercher et réserver des trajets.',
  DRIVER: 'Publier des trajets et gérer ses véhicules.',
  ADMIN: 'Accès complet à l’administration.',
  CUSTOMER_SERVICE: 'Répondre aux utilisateurs, consulter les litiges.',
  MODERATOR: 'Modération des contenus (avis, signalements).',
};

export const ASSIGNABLE_ROLES: readonly RoleType[] = ['PASSENGER', 'DRIVER', 'CUSTOMER_SERVICE', 'MODERATOR', 'ADMIN'];

export function reportStatusBadgeClass(status: ReportStatus): string {
  switch (status) {
    case 'RESOLVED': return 'badge--success';
    case 'OPEN':
    case 'UNDER_REVIEW': return 'badge--warning';
    case 'REJECTED': return 'badge--danger';
    default: return 'badge--muted';
  }
}

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  SEDAN: 'Berline',
  SUV: 'SUV / 4x4',
  HATCHBACK: 'Citadine',
  MINIBUS: 'Minibus',
  PICKUP: 'Pick-up',
  OTHER: 'Autre',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Espèces',
  CARD: 'Carte bancaire',
  MOBILE_MONEY: 'Mobile Money',
  BANK_TRANSFER: 'Virement bancaire',
  OTHER: 'Autre',
};
