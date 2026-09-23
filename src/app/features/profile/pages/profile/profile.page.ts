import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { UserService } from '../../services/user.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ToastService } from '../../../../core/services/toast.service';

type LoadState = 'loading' | 'success' | 'error';

/**
 * §36 : modifier prénom/nom/téléphone — l'authentification (mot de passe, email de connexion)
 * reste gérée exclusivement par Keycloak (aucun champ mot de passe ici, §76).
 */
@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.page.html',
})
export class ProfilePage {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly fb = new FormBuilder();

  protected readonly state = signal<LoadState>('loading');
  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(80)]],
    lastName: ['', [Validators.required, Validators.maxLength(80)]],
    phone: ['', [Validators.maxLength(20)]],
  });

  constructor() {
    this.userService.getMe().subscribe({
      next: (user) => {
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone ?? '',
        });
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.userService.updateMe(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Profil mis à jour.');
      },
      error: () => this.saving.set(false),
    });
  }
}
