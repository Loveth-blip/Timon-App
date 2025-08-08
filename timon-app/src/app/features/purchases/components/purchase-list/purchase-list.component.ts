import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, PurchaseListResponse } from '../../../../services/api.service';
import { Purchase } from '../../../../models/purchase.model';
import { Product } from '../../../../models/product.model';
import { Observable, of } from 'rxjs';

interface PurchaseWithProduct extends Purchase {
  product?: Product;
}

@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="purchases-container">
      <div class="purchases-header">
        <h1>My Purchases</h1>
      </div>

      <div *ngIf="loading" class="loading">
        <p>Loading your purchases...</p>
      </div>

      <div *ngIf="!loading && purchases.length === 0" class="no-purchases">
        <p>You haven't made any purchases yet.</p>
        <button class="btn btn-primary" routerLink="/products">Browse Products</button>
      </div>

      <div class="purchases-list">
        <div *ngFor="let purchase of purchases" class="purchase-card">
          <div class="purchase-image" *ngIf="purchase.product">
            <img [src]="purchase.product.imageUrl || 'https://via.placeholder.com/150x150?text=No+Image'" [alt]="purchase.product.title">
          </div>

          <div class="purchase-info">
            <h3 *ngIf="purchase.product">{{ purchase.product.title }}</h3>
            <p class="purchase-date">Purchased on {{ purchase.createdAt || purchase.timestamp | date:'medium' }}</p>
            <p class="purchase-amount">{{ purchase.amount | currency }}</p>

            <div class="purchase-actions">
              <a [routerLink]="['/products', purchase.productId]" class="btn btn-secondary">View Product</a>
              <a [routerLink]="['/reviews/create', purchase.productId]" class="btn btn-primary">Write a Review</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .purchases-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }

    .purchases-header {
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 2rem;
      color: #333;
      margin: 0;
    }

    .loading, .no-purchases {
      text-align: center;
      padding: 3rem 0;
      color: #666;
      font-size: 1.2rem;
    }

    .no-purchases button {
      margin-top: 1rem;
    }

    .purchases-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .purchase-card {
      display: flex;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .purchase-image {
      width: 150px;
      height: 150px;
      flex-shrink: 0;
      background-color: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .purchase-image img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .purchase-info {
      padding: 1.5rem;
      flex-grow: 1;
    }

    h3 {
      margin: 0 0 0.5rem;
      font-size: 1.2rem;
      color: #333;
    }

    .purchase-date {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .purchase-amount {
      font-weight: bold;
      color: #4285f4;
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }

    .purchase-actions {
      display: flex;
      gap: 1rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      font-size: 0.9rem;
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
      .purchase-card {
        flex-direction: column;
      }

      .purchase-image {
        width: 100%;
        height: 200px;
      }

      .purchase-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class PurchaseListComponent implements OnInit {
  purchases: PurchaseWithProduct[] = [];
  loading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // In a real app, get the current user ID from auth service
    const userId = 'user123';

    this.loadPurchases(userId);
  }

  private loadPurchases(userId: string): void {
    this.apiService.getUserPurchasesWithProducts(userId).subscribe({
      next: (response: PurchaseListResponse) => {
        this.purchases = response.data.purchases || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading purchases:', error);
        this.loading = false;
        // If no purchases found, just show empty state
        this.purchases = [];
      }
    });
  }
}
