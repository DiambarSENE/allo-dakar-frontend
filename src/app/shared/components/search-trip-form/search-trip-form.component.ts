import { ChangeDetectionStrategy, Component, input, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, Validators, AbstractControl } from '@angular/forms';

import { TripSearchRequest } from '../../../core/models/trip.model';

/** Validator : la date de départ ne peut pas être dans le passé (§85). */
function notInPastValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(control.value);
  return selected < today ? { pastDate: true } : null;
}

/**
 * Réutilisé sur la page d'accueil (§11, version compacte) et la page de recherche (§12, version
 * complète avec filtres prix/places). `compact` masque les filtres avancés sans dupliquer le
 * formulaire.
 */
@Component({
  selector: 'app-search-trip-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-trip-form.component.html',
  styleUrl: './search-trip-form.component.scss',
})
export class SearchTripFormComponent implements OnInit {
  private readonly fb = new FormBuilder();

  readonly compact = input(false);
  readonly initialValue = input<Partial<TripSearchRequest> | null>(null);
  readonly search = output<TripSearchRequest>();

  protected readonly form = this.fb.nonNullable.group(
    {
      departureCity: [''],
      destinationCity: [''],
      departureDate: ['', [notInPastValidator]],
      minPrice: [null as number | null, [Validators.min(0)]],
      maxPrice: [null as number | null, [Validators.min(0)]],
      minAvailableSeats: [null as number | null, [Validators.min(1)]],
    },
    { validators: [priceRangeValidator] },
  );

  ngOnInit(): void {
    const initial = this.initialValue();
    if (initial) {
      this.form.patchValue({
        departureCity: initial.departureCity ?? '',
        destinationCity: initial.destinationCity ?? '',
        departureDate: initial.departureDate ?? '',
        minPrice: initial.minPrice ?? null,
        maxPrice: initial.maxPrice ?? null,
        minAvailableSeats: initial.minAvailableSeats ?? null,
      });
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const criteria: TripSearchRequest = {
      departureCity: value.departureCity || undefined,
      destinationCity: value.destinationCity || undefined,
      departureDate: value.departureDate || undefined,
      minPrice: value.minPrice ?? undefined,
      maxPrice: value.maxPrice ?? undefined,
      minAvailableSeats: value.minAvailableSeats ?? undefined,
    };
    this.search.emit(criteria);
  }
}

/** La borne haute de prix ne peut pas être inférieure à la borne basse (§85). */
function priceRangeValidator(group: AbstractControl): ValidationErrors | null {
  const min = group.get('minPrice')?.value;
  const max = group.get('maxPrice')?.value;
  if (min != null && max != null && max < min) {
    return { priceRange: true };
  }
  return null;
}
