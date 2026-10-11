import { AutoRefreshTokenService, provideKeycloak, UserActivityService, withAutoRefreshToken } from 'keycloak-angular';

import { environment } from '../../../environments/environment';

/**
 * Configuration Keycloak centralisée (Phase 3 du cahier des charges).
 *
 * - onLoad: 'check-sso' — ne force PAS la redirection vers Keycloak au chargement de l'app :
 *   les pages publiques (accueil, recherche, détail trajet) restent accessibles sans compte.
 *   La redirection réelle vers le login Keycloak n'a lieu que lorsqu'une route protégée
 *   (voir authGuard) est atteinte sans session active.
 * - silentCheckSsoRedirectUri pointe vers un fichier statique minimal (silent-check-sso.html,
 *   voir public/) qui évite un rechargement complet de la page lors de la vérification SSO.
 * - pkceMethod: 'S256' — obligatoire pour un client PUBLIC (SPA) : jamais de client secret
 *   dans le frontend (voir README §Sécurité).
 * - withAutoRefreshToken : rafraîchit le token tant que l'utilisateur est actif, déconnecte
 *   après inactivité prolongée plutôt que de laisser un token expiré traîner en mémoire.
 *
 * IMPORTANT (bug rencontré en pratique — NG0201 "No provider found for AutoRefreshTokenService") :
 * dans keycloak-angular@21.0.0, AutoRefreshTokenService et sa dépendance UserActivityService sont
 * de simples @Injectable() SANS `providedIn: 'root'`. provideKeycloak() n'enregistre PAS
 * automatiquement les classes dont une feature (ici withAutoRefreshToken) a besoin : il ne fait
 * qu'appeler feature.configure(), qui lui-même fait inject(AutoRefreshTokenService) — cet inject
 * échoue si la classe n'a été fournie nulle part. Il faut donc les ajouter explicitement au champ
 * `providers` ci-dessous (distinct de `features`). Si une future version de la librairie ajoute
 * `providedIn: 'root'` à ces classes, cet ajout devient un no-op sans danger.
 */
export function provideAppKeycloak() {
  return provideKeycloak({
    config: {
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId,
    },
    initOptions: {
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      pkceMethod: 'S256',
    },
    providers: [AutoRefreshTokenService, UserActivityService],
    features: [
      withAutoRefreshToken({
        sessionTimeout: 30 * 60 * 1000, // 30 min d'inactivité avant déconnexion automatique
        onInactivityTimeout: 'logout',
      }),
    ],
  });
}
