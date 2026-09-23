import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container" style="padding-block: 4rem; max-width: 480px; text-align: center;">
      <h1>Page introuvable</h1>
      <p>La ressource demandée n'existe pas ou a été déplacée.</p>
      <a class="btn btn--primary" routerLink="/">Retour à l'accueil</a>
    </section>
  `,
})
export class NotFoundPage {}
