import { HttpInterceptorFn } from '@angular/common/http';
import { includeBearerTokenInterceptor, INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG } from 'keycloak-angular';

import { environment } from '../../../environments/environment';

/**
 * Réexport direct de l'intercepteur fonctionnel de keycloak-angular — voir authTokenInterceptorConfigProvider
 * ci-dessous pour la condition d'URL. On utilise includeBearerTokenInterceptor (liste blanche
 * explicite par urlPattern) plutôt que customBearerTokenInterceptor : le token Keycloak ne doit
 * JAMAIS être envoyé à un domaine tiers par erreur (§17, §66) — seule l'API Allo Dakar y a droit.
 */
export const authInterceptor: HttpInterceptorFn = includeBearerTokenInterceptor;

/** Provider à enregistrer dans app.config.ts avec authInterceptor. */
export const authInterceptorConfigProvider = {
  provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  useValue: [
    {
      urlPattern: new RegExp(`^${escapeRegExp(environment.apiUrl)}(/.*)?$`),
    },
  ],
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
