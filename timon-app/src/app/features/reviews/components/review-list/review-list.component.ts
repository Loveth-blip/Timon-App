import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../../../../services/firebase.service';
import { ReviewAnalyzerService } from '../../../../services/review-analyzer.service';
import { Product } from '../../../../models/product.model';
import { Review } from '../../../../models/review.model';
import { Observable, switchMap, tap, of, catchError } from 'rxjs';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="reviews-container">
      <div *ngIf="loading" class="loading">
        <p>Loading reviews...</p>
      </div>

      <div *ngIf="error" class="error">
        <p>{{ error }}</p>
        <button class="btn btn-primary" routerLink="/products">
          Back to Products
        </button>
      </div>

      <div *ngIf="!loading && !error && product" class="reviews-content">
        <div class="reviews-header">
          <h1>Reviews for {{ product.title }}</h1>
          <button
            class="btn btn-primary"
            routerLink="/reviews/create/{{ product.id }}"
          >
            Write a Review
          </button>
        </div>

        <div *ngIf="(reviews$ | async)?.length === 0" class="no-reviews">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>

        <div class="reviews-list">
          <div *ngFor="let review of reviews$ | async" class="review-card">
            <div class="review-header">
              <div class="review-tags">
                <span class="tag" [ngClass]="review.tags.behavioral">
                  Behavior: {{ review.tags.behavioral }}
                </span>
                <span class="tag" [ngClass]="review.tags.linguistic">
                  Text: {{ review.tags.linguistic }}
                </span>
                <span class="tag" [ngClass]="review.tags.finalDecision">
                  Status: {{ review.tags.finalDecision }}
                </span>
              </div>
            </div>

            <div class="review-content">
              <p>{{ review.reviewText }}</p>
            </div>

            <div class="review-footer">
              <p class="review-date">
                {{ review.createdAtDisplay | date : 'medium' }}
              </p>
            </div>
          </div>
        </div>

        <div class="reviews-footer">
          <button
            class="btn btn-secondary"
            routerLink="/products/{{ product.id }}"
          >
            Back to Product
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .reviews-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 2rem;
      }

      .loading,
      .error {
        text-align: center;
        padding: 3rem 0;
        color: #666;
        font-size: 1.2rem;
      }

      .error {
        color: #d93025;
      }

      .reviews-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      h1 {
        font-size: 2rem;
        color: #333;
        margin: 0;
      }

      .no-reviews {
        color: #666;
        font-style: italic;
        margin-bottom: 2rem;
        padding: 2rem;
        text-align: center;
        background-color: #f8f9fa;
        border-radius: 8px;
      }

      .reviews-list {
        margin-bottom: 2rem;
      }

      .review-card {
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .review-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
      }

      .review-tags {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .tag {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;
      }

      .tag.real,
      .tag.human,
      .tag.confirmed {
        background-color: #e6f4ea;
        color: #137333;
      }

      .tag.fake,
      .tag.AI {
        background-color: #fce8e6;
        color: #d93025;
      }

      .tag.pending,
      .tag.flagged {
        background-color: #fef7e0;
        color: #ea8600;
      }

      .review-content {
        color: #333;
        line-height: 1.6;
        margin-bottom: 1rem;
      }

      .review-footer {
        color: #666;
        font-size: 0.9rem;
      }

      .reviews-footer {
        display: flex;
        justify-content: flex-start;
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

      .btn-primary:hover {
        background-color: #3367d6;
      }

      .btn-secondary {
        background-color: #f1f3f4;
        color: #4285f4;
      }

      .btn-secondary:hover {
        background-color: #e8eaed;
      }

      @media (max-width: 768px) {
        .reviews-header {
          flex-direction: column;
          align-items: flex-start;
        }

        h1 {
          margin-bottom: 1rem;
        }

        .btn {
          width: 100%;
        }
      }
    `,
  ],
})
export class ReviewListComponent implements OnInit {
  product: Product | null = null;
  reviews$: Observable<Review[]>;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService,
    private reviewAnalyzerService: ReviewAnalyzerService
  ) {
    this.reviews$ = of([]);
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const productId = params.get('productId');
          if (!productId) {
            throw new Error('Product ID is required');
          }
          return this.firebaseService.getDocument<Product>(
            'products',
            productId
          );
        }),
        tap((product) => {
          this.product = product;
          this.loading = false;

          // Load reviews for this product
          if (product && product.id) {
            this.reviews$ = this.reviewAnalyzerService.getProductReviews(
              product.id
            );
          }
        }),
        catchError((error) => {
          this.loading = false;
          this.error = 'Product not found or an error occurred.';
          console.error('Error loading product:', error);
          return of(null);
        })
      )
      .subscribe();
  }
}
