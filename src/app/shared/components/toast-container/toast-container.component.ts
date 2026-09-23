import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService } from '../../../core/services/toast.service';

/**
 * Placé une seule fois dans app.html (§25). Purement présentationnel : toute la logique
 * (création/expiration des toasts) vit dans ToastService.
 */
@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container" role="status" aria-live="polite">
      @for (toast of toastService.toastsSignal(); track toast.id) {
        <div class="toast" [class]="'toast--' + toast.type">
          <span class="toast__message">{{ toast.message }}</span>
          <button
            type="button"
            class="toast__close"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Fermer la notification"
          >
            &times;
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: min(24rem, calc(100vw - 2rem));
      }

      .toast {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: var(--radius-md, 8px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        color: #fff;
        font-size: 0.9rem;
        animation: toast-in 0.2s ease-out;
      }

      .toast--success {
        background: var(--color-success, #1a7f4e);
      }
      .toast--error {
        background: var(--color-danger, #c0392b);
      }
      .toast--warning {
        background: var(--color-warning, #b8860b);
        color: #1a1a1a;
      }
      .toast--info {
        background: var(--color-info, #2563eb);
      }

      .toast__message {
        flex: 1;
      }

      .toast__close {
        background: transparent;
        border: none;
        color: inherit;
        font-size: 1.1rem;
        line-height: 1;
        cursor: pointer;
        padding: 0;
      }

      @keyframes toast-in {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 480px) {
        .toast-container {
          left: 1rem;
          right: 1rem;
          max-width: none;
        }
      }
    `,
  ],
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
}
