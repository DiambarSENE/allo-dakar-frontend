import { Pipe, PipeTransform } from '@angular/core';

/**
 * Libellés français et couleur de badge pour TOUS les statuts affichés dans les tableaux
 * (réservation, trajet, paiement, compte, véhicule, vérification, litige…). Évite d'afficher
 * des valeurs d'enum brutes (« CONFIRMED ») et garde des couleurs cohérentes partout.
 */
const LABELS: Record<string, string> = {
  ACTIVE: 'Actif', INACTIVE: 'Inactif', SUSPENDED: 'Suspendu', BANNED: 'Banni', PENDING: 'En attente',
  MAINTENANCE: 'En maintenance', UNDER_REVIEW: 'En cours d’examen', VERIFIED: 'Vérifié', REJECTED: 'Rejeté',
  REQUIRES_MORE_INFORMATION: 'Complément requis', SUBMITTED: 'Soumis', APPROVED: 'Approuvé',
  DRAFT: 'Brouillon', PUBLISHED: 'Publié', FULL: 'Complet', IN_PROGRESS: 'En cours', COMPLETED: 'Terminé',
  CANCELLED: 'Annulé', EXPIRED: 'Expiré', CONFIRMED: 'Confirmé', PROCESSING: 'En traitement',
  SUCCESS: 'Réussi', FAILED: 'Échoué', REFUNDED: 'Remboursé', HIDDEN: 'Masqué', OPEN: 'Ouvert',
  RESOLVED: 'Résolu', CLOSED: 'Clos', SENT: 'Envoyé', READ: 'Lu',
};

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'muted';

const TONES: Record<string, Tone> = {
  ACTIVE: 'success', VERIFIED: 'success', APPROVED: 'success', PUBLISHED: 'success', CONFIRMED: 'success',
  COMPLETED: 'success', SUCCESS: 'success', RESOLVED: 'success', SENT: 'success', READ: 'success',
  PENDING: 'warning', UNDER_REVIEW: 'warning', SUBMITTED: 'warning', OPEN: 'warning', MAINTENANCE: 'warning',
  IN_PROGRESS: 'info', PROCESSING: 'info', REQUIRES_MORE_INFORMATION: 'info', FULL: 'info',
  SUSPENDED: 'danger', BANNED: 'danger', REJECTED: 'danger', FAILED: 'danger', CANCELLED: 'danger',
  EXPIRED: 'danger', HIDDEN: 'danger',
  DRAFT: 'muted', INACTIVE: 'muted', CLOSED: 'muted', REFUNDED: 'muted',
};

@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  transform(status: string | null | undefined): string {
    return status ? (LABELS[status] ?? status) : '—';
  }
}

/** Renvoie la classe complète du badge : `<span [class]="s | statusBadge">`. */
@Pipe({ name: 'statusBadge' })
export class StatusBadgePipe implements PipeTransform {
  transform(status: string | null | undefined): string {
    return `badge badge--${(status && TONES[status]) || 'muted'}`;
  }
}
