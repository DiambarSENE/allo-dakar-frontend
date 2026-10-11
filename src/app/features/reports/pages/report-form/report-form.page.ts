import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';

import { ReportService } from '../../services/report.service';
import { BookingService } from '../../../bookings/services/booking.service';
import { TripService } from '../../../trips/services/trip.service';
import { AuthorizationService } from '../../../../core/auth/authorization.service';
import { ReportReason } from '../../../../core/models/enums';
import { ToastService } from '../../../../core/services/toast.service';
import { REPORT_REASONS, REPORT_REASON_LABELS } from '../../../../shared/constants/labels';

interface TargetOption {
  value: string; // "booking:<id>" | "trip:<id>"
  label: string;
}

/**
 * §42 : signale un utilisateur, trajet, réservation ou avis. La cible peut être passée en query
 * params (ex: ?tripId=... depuis la page détail) ; sinon l'utilisateur choisit une de ses
 * réservations / un de ses trajets — le backend exige au moins une cible (CreateReportRequest).
 */
@Component({
  selector: 'app-report-form',
  imports: [IconComponent, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './report-form.page.html',
})
export class ReportFormPage {
  private readonly reportService = inject(ReportService);
  private readonly bookingService = inject(BookingService);
  private readonly tripService = inject(TripService);
  private readonly auth = inject(AuthorizationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly fb = new FormBuilder();

  protected readonly reasons = REPORT_REASONS;
  protected readonly reasonLabels = REPORT_REASON_LABELS;
  protected readonly submitting = signal(false);

  private readonly targetParams = this.route.snapshot.queryParamMap;
  protected readonly targetLabel = this.computeTargetLabel();
  protected readonly hasPresetTarget = this.targetLabel !== null;

  /** Cibles proposées quand aucune n'est pré-remplie. */
  protected readonly options = signal<TargetOption[]>([]);
  protected readonly optionsLoading = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    target: [''],
    reason: ['INAPPROPRIATE_BEHAVIOR' as ReportReason, Validators.required],
    description: ['', [Validators.maxLength(1000)]],
  });

  constructor() {
    if (!this.hasPresetTarget) {
      this.form.controls.target.addValidators(Validators.required);
      this.loadOptions();
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const value = this.form.getRawValue();
    const [kind, id] = value.target ? value.target.split(':') : ['', ''];
    this.reportService
      .create({
        reportedUserId: this.targetParams.get('reportedUserId') ?? undefined,
        tripId: this.targetParams.get('tripId') ?? (kind === 'trip' ? id : undefined),
        bookingId: this.targetParams.get('bookingId') ?? (kind === 'booking' ? id : undefined),
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

  private loadOptions(): void {
    this.optionsLoading.set(true);
    const empty = { bookings: [], trips: [] };
    forkJoin({
      mine: this.bookingService.listMine(0, 20).pipe(catchError(() => of({ bookings: [] }))),
      trips: this.auth.isDriver()
        ? this.tripService.listMine(0, 20).pipe(catchError(() => of({ trips: [] })))
        : of(empty),
    }).subscribe(({ mine, trips }) => {
      const bookings: TargetOption[] = mine.bookings.map((b) => ({
        value: `booking:${b.id}`,
        label: `Réservation ${b.bookingReference} — ${b.trip.departureCity} → ${b.trip.destinationCity} (${b.trip.departureDate})`,
      }));
      const tripOptions: TargetOption[] = trips.trips.map((t) => ({
        value: `trip:${t.id}`,
        label: `Mon trajet ${t.departureCity} → ${t.destinationCity} (${t.departureDate})`,
      }));
      this.options.set([...bookings, ...tripOptions]);
      this.optionsLoading.set(false);
    });
  }

  private computeTargetLabel(): string | null {
    if (this.targetParams.get('reportedUserId') && this.targetParams.get('tripId')) return 'le conducteur de ce trajet';
    if (this.targetParams.get('reportedUserId') && this.targetParams.get('bookingId')) return 'un passager de cette réservation';
    if (this.targetParams.get('tripId')) return 'ce trajet';
    if (this.targetParams.get('bookingId')) return 'cette réservation';
    if (this.targetParams.get('reviewId')) return 'cet avis';
    if (this.targetParams.get('reportedUserId')) return 'cet utilisateur';
    return null;
  }
}
