import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent, IconName } from '../icon/icon.component';

export interface ActionItem {
  key: string;
  icon: IconName;
  title: string;
  hint?: string;
  cta: string;
  route: string | unknown[];
  tone?: 'warning' | 'info' | 'success';
}

/**
 * Liste « À faire » : met en avant les prochaines actions utiles de l'utilisateur (payer,
 * donner un avis, terminer un trajet…) avec un bouton direct. Masquée quand il n'y a rien à faire.
 */
@Component({
  selector: 'app-action-list',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length > 0) {
      <section class="panel todo" aria-label="Actions à faire">
        <div class="panel__head">
          <h2>{{ title() }}</h2>
          <span class="badge badge--warning">{{ items().length }}</span>
        </div>
        <ul class="todo__list">
          @for (item of items(); track item.key) {
            <li class="todo__item">
              <span class="todo__icon" [class]="'todo__icon todo__icon--' + (item.tone ?? 'warning')"><app-icon [name]="item.icon" /></span>
              <div class="todo__text">
                <strong>{{ item.title }}</strong>
                @if (item.hint) { <small>{{ item.hint }}</small> }
              </div>
              <a class="btn btn--primary btn--sm" [routerLink]="item.route">{{ item.cta }}</a>
            </li>
          }
        </ul>
      </section>
    }
  `,
  styles: [`
    .todo__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.6rem; }
    .todo__item { display: flex; align-items: center; gap: 0.9rem; padding: 0.75rem 0.9rem; border: 1px solid var(--color-border, #e5e1d8); border-radius: 14px; background: #fffdf8; }
    .todo__icon { display: grid; place-items: center; flex-shrink: 0; width: 40px; height: 40px; border-radius: 12px; font-size: 1.2rem; }
    .todo__icon--warning { color: #b8860b; background: #fff3d6; }
    .todo__icon--info { color: #2563eb; background: #e6eeff; }
    .todo__icon--success { color: #1a7f4e; background: #dff3e8; }
    .todo__text { flex: 1; min-width: 0; }
    .todo__text strong { display: block; font-size: 0.92rem; }
    .todo__text small { display: block; color: var(--color-muted, #6b7280); font-size: 0.8rem; }
    @media (max-width: 520px) { .todo__item { flex-wrap: wrap; } .todo__item .btn { width: 100%; justify-content: center; } }
  `],
})
export class ActionListComponent {
  readonly title = input('À faire maintenant');
  readonly items = input.required<readonly ActionItem[]>();
}
