import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ReviewService } from '../../../features/reviews/services/review.service';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';
import { ToastService } from '../../../core/services/toast.service';

/**
 * §40 : formulaire de création d'avis, réutilisable partout où un avis est autorisé (le backend
 * reste l'autorité — §116 : trajet terminé + participation réelle, voir ReviewServiceImpl côté
 * backend ; ce composant ne fait aucune vérification de ces règles lui-même, il se contente
 * d'afficher l'erreur backend si la tentative est refusée).
 */
@Component({
  selector: 'app-review-form',
  imports: [ReactiveFormsModule, RatingStarsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="card" [formGroup]="form" (ngSubmit)="submit()">
      <div class="form-field">
        <label class="form-label" id="rating-label">Votre note</label>
        <app-rating-stars mode="input" [value]="form.controls.rating.value" (valueChange)="setRating($event)" />
        @if (form.controls.rating.invalid && form.controls.rating.touched) {
          <span class="form-error">Merci de choisir une note entre 1 et 5.</span>
        }
      </div>

      <div class="form-field">
        <label class="form-label" for="comment">Commentaire (optionnel)</label>
        <textarea id="comment" class="form-control" rows="3" formControlName="comment"></textarea>
      </div>

      <button type="submit" class="btn btn--primary" [disabled]="submitting()">
        {{ submitting() ? 'Envoi…' : "Publier l'avis" }}
      </button>
    </form>
  `,
})
export class ReviewFormComponent {
  private readonly reviewService = inject(ReviewService);
  private readonly toast = inject(ToastService);
  private readonly fb = new FormBuilder();

  readonly tripId = input.required<string>();
  readonly bookingId = input.required<string>();
  readonly targetUserId = input.required<string>();
  readonly submitted = output<void>();

  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: [''],
  });

  protected setRating(value: number): void {
    this.form.controls.rating.setValue(value);
    this.form.controls.rating.markAsTouched();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.reviewService
      .create({
        tripId: this.tripId(),
        bookingId: this.bookingId(),
        targetUserId: this.targetUserId(),
        rating: this.form.getRawValue().rating,
        comment: this.form.getRawValue().comment || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.success('Avis publié.');
          this.submitted.emit();
        },
        error: () => this.submitting.set(false),
      });
  }
}
