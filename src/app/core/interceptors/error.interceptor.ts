import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';
import { catchError, throwError } from 'rxjs';

import { ErrorHandlerService } from '../services/error-handler.service';
import { ToastService } from '../services/toast.service';
import { SKIP_ERROR_TOAST } from './http-context.tokens';

/**
 * Stratégie globale d'erreurs (§24/§65) : traduit chaque HttpErrorResponse en message
 * compréhensible via ErrorHandlerService, puis l'affiche en toast — sauf si l'appelant a
 * explicitement demandé de gérer l'erreur lui-même (skipErrorToast(), ex: 409 sur une
 * réservation qui affiche son propre message contextuel, voir §30).
 *
 * Cas 401 particulier : Keycloak gère déjà le refresh automatique (withAutoRefreshToken,
 * voir keycloak.config.ts) — un 401 qui arrive malgré tout signifie que la session n'est
 * plus valable (ex: compte suspendu synchronisé côté Keycloak). On déclenche alors un
 * login Keycloak plutôt qu'un simple toast, pour éviter que l'utilisateur reste bloqué sur
 * une page qui ne fonctionnera plus (§75, évite aussi les boucles : login() redirige au lieu
 * de recharger la page courante en boucle).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorHandler = inject(ErrorHandlerService);
  const toast = inject(ToastService);
  const keycloak = inject(Keycloak);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401 && keycloak.authenticated) {
          void keycloak.login({ redirectUri: window.location.href });
        } else if (!req.context.get(SKIP_ERROR_TOAST)) {
          toast.error(errorHandler.resolveMessage(error));
        }
      }
      return throwError(() => error);
    }),
  );
};
