import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { createAuthGuard, AuthGuardData } from 'keycloak-angular';

import { RoleType } from '../models/enums';

const KNOWN_ROLES: readonly RoleType[] = ['PASSENGER', 'DRIVER', 'ADMIN', 'CUSTOMER_SERVICE', 'MODERATOR'];

function grantedRoleTypes(authData: AuthGuardData): RoleType[] {
  return authData.grantedRoles.realmRoles.filter((r): r is RoleType => (KNOWN_ROLES as string[]).includes(r));
}

/**
 * Route protégée : nécessite une session Keycloak active, sans exigence de rôle particulier.
 * Redirige vers /access-denied (avec un état permettant d'afficher "session expirée" si le
 * token vient d'expirer plutôt que de forcer un aller-retour Keycloak silencieux) — voir §75.
 */
export const authGuard: CanActivateFn = createAuthGuard(async (route, state, authData) => {
  if (authData.authenticated) {
    return true;
  }
  // Redirige directement vers Keycloak plutôt que vers une page d'erreur : un utilisateur non
  // connecté qui clique sur une route protégée doit pouvoir s'authentifier en un clic.
  await authData.keycloak.login({ redirectUri: window.location.origin + state.url });
  return false;
});

/**
 * Inverse de authGuard : route réservée aux visiteurs NON connectés (ex: éviter d'atterrir sur
 * une page "créer un compte" alors qu'une session est déjà active).
 */
export const guestGuard: CanActivateFn = createAuthGuard(async (route, state, authData) => {
  return !authData.authenticated;
});

/**
 * Factory générique : crée un guard exigeant au moins un des rôles fournis. Toujours combiné
 * avec authGuard implicitement (un utilisateur non authentifié n'a aucun rôle, donc échoue déjà
 * ici) mais renvoie vers /access-denied plutôt que vers Keycloak si le rôle manque — on ne
 * redemande pas de se reconnecter, l'utilisateur EST connecté, il n'a juste pas la permission.
 */
export function roleGuard(allowedRoles: RoleType[]): CanActivateFn {
  return createAuthGuard(async (route, state, authData) => {
    // inject() doit être appelé de façon synchrone, avant tout "await" — Angular exécute les
    // guards fonctionnels dans le contexte d'injection de la route, donc ceci fonctionne ici.
    const router = inject(Router);

    if (!authData.authenticated) {
      await authData.keycloak.login({ redirectUri: window.location.origin + state.url });
      return false;
    }
    const roles = grantedRoleTypes(authData);
    if (roles.some((r) => allowedRoles.includes(r))) {
      return true;
    }
    return router.createUrlTree(['/access-denied']);
  });
}

export const driverGuard: CanActivateFn = roleGuard(['DRIVER']);
export const adminGuard: CanActivateFn = roleGuard(['ADMIN']);
export const customerServiceGuard: CanActivateFn = roleGuard(['CUSTOMER_SERVICE', 'ADMIN']);
export const moderatorGuard: CanActivateFn = roleGuard(['MODERATOR', 'ADMIN']);
export const passengerGuard: CanActivateFn = roleGuard(['PASSENGER']);
