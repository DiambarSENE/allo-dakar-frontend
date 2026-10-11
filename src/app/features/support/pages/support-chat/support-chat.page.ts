import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SupportMessage, SupportService } from '../../services/support.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-support-chat',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './support-chat.page.html',
})
export class SupportChatPage {
  private readonly service = inject(SupportService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = new FormBuilder();
  protected readonly staffMode = this.route.snapshot.data['staffMode'] === true;
  protected readonly messages = signal<SupportMessage[]>([]);
  /** Clé de conversation : userId, ou "tel:<numéro>" pour un visiteur non connecté (lecture seule). */
  protected readonly selectedUser = signal('');
  protected readonly submitting = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    message: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  constructor() { this.load(); }

  protected load(): void {
    (this.staffMode ? this.service.all() : this.service.mine()).subscribe({
      next: items => {
        this.messages.set(items);
        if (this.staffMode && items.length && !this.selectedUser()) this.selectedUser.set(this.keyOf(items[0]));
      },
    });
  }

  protected chooseUser(key: string): void { this.selectedUser.set(key); }

  protected keyOf(m: SupportMessage): string {
    return m.userId ?? `tel:${m.phoneNumber ?? m.id}`;
  }

  /** Une conversation par utilisateur / visiteur, la plus récente d'abord. */
  protected conversations(): SupportMessage[] {
    const seen = new Set<string>();
    return this.messages().filter(m => { const k = this.keyOf(m); return seen.has(k) ? false : (seen.add(k), true); });
  }

  protected selectedIsGuest(): boolean { return this.selectedUser().startsWith('tel:'); }

  protected submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    const value = this.form.getRawValue();
    const request = { message: value.message.trim() };
    const action = this.staffMode
      ? (this.selectedUser() && !this.selectedIsGuest() ? this.service.reply(this.selectedUser(), request) : null)
      : this.service.send(request);
    if (!action) {
      this.submitting.set(false);
      this.toast.error(this.selectedIsGuest()
        ? 'Visiteur non connecté : rappelez-le au numéro indiqué.' : 'Sélectionnez une conversation.');
      return;
    }
    action.subscribe({
      next: sent => {
        this.submitting.set(false);
        this.messages.update(items => this.staffMode ? [sent, ...items] : [...items, sent]);
        this.form.controls.message.setValue('');
        this.toast.success(this.staffMode ? 'Réponse envoyée.' : 'Message envoyé au service client.');
      },
      error: () => this.submitting.set(false),
    });
  }

  protected thread(): SupportMessage[] {
    return this.staffMode
      ? this.messages().filter(m => this.keyOf(m) === this.selectedUser()).slice().reverse()
      : this.messages().slice().reverse();
  }
}
