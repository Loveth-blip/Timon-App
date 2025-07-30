import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../../../services/firebase.service';
import { BehavioralBiometricsService } from '../../../../services/behavioral-biometrics.service';
import { ReviewAnalyzerService } from '../../../../services/review-analyzer.service';
import { Product } from '../../../../models/product.model';
import { BehavioralData } from '../../../../models/review.model';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="review-form-container">
      <div *ngIf="loading" class="loading">
        <p>Loading...</p>
      </div>

      <div *ngIf="error" class="error">
        <p>{{ error }}</p>
        <button class="btn btn-primary" (click)="goBack()">Back to Product</button>
      </div>

      <div *ngIf="!loading && !error && product" class="review-form-content">
        <h1>Write a Review</h1>
        <h2>{{ product.title }}</h2>

        <div class="biometrics-info">
          <p>
            <strong>Behavioral Biometrics Active</strong>
            <span class="info-tooltip" title="We analyze typing patterns to verify review authenticity">ⓘ</span>
          </p>
          <p class="small-text">Your typing patterns are being analyzed to ensure review authenticity.</p>
        </div>

        <form [formGroup]="reviewForm" (ngSubmit)="onSubmit()" class="review-form">
          <div class="form-group">
            <label for="reviewText">Your Review</label>
            <textarea
              id="reviewText"
              formControlName="reviewText"
              class="form-control"
              rows="6"
              placeholder="Share your experience with this product..."
              (focus)="startTracking()"
              (blur)="stopTracking()"
            ></textarea>
            <div *ngIf="reviewText?.invalid && (reviewText?.dirty || reviewText?.touched)" class="error-message">
              <div *ngIf="reviewText?.errors?.['required']">Review text is required</div>
              <div *ngIf="reviewText?.errors?.['minlength']">Review must be at least 10 characters</div>
            </div>
          </div>

          <div *ngIf="submitting" class="submitting-message">
            <p>Analyzing and submitting your review...</p>
          </div>

          <div *ngIf="submitError" class="alert alert-danger">
            {{ submitError }}
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="goBack()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="reviewForm.invalid || submitting">
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .review-form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .loading, .error {
      text-align: center;
      padding: 3rem 0;
      color: #666;
      font-size: 1.2rem;
    }

    .error {
      color: #d93025;
    }

    h1 {
      font-size: 2rem;
      color: #333;
      margin-bottom: 0.5rem;
    }

    h2 {
      font-size: 1.5rem;
      color: #4285f4;
      margin-bottom: 2rem;
    }

    .biometrics-info {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 2rem;
    }

    .info-tooltip {
      display: inline-block;
      width: 18px;
      height: 18px;
      background-color: #4285f4;
      color: white;
      border-radius: 50%;
      text-align: center;
      line-height: 18px;
      font-size: 12px;
      margin-left: 0.5rem;
      cursor: help;
    }

    .small-text {
      font-size: 0.9rem;
      color: #666;
      margin-top: 0.5rem;
    }

    .review-form {
      margin-top: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #555;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s;
      font-family: inherit;
    }

    .form-control:focus {
      border-color: #4285f4;
      outline: none;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 150px;
    }

    .error-message {
      color: #d93025;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .submitting-message {
      background-color: #e8f0fe;
      color: #1a73e8;
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
    }

    .alert-danger {
      background-color: #fce8e6;
      color: #d93025;
      border: 1px solid #f5c2c7;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-primary {
      background-color: #4285f4;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #3367d6;
    }

    .btn-secondary {
      background-color: #f1f3f4;
      color: #4285f4;
    }

    .btn-secondary:hover {
      background-color: #e8eaed;
    }

    .btn:disabled {
      background-color: #a8c7fa;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .form-actions {
        flex-direction: column-reverse;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class ReviewFormComponent implements OnInit, OnDestroy {
  reviewForm: FormGroup;
  product: Product | null = null;
  loading = true;
  error = '';
  submitting = false;
  submitError = '';
  behavioralData: BehavioralData | null = null;
  private productSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService,
    private behavioralService: BehavioralBiometricsService,
    private reviewAnalyzerService: ReviewAnalyzerService
  ) {
    this.reviewForm = this.fb.group({
      reviewText: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  get reviewText() { return this.reviewForm.get('reviewText'); }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('productId');
    if (!productId) {
      this.error = 'Product ID is required';
      this.loading = false;
      return;
    }

    this.productSubscription = this.firebaseService.getDocument<Product>('products', productId)
      .subscribe({
        next: (product) => {
          this.product = product;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Product not found or an error occurred.';
          this.loading = false;
          console.error('Error loading product:', error);
        }
      });
  }

  ngOnDestroy(): void {
    if (this.productSubscription) {
      this.productSubscription.unsubscribe();
    }

    // Make sure to stop tracking if component is destroyed
    this.stopTracking();
  }

  startTracking(): void {
    this.behavioralService.startTracking();
  }

  stopTracking(): void {
    if (this.behavioralData === null) {
      this.behavioralData = this.behavioralService.stopTracking();
    }
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) return;

    // Make sure we have behavioral data
    if (!this.behavioralData) {
      this.behavioralData = this.behavioralService.stopTracking();
    }

    this.submitting = true;
    this.submitError = '';

    const userId = 'user123'; // In a real app, get this from auth service
    const productId = this.product?.id;
    const reviewText = this.reviewForm.value.reviewText;

    if (!productId) {
      this.submitError = 'Product ID is missing';
      this.submitting = false;
      return;
    }

    this.reviewAnalyzerService.submitReview(
      userId,
      productId,
      reviewText,
      this.behavioralData
    ).subscribe({
      next: (reviewId) => {
        this.submitting = false;
        this.router.navigate(['/products', productId]);
      },
      error: (error) => {
        this.submitting = false;
        this.submitError = 'Failed to submit review. Please try again.';
        console.error('Error submitting review:', error);
      }
    });
  }

  goBack(): void {
    if (this.product && this.product.id) {
      this.router.navigate(['/products', this.product.id]);
    } else {
      this.router.navigate(['/products']);
    }
  }
}
