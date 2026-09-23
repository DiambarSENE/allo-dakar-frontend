import { computed, inject, Injectable, Signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';

import { RoleType } from '../models/enums';

const KNOWN_ROLES: readonly RoleType[] = ['PASSENGER', 'DRIVER', 'ADMIN', 'CUSTOMER_SERVICE', 'MODERATOR'];

/**
 * Point d'entrée UNIQUE pour toute question d'authentification/rôle dans l'app (§15). Ne jamais
 * lire keycloak.authenticated ou les claims du token directement ailleurs — passer par ce
 * service pour éviter de disperser la logique.
 *
 * Les rôles sont lus dans "realm_access.roles" du token (rôles de REALM, pas de client — voir
 * keycloak/realm-export.json côté backend, qui définit PASSENGER/DRIVER/ADMIN/... comme rôles de
 * realm). CustomJwtAuthenticationConverter côté backend fait exactement la même lecture, donc les
 * autorisations frontend et backend restent cohérentes par construction.
 *
 * IMPORTANT (§4/§80) : ce service sert à l'UX (afficher/masquer, guards de routes) — jamais une
 * barrière de sécurité suffisante à elle seule. Le backend revalide tout côté serveur.
 */
@Injectable({ providedIn: 'root' })
export class AuthorizationService {
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  /** Se recalcule à chaque événement Keycloak (login, logout, refresh, expiration...). */
  private readonly ready: Signal<boolean> = computed(() => {
    const event = this.keycloakSignal();
    return event.type !== KeycloakEventType.KeycloakAngularNotInitialized
      && event.type !== KeycloakEventType.KeycloakAngularInit;
  });

  readonly isAuthenticated: Signal<boolean> = computed(() => {
    this.keycloakSignal(); // dépendance explicite pour recalcul réactif
    return this.ready() && !!this.keycloak.authenticated;
  });

  readonly roles: Signal<RoleType[]> = computed(() => {
    this.keycloakSignal();
    if (!this.keycloak.authenticated) {
      return [];
    }
    const realmRoles = this.keycloak.realmAccess?.roles ?? [];
    return realmRoles.filter((r): r is RoleType => (KNOWN_ROLES as string[]).includes(r));
  });

  readonly fullName: Signal<string | null> = computed(() => {
    this.keycloakSignal();
    const profile = this.keycloak.idTokenParsed;
    if (!profile) return null;
    const name = [profile['given_name'], profile['family_name']].filter(Boolean).join(' ');
    return name || (profile['preferred_username'] as string) || null;
  });

  readonly email: Signal<string | null> = computed(() => {
    this.keycloakSignal();
    return (this.keycloak.idTokenParsed?.['email'] as string) ?? null;
  });

  readonly isPassenger = computed(() => this.roles().includes('PASSENGER'));
  readonly isDriver = computed(() => this.roles().includes('DRIVER'));
  readonly isAdmin = computed(() => this.roles().includes('ADMIN'));
  readonly isCustomerService = computed(() => this.roles().includes('CUSTOMER_SERVICE'));
  readonly isModerator = computed(() => this.roles().includes('MODERATOR'));

  hasRole(role: RoleType): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(roles: RoleType[]): boolean {
    return roles.some((r) => this.hasRole(r));
  }

  /** Redirige vers la page Keycloak de login. redirectUri par défaut : l'URL courante. */
  login(redirectUri?: string): Promise<void> {
    return this.keycloak.login({ redirectUri: redirectUri ?? window.location.href });
  }

  register(redirectUri?: string): Promise<void> {
    return this.keycloak.register({ redirectUri: redirectUri ?? window.location.href });
  }

  /** Nettoie la session Keycloak et ramène vers l'accueil public (§74). */
  logout(): Promise<void> {
    return this.keycloak.logout({ redirectUri: window.location.origin + '/' });
  }
}
