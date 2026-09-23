import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Atteinte quand roleGuard refuse l'accès à un utilisateur AUTHENTIFIÉ mais sans le bon rôle
 * (§14/§80) — différent d'un utilisateur non connecté, qui est lui redirigé vers Keycloak
 * directement par authGuard (pas de page intermédiaire dans ce cas).
 */
@Component({
  selector: 'app-access-denied',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container" style="padding-block: 4rem; max-width: 480px; text-align: center;">
      <p class="badge badge--danger">Accès refusé</p>
      <h1>Vous n'avez pas l'autorisation d'accéder à cette page</h1>
      <p>
        Cette section est réservée à un autre rôle. Si vous pensez qu'il s'agit d'une erreur,
        contactez le support.
      </p>
      <a class="btn btn--primary" routerLink="/">Retour à l'accueil</a>
    </section>
  `,
})
export class AccessDeniedPage {}
