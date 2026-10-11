import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface ChecklistStep {
  label: string;
  hint: string;
  done: boolean;
  route: string;
  cta: string;
}

/** Parcours de démarrage guidé : montre la progression et propose l'étape suivante en un clic. */
@Component({
  selector: 'app-checklist',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!allDone()) {
      <section class="panel steps" aria-label="Démarrage">
        <div class="panel__head">
          <h2>{{ title() }}</h2>
          <span class="steps__count">{{ doneCount() }} / {{ steps().length }}</span>
        </div>
        <div class="progress" role="progressbar" [attr.aria-valuenow]="percent()" aria-valuemin="0" aria-valuemax="100"><span [style.width.%]="percent()"></span></div>
        <ol class="steps__list">
          @for (step of steps(); track step.label; let i = $index) {
            <li class="steps__item" [class.steps__item--done]="step.done" [class.steps__item--next]="i === nextIndex()">
              <span class="steps__dot" aria-hidden="true">{{ step.done ? '✓' : i + 1 }}</span>
              <div class="steps__text">
                <strong>{{ step.label }}</strong>
                <small>{{ step.hint }}</small>
              </div>
              @if (i === nextIndex()) {
                <a class="btn btn--primary btn--sm" [routerLink]="step.route">{{ step.cta }}</a>
              }
            </li>
          }
        </ol>
      </section>
    }
  `,
  styles: [`
    .steps__count { font-weight: 700; font-size: 0.85rem; color: var(--color-muted, #6b7280); }
    .progress { margin-bottom: 1rem; }
    .steps__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; }
    .steps__item { display: flex; align-items: center; gap: 0.9rem; padding: 0.7rem 0.9rem; border-radius: 14px; border: 1px solid var(--color-border, #e5e1d8); }
    .steps__item--next { border-color: #e2672a; background: #fff6ef; }
    .steps__item--done { opacity: 0.7; }
    .steps__dot { display: grid; place-items: center; flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; font-weight: 800; font-size: 0.85rem; background: #efece4; color: #59645e; }
    .steps__item--next .steps__dot { background: #e2672a; color: #fff; }
    .steps__item--done .steps__dot { background: #1a7f4e; color: #fff; }
    .steps__text { flex: 1; min-width: 0; }
    .steps__text strong { display: block; font-size: 0.92rem; }
    .steps__text small { color: var(--color-muted, #6b7280); font-size: 0.8rem; }
    .steps__item--done strong { text-decoration: line-through; }
    @media (max-width: 520px) { .steps__item { flex-wrap: wrap; } .steps__item .btn { width: 100%; justify-content: center; } }
  `],
})
export class ChecklistComponent {
  readonly title = input('Démarrez en quelques étapes');
  readonly steps = input.required<readonly ChecklistStep[]>();

  protected readonly doneCount = computed(() => this.steps().filter((s) => s.done).length);
  protected readonly allDone = computed(() => this.doneCount() === this.steps().length);
  protected readonly percent = computed(() => Math.round((this.doneCount() / Math.max(1, this.steps().length)) * 100));
  protected readonly nextIndex = computed(() => this.steps().findIndex((s) => !s.done));
}
