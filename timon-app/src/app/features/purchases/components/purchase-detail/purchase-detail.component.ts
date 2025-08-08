import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, PurchaseDetailResponse } from '../../../../services/api.service';
import { Purchase } from '../../../../models/purchase.model';
import { Product } from '../../../../models/product.model';
import { Observable, switchMap, tap, of, catchError } from 'rxjs';

@Component({
  selector: 'app-purchase-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="purchase-detail-container">
      <div *ngIf="loading" class="loading">
        <p>Loading purchase details...</p>
      </div>

      <div *ngIf="error" class="error">
        <p>{{ error }}</p>
        <button class="btn btn-primary" routerLink="/purchases">Back to Purchases</button>
      </div>

      <div *ngIf="!loading && !error && purchase && product" class="purchase-content">
        <div class="purchase-header">
          <h1>Purchase Details</h1>
          <p class="purchase-id">Order #{{ purchase._id || purchase.id }}</p>
        </div>

        <div class="purchase-summary">
          <div class="product-image">
            <img [src]="product.imageUrl || 'https://via.placeholder.com/200x200?text=No+Image'" [alt]="product.title">
          </div>

          <div class="purchase-info">
            <h2>{{ product.title }}</h2>
            <p class="purchase-date">Purchased on {{ purchase.createdAt || purchase.timestamp | date:'medium' }}</p>
            <p class="purchase-amount">{{ purchase.amount | currency }}</p>

            <div class="purchase-actions">
              <a [routerLink]="['/products', product._id || product.id]" class="btn btn-secondary">View Product</a>
              <a [routerLink]="['/reviews/create', product._id || product.id]" class="btn btn-primary">Write a Review</a>
            </div>
          </div>
        </div>

        <div class="purchase-details">
          <h3>Order Details</h3>

          <div class="details-grid">
            <div class="detail-row">
              <span class="detail-label">Order Date:</span>
              <span class="detail-value">{{ purchase.createdAt || purchase.timestamp | date:'medium' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Order Total:</span>
              <span class="detail-value">{{ purchase.amount | currency }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Product:</span>
              <span class="detail-value">{{ product.title }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Category:</span>
              <span class="detail-value">{{ product.category }}</span>
            </div>
            <div class="detail-row" *ngIf="purchase.status">
              <span class="detail-label">Status:</span>
              <span class="detail-value">{{ purchase.status | titlecase }}</span>
            </div>
            <div class="detail-row" *ngIf="purchase.paymentMethod">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">{{ purchase.paymentMethod }}</span>
            </div>
          </div>
        </div>

        <div class="back-link">
          <a routerLink="/purchases" class="btn btn-secondary">Back to Purchases</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .purchase-detail-container {
      max-width: 1000px;
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

    .purchase-header {
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

    .purchase-id {
      color: #666;
      font-size: 1rem;
    }

    .purchase-summary {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #eee;
    }

    .product-image {
      width: 200px;
      height: 200px;
      flex-shrink: 0;
      background-color: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      overflow: hidden;
    }

    .product-image img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .purchase-info {
      flex-grow: 1;
    }

    h2 {
      font-size: 1.5rem;
      color: #333;
      margin: 0 0 0.5rem;
    }

    .purchase-date {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .purchase-amount {
      font-weight: bold;
      color: #4285f4;
      font-size: 1.2rem;
      margin-bottom: 1.5rem;
    }

    .purchase-actions {
      display: flex;
      gap: 1rem;
    }

    .purchase-details {
      margin-bottom: 2rem;
    }

    h3 {
      font-size: 1.2rem;
      color: #333;
      margin: 0 0 1rem;
    }

    .details-grid {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
    }

    .detail-row {
      display: flex;
      margin-bottom: 1rem;
    }

    .detail-row:last-child {
      margin-bottom: 0;
    }

    .detail-label {
      width: 150px;
      font-weight: 500;
      color: #555;
    }

    .detail-value {
      flex-grow: 1;
      color: #333;
    }

    .back-link {
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
      text-decoration: none;
      display: inline-block;
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
      .purchase-summary {
        flex-direction: column;
      }

      .product-image {
        width: 100%;
        height: 250px;
      }

      .purchase-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        text-align: center;
      }

      .detail-row {
        flex-direction: column;
      }

      .detail-label {
        width: 100%;
        margin-bottom: 0.25rem;
      }
    }
  `]
})
export class PurchaseDetailComponent implements OnInit {
  purchase: Purchase | null = null;
  product: Product | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const purchaseId = params.get('id');
        if (!purchaseId) {
          throw new Error('Purchase ID is required');
        }
        return this.apiService.getPurchaseWithProduct(purchaseId);
      }),
      tap((response: PurchaseDetailResponse) => {
        if (response.data.purchase && response.data.product) {
          this.purchase = response.data.purchase;
          this.product = response.data.product;
        } else {
          throw new Error('Purchase or product data not found');
        }
        this.loading = false;
      }),
      catchError(error => {
        this.loading = false;
        this.error = 'Purchase not found or an error occurred.';
        console.error('Error loading purchase:', error);
        return of(null);
      })
    ).subscribe();
  }
}
