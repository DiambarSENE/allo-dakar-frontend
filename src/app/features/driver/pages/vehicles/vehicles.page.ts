import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { DriverService } from '../../services/driver.service';
import { VehicleResponse } from '../../../../core/models/user.model';
import { VehicleType } from '../../../../core/models/enums';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ToastService } from '../../../../core/services/toast.service';

const VEHICLE_TYPES: VehicleType[] = ['SEDAN', 'SUV', 'HATCHBACK', 'MINIBUS', 'PICKUP', 'OTHER'];

@Component({
  selector: 'app-driver-vehicles',
  imports: [ReactiveFormsModule, SpinnerComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicles.page.html',
})
export class DriverVehiclesPage {
  private readonly driverService = inject(DriverService);
  private readonly toast = inject(ToastService);
  private readonly fb = new FormBuilder();

  protected readonly vehicleTypes = VEHICLE_TYPES;
  protected readonly vehicles = signal<VehicleResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly showForm = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    brand: ['', [Validators.required, Validators.maxLength(60)]],
    model: ['', [Validators.required, Validators.maxLength(60)]],
    registrationNumber: ['', [Validators.required, Validators.maxLength(30)]],
    color: [''],
    year: [null as number | null],
    numberOfSeats: [4, [Validators.required, Validators.min(1)]],
    vehicleType: ['SEDAN' as VehicleType, Validators.required],
  });

  constructor() {
    this.load();
  }

  protected addVehicle(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();
    this.driverService
      .addVehicle({
        brand: value.brand,
        model: value.model,
        registrationNumber: value.registrationNumber,
        color: value.color || undefined,
        year: value.year ?? undefined,
        numberOfSeats: value.numberOfSeats,
        vehicleType: value.vehicleType,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.form.reset({ vehicleType: 'SEDAN', numberOfSeats: 4 });
          this.showForm.set(false);
          this.toast.success('Véhicule ajouté.');
          this.load();
        },
        error: () => this.saving.set(false),
      });
  }

  protected deleteVehicle(vehicle: VehicleResponse): void {
    if (!confirm(`Supprimer le véhicule ${vehicle.brand} ${vehicle.model} ?`)) {
      return;
    }
    this.driverService.deleteVehicle(vehicle.id).subscribe(() => {
      this.toast.success('Véhicule supprimé.');
      this.load();
    });
  }

  private load(): void {
    this.loading.set(true);
    this.driverService.listMyVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles.set(vehicles);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
