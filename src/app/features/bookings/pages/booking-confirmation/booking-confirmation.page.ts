import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { BookingService } from '../../services/booking.service';
import { BookingResponse } from '../../../../core/models/booking.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-booking-confirmation',
  imports: [RouterLink, SpinnerComponent, ErrorStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking-confirmation.page.html',
})
export class BookingConfirmationPage {
  private readonly bookingService = inject(BookingService);
  private readonly route = inject(ActivatedRoute);

  protected readonly state = signal<LoadState>('loading');
  protected readonly booking = signal<BookingResponse | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.bookingService.getById(id).subscribe({
      next: (booking) => {
        this.booking.set(booking);
        this.state.set('success');
      },
      error: () => this.state.set('error'),
    });
  }
}
