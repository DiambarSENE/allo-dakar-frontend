import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { ApiError } from '../models/api.model';

/**
 * Traduit une erreur HTTP (format ApiErrorResponse du backend, voir GlobalExceptionHandler) en
 * message compréhensible. Ne jamais afficher de stack trace ou de détail technique brut (§24).
 *
 * Priorité de résolution du message :
 * 1. Un message dédié pour le "code" métier du backend (ex: BOOKING_SEATS_UNAVAILABLE), quand un
 *    message générique par statut HTTP serait trop vague.
 * 2. Un message générique par statut HTTP (§65).
 * 3. Le message brut renvoyé par le backend, si présent (déjà pensé pour être affiché à
 *    l'utilisateur côté backend — voir ApiException).
 * 4. Un message de repli générique.
 */
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private readonly messagesByCode: Record<string, string> = {
    BOOKING_NOT_AVAILABLE: "Ce trajet n'est plus disponible à la réservation.",
    BOOKING_SEATS_UNAVAILABLE:
      'Désolé, les places disponibles viennent d’être modifiées. Veuillez actualiser le trajet.',
    TRIP_NOT_PUBLISHABLE: 'Ce trajet ne peut pas être publié en l’état.',
    TRIP_NOT_AVAILABLE: "Ce trajet n'est plus disponible.",
    DRIVER_NOT_VERIFIED: 'Votre profil conducteur doit être vérifié avant de publier un trajet.',
    PAYMENT_FAILED_ERROR: 'Le paiement a échoué. Veuillez réessayer.',
    DUPLICATE_REVIEW: 'Vous avez déjà laissé un avis pour ce trajet.',
    REVIEW_NOT_ALLOWED: "Vous ne pouvez pas laisser d'avis pour ce trajet.",
    ACCOUNT_SUSPENDED: 'Ce compte est suspendu.',
    INVALID_CREDENTIALS: 'Identifiants invalides.',
  };

  private readonly messagesByStatus: Record<number, string> = {
    400: 'La demande est invalide.',
    401: 'Votre session a expiré. Veuillez vous reconnecter.',
    403: "Vous n'avez pas l'autorisation d'effectuer cette action.",
    404: 'La ressource demandée est introuvable.',
    409: 'Cette opération entre en conflit avec une modification récente.',
    422: 'Certaines données envoyées ne sont pas valides.',
    429: 'Trop de requêtes ont été envoyées. Veuillez patienter.',
    500: 'Une erreur inattendue est survenue.',
    503: 'Le service est temporairement indisponible. Veuillez réessayer plus tard.',
  };

  resolveMessage(error: HttpErrorResponse): string {
    const body = error.error as Partial<ApiError> | undefined;

    if (body?.code && this.messagesByCode[body.code]) {
      return this.messagesByCode[body.code];
    }
    if (body?.message) {
      return body.message;
    }
    if (this.messagesByStatus[error.status]) {
      return this.messagesByStatus[error.status];
    }
    if (error.status === 0) {
      return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    }
    return 'Une erreur inattendue est survenue.';
  }
}
