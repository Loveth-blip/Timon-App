import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../../../../services/firebase.service';
import { Product } from '../../../../models/product.model';
import { Review } from '../../../../models/review.model';
import { Observable, switchMap, tap, of, catchError, map } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="product-detail-container">
      <div *ngIf="loading" class="loading">
        <p>Loading product details...</p>
      </div>

      <div *ngIf="error" class="error">
        <p>{{ error }}</p>
        <button class="btn btn-primary" routerLink="/products">
          Back to Products
        </button>
      </div>

      <div *ngIf="!loading && !error && product" class="product-content">
        <div class="product-image-container">
          <img
            [src]="
              product.imageUrl ||
              'https://via.placeholder.com/400x300?text=No+Image+Available'
            "
            [alt]="product.title"
            class="product-image"
          />
        </div>

        <div class="product-info">
          <h1 class="product-title">{{ product.title }}</h1>
          <p class="product-category">{{ product.category }}</p>
          <p class="product-price">{{ product.price | currency }}</p>
          <p class="product-description">{{ product.description }}</p>

          <div class="product-actions">
            <button class="btn btn-primary" (click)="buyProduct()">
              Buy Now
            </button>
            <button
              class="btn btn-secondary"
              routerLink="/reviews/create/{{ product.id }}"
            >
              Write a Review
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !error && product" class="reviews-section">
        <h2>Customer Reviews</h2>

        <div *ngIf="(reviews$ | async)?.length === 0" class="no-reviews">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>

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
    </div>
  `,
  styles: [
    `
      .product-detail-container {
        max-width: 1200px;
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

      .product-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        margin-bottom: 3rem;
      }

      .product-image-container {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #f8f9fa;
        border-radius: 8px;
        overflow: hidden;
      }

      .product-image {
        max-width: 100%;
        max-height: 400px;
        object-fit: contain;
      }

      .product-title {
        font-size: 2rem;
        color: #333;
        margin: 0 0 0.5rem;
      }

      .product-category {
        color: #666;
        font-size: 1rem;
        margin-bottom: 1rem;
      }

      .product-price {
        font-weight: bold;
        color: #4285f4;
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .product-description {
        color: #333;
        line-height: 1.6;
        margin-bottom: 2rem;
      }

      .product-actions {
        display: flex;
        gap: 1rem;
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

      .reviews-section {
        margin-top: 3rem;
        border-top: 1px solid #ddd;
        padding-top: 2rem;
      }

      h2 {
        font-size: 1.5rem;
        color: #333;
        margin-bottom: 1.5rem;
      }

      .no-reviews {
        color: #666;
        font-style: italic;
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

      @media (max-width: 768px) {
        .product-content {
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .product-actions {
          flex-direction: column;
        }

        .btn {
          width: 100%;
        }
      }
    `,
  ],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  reviews$: Observable<Review[]>;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService
  ) {
    this.reviews$ = of([]);
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const productId = params.get('id');
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
          console.log(product);
          this.loading = false;

          // Load reviews for this product
          if (product && product.id) {
            this.reviews$ = this.firebaseService
              .getFilteredCollection<Review>('reviews', 'productId', product.id)
              .pipe(
                tap(console.log),
                map((reviews) => {
                  return reviews.map((review: any) => ({
                    ...review,
                    createdAtDisplay: review.createdAt
                      ? new Date(
                          review.createdAt.seconds * 1000 +
                            review.createdAt.nanoseconds / 1000000
                        )
                      : undefined,
                  }));
                })
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

  buyProduct(): void {
    if (this.product && this.product.id) {
      this.router.navigate(['/purchases/checkout', this.product.id]);
    }
  }
}
