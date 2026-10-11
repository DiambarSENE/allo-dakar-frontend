import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { DriverService } from '../../services/driver.service';
import { DriverProfileResponse } from '../../../../core/models/user.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ToastService } from '../../../../core/services/toast.service';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente de soumission',
  UNDER_REVIEW: "En cours d'examen",
  VERIFIED: 'Vérifié',
  REJECTED: 'Rejeté',
  REQUIRES_MORE_INFORMATION: 'Informations complémentaires requises',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

@Component({
  selector: 'app-driver-verification',
  imports: [IconComponent, ReactiveFormsModule, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './verification.page.html',
})
export class DriverVerificationPage {
  private readonly driverService = inject(DriverService);
  private readonly toast = inject(ToastService);
  private readonly fb = new FormBuilder();

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly profile = signal<DriverProfileResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly licenseFile = signal<File | null>(null);
  protected readonly registrationFile = signal<File | null>(null);
  protected readonly fileError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    drivingLicenseNumber: [''],
    vehicleRegistrationNumber: [''],
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

  protected onFileSelected(event: Event, kind: 'license' | 'registration'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.fileError.set(null);
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.fileError.set('Formats acceptés : PDF, JPG ou PNG.');
      input.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      this.fileError.set('Chaque document doit faire au maximum 10 Mo.');
      input.value = '';
      return;
    }

    if (kind === 'license') this.licenseFile.set(file);
    else this.registrationFile.set(file);
  }

  protected submit(): void {
    const license = this.licenseFile();
    const registration = this.registrationFile();
    if (!license || !registration) {
      this.fileError.set('Le permis de conduire et la carte grise sont obligatoires.');
      return;
    }

    this.submitting.set(true);
    const value = this.form.getRawValue();
    const data = new FormData();
    data.append('drivingLicense', license, license.name);
    data.append('vehicleRegistration', registration, registration.name);
    if (value.drivingLicenseNumber.trim()) data.append('drivingLicenseNumber', value.drivingLicenseNumber.trim());
    if (value.vehicleRegistrationNumber.trim()) data.append('vehicleRegistrationNumber', value.vehicleRegistrationNumber.trim());

    this.driverService.submitVerification(data).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success('Permis et carte grise soumis pour vérification.');
        this.licenseFile.set(null);
        this.registrationFile.set(null);
        this.fileError.set(null);
        this.form.reset();
      },
      error: () => this.submitting.set(false),
    });
  }
}
