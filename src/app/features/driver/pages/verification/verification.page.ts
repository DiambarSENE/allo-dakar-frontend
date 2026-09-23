import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { DriverService } from '../../services/driver.service';
import { DocumentType } from '../../../../core/models/enums';
import { DriverProfileResponse } from '../../../../core/models/user.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ToastService } from '../../../../core/services/toast.service';

const DOCUMENT_TYPES: DocumentType[] = [
  'NATIONAL_ID',
  'DRIVING_LICENSE',
  'VEHICLE_REGISTRATION',
  'INSURANCE',
  'OTHER',
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente de soumission',
  UNDER_REVIEW: "En cours d'examen",
  VERIFIED: 'Vérifié',
  REJECTED: 'Rejeté',
  REQUIRES_MORE_INFORMATION: 'Informations complémentaires requises',
};

/**
 * §38 : statut, workflow, soumission de document. Le backend n'accepte qu'une URL de document
 * déjà hébergée (documentUrl) — aucun upload de fichier binaire n'est exposé par l'API (voir
 * DriverVerification.documentUrl côté backend). Un vrai flux d'upload nécessiterait d'abord un
 * endpoint de stockage de fichiers côté backend, non spécifié — signalé plutôt qu'inventé (§117).
 */
@Component({
  selector: 'app-driver-verification',
  imports: [ReactiveFormsModule, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './verification.page.html',
})
export class DriverVerificationPage {
  private readonly driverService = inject(DriverService);
  private readonly toast = inject(ToastService);
  private readonly fb = new FormBuilder();

  protected readonly documentTypes = DOCUMENT_TYPES;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly profile = signal<DriverProfileResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    documentType: ['NATIONAL_ID' as DocumentType, Validators.required],
    documentNumber: [''],
    documentUrl: ['', [Validators.required]],
  });

  constructor() {
    this.driverService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const value = this.form.getRawValue();
    this.driverService
      .submitVerification({
        documentType: value.documentType,
        documentNumber: value.documentNumber || undefined,
        documentUrl: value.documentUrl,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.success('Document de vérification soumis.');
          this.form.reset({ documentType: 'NATIONAL_ID' });
        },
        error: () => this.submitting.set(false),
      });
  }
}
