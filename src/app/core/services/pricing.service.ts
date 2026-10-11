import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';

interface PricingResponse {
  reservationFee: number;
  currency: string;
}

/** Valeur de repli (identique au défaut backend) si l'endpoint est momentanément indisponible. */
const DEFAULT_RESERVATION_FEE = 500;

/**
 * Tarification publique : frais de réservation facturés UNE fois par réservation, en plus du
 * prix du trajet. La valeur vient du backend (app.business.booking-fee) pour rester cohérente
 * avec le montant réellement facturé ; le défaut n'est qu'un repli d'affichage.
 */
@Injectable({ providedIn: 'root' })
export class PricingService {
  private readonly http = inject(HttpClient);

  readonly reservationFee = signal(DEFAULT_RESERVATION_FEE);

  constructor() {
    this.http.get<ApiResponse<PricingResponse>>(`${environment.apiUrl}/pricing`).subscribe({
      next: (res) => this.reservationFee.set(res.data.reservationFee),
      error: () => this.reservationFee.set(DEFAULT_RESERVATION_FEE),
    });
  }
}
