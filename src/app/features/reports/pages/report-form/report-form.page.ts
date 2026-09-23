import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ReportService } from '../../services/report.service';
import { ReportReason } from '../../../../core/models/enums';
import { ToastService } from '../../../../core/services/toast.service';

const REASONS: ReportReason[] = [
  'INAPPROPRIATE_BEHAVIOR',
  'SAFETY_CONCERN',
  'FRAUD_OR_SCAM',
  'FAKE_PROFILE',
  'NO_SHOW',
  'OFFENSIVE_CONTENT',
  'PAYMENT_ISSUE',
  'OTHER',
];

const REASON_LABELS: Record<ReportReason, string> = {
  INAPPROPRIATE_BEHAVIOR: 'Comportement inapproprié',
  SAFETY_CONCERN: 'Problème de sécurité',
  FRAUD_OR_SCAM: 'Fraude / arnaque',
  FAKE_PROFILE: 'Faux profil',
  NO_SHOW: 'Absence au rendez-vous',
  OFFENSIVE_CONTENT: 'Contenu offensant',
  PAYMENT_ISSUE: 'Problème de paiement',
  OTHER: 'Autre',
};

/**
 * §42 : signale un utilisateur, trajet, réservation ou avis. La cible est passée en query
 * params (ex: ?tripId=... depuis la page détail trajet) — au moins une cible est requise par
 * le backend (voir CreateReportRequest), vérifié aussi côté formulaire pour éviter un aller-retour.
 */
@Component({
  selector: 'app-report-form',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './report-form.page.html',
})
export class ReportFormPage {
  private readonly reportService = inject(ReportService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly fb = new FormBuilder();

  protected readonly reasons = REASONS;
  protected readonly reasonLabels = REASON_LABELS;
  protected readonly submitting = signal(false);

  private readonly targetParams = this.route.snapshot.queryParamMap;
  protected readonly targetLabel = this.computeTargetLabel();

  protected readonly form = this.fb.nonNullable.group({
    reason: ['INAPPROPRIATE_BEHAVIOR' as ReportReason, Validators.required],
    description: ['', [Validators.maxLength(1000)]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const value = this.form.getRawValue();
    this.reportService
      .create({
        reportedUserId: this.targetParams.get('reportedUserId') ?? undefined,
        tripId: this.targetParams.get('tripId') ?? undefined,
        bookingId: this.targetParams.get('bookingId') ?? undefined,
        reviewId: this.targetParams.get('reviewId') ?? undefined,
        reason: value.reason,
        description: value.description || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.success('Signalement envoyé — notre équipe va l’examiner.');
          void this.router.navigate(['/reports']);
        },
        error: () => this.submitting.set(false),
      });
  }

  private computeTargetLabel(): string | null {
    if (this.targetParams.get('tripId')) return 'ce trajet';
    if (this.targetParams.get('bookingId')) return 'cette réservation';
    if (this.targetParams.get('reviewId')) return 'cet avis';
    if (this.targetParams.get('reportedUserId')) return 'cet utilisateur';
    return null;
  }
}
