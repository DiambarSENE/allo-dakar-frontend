import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Boîte de dialogue accessible (role=dialog, Échap et clic sur le fond pour fermer).
 * Le contenu est projeté ; les boutons d'action vont dans <div modal-actions>.
 */
@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closed.emit()' },
  template: `
    <div class="modal__backdrop" (click)="closed.emit()"></div>
    <section class="modal__panel" role="dialog" aria-modal="true" [attr.aria-label]="title()">
      <header class="modal__header">
        <h2>{{ title() }}</h2>
        <button type="button" class="modal__close" (click)="closed.emit()" aria-label="Fermer">×</button>
      </header>
      <div class="modal__body"><ng-content /></div>
      <footer class="modal__footer"><ng-content select="[modal-actions]" /></footer>
    </section>
  `,
  styles: [`
    :host { position: fixed; inset: 0; z-index: 200; display: grid; place-items: center; padding: 1rem; }
    .modal__backdrop { position: absolute; inset: 0; background: rgba(31, 42, 36, .5); }
    .modal__panel { position: relative; width: min(32rem, 100%); max-height: calc(100dvh - 2rem); display: flex; flex-direction: column;
      background: var(--color-surface, #fff); border-radius: var(--radius-lg, 16px); box-shadow: 0 12px 32px rgba(31,42,36,.25); }
    .modal__header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-bottom: 1px solid var(--color-border, #e5e1d8); }
    .modal__header h2 { margin: 0; font-size: 1.1rem; }
    .modal__close { border: 0; background: none; font-size: 1.6rem; line-height: 1; cursor: pointer; color: var(--color-muted, #6b7280); }
    .modal__body { padding: 1.25rem; overflow-y: auto; }
    .modal__footer { display: flex; justify-content: flex-end; gap: .6rem; padding: .9rem 1.25rem; border-top: 1px solid var(--color-border, #e5e1d8); }
  `],
})
export class ModalComponent {
  readonly title = input.required<string>();
  readonly closed = output<void>();
}
