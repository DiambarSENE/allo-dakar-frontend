import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { TripService } from '../../../trips/services/trip.service';
import { DriverService } from '../../services/driver.service';
import { VehicleResponse } from '../../../../core/models/user.model';
import { ToastService } from '../../../../core/services/toast.service';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

/** La date de départ doit être aujourd'hui ou dans le futur (§85). */
function notInPastValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(control.value) < today ? { pastDate: true } : null;
}

@Component({
  selector: 'app-trip-form',
  imports: [ReactiveFormsModule, SpinnerComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './trip-form.page.html',
})
export class TripFormPage {
  private readonly tripService = inject(TripService);
  private readonly driverService = inject(DriverService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly fb = new FormBuilder();

  protected readonly vehicles = signal<VehicleResponse[]>([]);
  protected readonly loadingVehicles = signal(true);
  protected readonly saving = signal(false);
  protected readonly isEdit = signal(false);
  private readonly tripId = this.route.snapshot.paramMap.get('id');

  protected readonly form = this.fb.nonNullable.group({
    vehicleId: ['', Validators.required],
    departureCity: ['', [Validators.required, Validators.maxLength(100)]],
    destinationCity: ['', [Validators.required, Validators.maxLength(100)]],
    departureAddress: [''],
    destinationAddress: [''],
    departureDate: ['', [Validators.required, notInPastValidator]],
    departureTime: ['', Validators.required],
    meetingPoint: [''],
    pricePerSeat: [0, [Validators.required, Validators.min(0)]],
    totalSeats: [1, [Validators.required, Validators.min(1)]],
    description: [''],
    rules: [''],
  });

  constructor() {
    this.isEdit.set(!!this.tripId);
    this.driverService.listMyVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles.set(vehicles);
        this.loadingVehicles.set(false);
      },
      error: () => this.loadingVehicles.set(false),
    });

    if (this.tripId) {
      // En édition, seuls certains champs sont modifiables côté backend (UpdateTripRequest) —
      // le formulaire de création reste identique pour l'UX, mais update() n'envoie que ces
      // champs (voir submit()).
      this.tripService.getById(this.tripId).subscribe((trip) => {
        this.form.patchValue({
          vehicleId: trip.vehicle.id,
          departureCity: trip.departureCity,
          destinationCity: trip.destinationCity,
          departureAddress: trip.departureAddress ?? '',
          destinationAddress: trip.destinationAddress ?? '',
          departureDate: trip.departureDate,
          departureTime: trip.departureTime.slice(0, 5),
          meetingPoint: trip.meetingPoint ?? '',
          pricePerSeat: trip.pricePerSeat,
          totalSeats: trip.totalSeats,
          description: trip.description ?? '',
          rules: trip.rules ?? '',
        });
        // vehicle/ville/dates ne sont pas modifiables après création (UpdateTripRequest ne les
        // accepte pas) — désactivés en édition pour ne jamais envoyer un formulaire invalide (§54).
        this.form.controls.vehicleId.disable();
        this.form.controls.departureCity.disable();
        this.form.controls.destinationCity.disable();
        this.form.controls.totalSeats.disable();
      });
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();

    const request$ = this.tripId
      ? this.tripService.update(this.tripId, {
          departureAddress: value.departureAddress || undefined,
          destinationAddress: value.destinationAddress || undefined,
          departureDate: value.departureDate,
          departureTime: value.departureTime,
          meetingPoint: value.meetingPoint || undefined,
          pricePerSeat: value.pricePerSeat,
          description: value.description || undefined,
          rules: value.rules || undefined,
        })
      : this.tripService.create({
          vehicleId: value.vehicleId,
          departureCity: value.departureCity,
          destinationCity: value.destinationCity,
          departureAddress: value.departureAddress || undefined,
          destinationAddress: value.destinationAddress || undefined,
          departureDate: value.departureDate,
          departureTime: value.departureTime,
          meetingPoint: value.meetingPoint || undefined,
          pricePerSeat: value.pricePerSeat,
          totalSeats: value.totalSeats,
          description: value.description || undefined,
          rules: value.rules || undefined,
        });

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(this.tripId ? 'Trajet mis à jour.' : 'Brouillon créé — publiez-le pour le rendre visible.');
        void this.router.navigate(['/driver/trips']);
      },
      error: () => this.saving.set(false),
    });
  }
}
