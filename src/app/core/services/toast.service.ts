import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

/**
 * Bus de notifications UI global (§25). Un composant <app-toast-container> (shared/components/toast)
 * lit toastsSignal et affiche/retire les toasts. Aucune dépendance à une librairie externe : les
 * signals suffisent pour ce besoin simple.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly toasts = signal<Toast[]>([]);
  readonly toastsSignal = this.toasts.asReadonly();

  private show(type: ToastType, message: string, durationMs = 5000): void {
    const id = ++this.nextId;
    this.toasts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message, 7000);
  }

  warning(message: string): void {
    this.show('warning', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
