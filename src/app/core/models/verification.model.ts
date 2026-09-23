// Reflète EXACTEMENT web/dtos/verification côté backend. documentUrl n'est JAMAIS retourné par
// le backend dans VerificationResponse (voir commentaire du .java) — ne jamais l'afficher
// publiquement même si une future évolution du backend venait à l'exposer par erreur.

import { DocumentType, VerificationWorkflowStatus } from './enums';

export interface VerificationResponse {
  id: string;
  driverId: string;
  documentType: DocumentType;
  status: VerificationWorkflowStatus;
  submittedAt: string; // Instant ISO
  reviewedAt: string | null;
  rejectionReason: string | null;
}

export interface SubmitVerificationRequest {
  documentType: DocumentType;
  documentNumber?: string;
  documentUrl: string;
}

/** Utilisé par l'admin pour approuver/rejeter/demander un complément (voir AdminController). */
export interface ReviewVerificationRequest {
  comment?: string;
  rejectionReason?: string;
}
