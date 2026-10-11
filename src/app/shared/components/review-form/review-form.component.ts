import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
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
    <form class="review" [formGroup]="form" (ngSubmit)="submit()">
      <div class="review__rating">
        <span class="form-label" id="rating-label">Votre note</span>
        <app-rating-stars mode="input" size="lg" [value]="form.controls.rating.value" (valueChange)="setRating($event)" />
        <span class="review__verdict" [class.review__verdict--set]="rating() > 0" aria-live="polite">
          {{ rating() > 0 ? verdicts[rating() - 1] : 'Touchez une étoile pour noter' }}
        </span>
        @if (form.controls.rating.invalid && form.controls.rating.touched) {
          <span class="form-error">Merci de choisir une note entre 1 et 5.</span>
        }
      </div>

      <div class="form-field">
        <label class="form-label" for="comment">Votre commentaire <small>(optionnel)</small></label>
        <div class="review__chips" role="group" aria-label="Suggestions">
          @for (s of suggestions(); track s) {
            <button type="button" class="review__chip" (click)="addSuggestion(s)">+ {{ s }}</button>
          }
        </div>
        <textarea id="comment" class="form-control" rows="4" maxlength="1000" formControlName="comment"
                  placeholder="Partagez votre expérience pour aider les autres membres…"></textarea>
        <span class="form-hint review__count">{{ form.controls.comment.value.length }} / 1000</span>
      </div>

      <button type="submit" class="btn btn--primary btn--block" [disabled]="submitting()">
        {{ submitting() ? 'Envoi…' : "Publier l'avis" }}
      </button>
    </form>
  `,
  styles: [
    `
      .review { display: grid; gap: 1rem; }
      .review__rating { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; padding: 1.1rem 1rem; text-align: center;
        background: linear-gradient(180deg, #fff8ee, #fff); border: 1px solid var(--color-border, #e5e1d8); border-radius: 16px; }
      .review__verdict { font-size: 0.9rem; font-weight: 600; color: var(--color-muted, #6b7280); }
      .review__verdict--set { color: #b8501e; }
      .review__chips { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.5rem; }
      .review__chip { padding: 0.3rem 0.75rem; border: 1px solid var(--color-border, #e5e1d8); border-radius: 999px; background: #fff;
        font-size: 0.8rem; font-weight: 600; color: var(--color-text, #1f2a24); cursor: pointer; transition: all 0.12s ease; }
      .review__chip:hover { border-color: #e2672a; color: #e2672a; background: #fff6ef; }
      .review__count { align-self: flex-end; }
    `,
  ],
})
export class ReviewFormComponent {
  private readonly reviewService = inject(ReviewService);
  private readonly toast = inject(ToastService);
  private readonly fb = new FormBuilder();

  readonly tripId = input.required<string>();
  readonly bookingId = input.required<string>();
  readonly targetUserId = input.required<string>();
  /** Détermine les suggestions de commentaire rapides (conducteur noté par un passager, ou l'inverse). */
  readonly audience = input<'driver' | 'passenger'>('driver');
  readonly submitted = output<void>();

  protected readonly verdicts = ['Très décevant', 'Décevant', 'Correct', 'Très bien', 'Excellent !'];
  protected readonly suggestions = computed(() =>
    this.audience() === 'driver'
      ? ['Ponctuel', 'Conduite agréable', 'Véhicule propre', 'Bonne communication']
      : ['Ponctuel', 'Respectueux', 'Bonne communication', 'Sympathique'],
  );

  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: [''],
  });

  protected rating(): number {
    return this.form.controls.rating.value;
  }

  protected addSuggestion(text: string): void {
    const current = this.form.controls.comment.value.trim();
    if (current.toLowerCase().includes(text.toLowerCase())) return;
    const next = current ? `${current}${/[.!?]$/.test(current) ? '' : '.'} ${text}.` : `${text}.`;
    this.form.controls.comment.setValue(next.slice(0, 1000));
  }

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
