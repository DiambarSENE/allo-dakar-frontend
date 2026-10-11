import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthorizationService } from '../../../core/auth/authorization.service';
import { ToastService } from '../../../core/services/toast.service';
import { SupportMessage, SupportService } from '../../../features/support/services/support.service';

const PHONE_PATTERN = /^[+0-9() .-]{7,30}$/;

/**
 * Bulle flottante de chat avec le service client, affichée en bas à droite.
 * - visiteur non connecté : téléphone + message (endpoint public) ;
 * - utilisateur connecté (passager, conducteur, admin…) : message seul, la conversation
 *   est rattachée à son compte et il retrouve les réponses de l'équipe dans le panneau.
 */
@Component({
  selector: 'app-support-widget',
  imports: [ReactiveFormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './support-widget.component.html',
  styleUrl: './support-widget.component.scss',
})
export class SupportWidgetComponent {
  protected readonly auth = inject(AuthorizationService);
  private readonly service = inject(SupportService);
  private readonly toast = inject(ToastService);
  private readonly fb = new FormBuilder();

  protected readonly open = signal(false);
  protected readonly sending = signal(false);
  protected readonly sentAsGuest = signal(false);
  protected readonly thread = signal<SupportMessage[]>([]);
  private readonly body = viewChild<ElementRef<HTMLElement>>('body');

  protected readonly form = this.fb.nonNullable.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    message: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  constructor() {
    // Le téléphone n'est requis que pour un visiteur ; on adapte la validation à l'état de connexion.
    effect(() => {
      const phone = this.form.controls.phoneNumber;
      if (this.auth.isAuthenticated()) {
        phone.clearValidators();
        phone.setValue('');
      } else {
        phone.setValidators([Validators.required, Validators.pattern(PHONE_PATTERN)]);
        this.thread.set([]);
      }
      phone.updateValueAndValidity();
    });
  }

  protected toggle(): void {
    const next = !this.open();
    this.open.set(next);
    if (next) {
      this.sentAsGuest.set(false);
      if (this.auth.isAuthenticated()) this.loadThread();
    }
  }

  protected close(): void { this.open.set(false); }

  protected submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { phoneNumber, message } = this.form.getRawValue();
    this.sending.set(true);

    if (this.auth.isAuthenticated()) {
      this.service.send({ message: message.trim() }).subscribe({
        next: sent => {
          this.sending.set(false);
          this.thread.update(items => [...items, sent]);
          this.form.controls.message.reset('');
          this.scrollToBottom();
        },
        error: () => this.sending.set(false),
      });
      return;
    }

    this.service.sendPublic({ phoneNumber: phoneNumber.trim(), message: message.trim() }).subscribe({
      next: () => {
        this.sending.set(false);
        this.sentAsGuest.set(true);
        this.form.reset({ phoneNumber: '', message: '' });
        this.toast.success('Message envoyé au service client.');
      },
      error: () => this.sending.set(false),
    });
  }

  protected newGuestMessage(): void { this.sentAsGuest.set(false); }

  protected onEnter(event: Event): void {
    const e = event as KeyboardEvent;
    if (e.shiftKey) return;
    e.preventDefault();
    this.submit();
  }

  private loadThread(): void {
    this.service.mine().subscribe({
      next: items => { this.thread.set(items.slice().reverse()); this.scrollToBottom(); },
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.body()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
