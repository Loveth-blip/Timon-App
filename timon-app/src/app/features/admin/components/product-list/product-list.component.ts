import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { Product } from '../../../../models/product.model';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-container">
      <div class="admin-header">
        <h1>Product Management</h1>
        <button class="btn btn-primary" routerLink="/admin/products/new">Add New Product</button>
      </div>

      <div *ngIf="loading" class="loading">
        <p>Loading products...</p>
      </div>

      <ng-container *ngIf="products$ | async as products">
        <div *ngIf="!loading && products.length === 0" class="no-products">
          <p>No products available.</p>
          <button class="btn btn-primary" routerLink="/admin/products/new">Add Your First Product</button>
        </div>

        <div *ngIf="deleteError" class="alert alert-danger">
          {{ deleteError }}
        </div>

        <div class="admin-table-container">
          <table class="admin-table" *ngIf="!loading && products.length > 0">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of products">
                <td class="product-image-cell">
                  <img [src]="product.imageUrl || 'https://via.placeholder.com/50x50?text=No+Image'" [alt]="product.title" class="product-thumbnail">
                </td>
                <td>{{ product.title }}</td>
                <td>{{ product.category }}</td>
                <td>{{ product.price | currency }}</td>
                <td>
                  <span [ngClass]="{'low-stock': (product.stock || 0) < 5}">
                    {{ product.stock || 0 }}
                  </span>
                </td>
                <td>
                  <span *ngIf="product.averageRating" class="rating">
                    {{ product.averageRating }} ({{ product.numReviews || 0 }})
                  </span>
                  <span *ngIf="!product.averageRating" class="no-rating">No reviews</span>
                </td>
                <td class="actions-cell">
                  <button class="btn btn-sm btn-secondary" [routerLink]="['/admin/products/edit', product._id || '']">Edit</button>
                  <button class="btn btn-sm btn-danger" (click)="deleteProduct(product._id)">Delete</button>
                  <a class="btn btn-sm btn-info" [routerLink]="['/products', product._id || '']" target="_blank">View</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .admin-header {
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

    .loading, .no-products {
      text-align: center;
      padding: 3rem 0;
      color: #666;
      font-size: 1.2rem;
    }

    .no-products button {
      margin-top: 1rem;
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

    .admin-table-container {
      overflow-x: auto;
    }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    .admin-table th,
    .admin-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    .admin-table th {
      background-color: #f8f9fa;
      font-weight: 600;
      color: #555;
    }

    .admin-table tr:last-child td {
      border-bottom: none;
    }

    .product-image-cell {
      width: 80px;
    }

    .product-thumbnail {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 4px;
    }

    .actions-cell {
      white-space: nowrap;
      width: 200px;
    }

    .low-stock {
      color: #d93025;
      font-weight: bold;
    }

    .rating {
      color: #f39c12;
      font-weight: bold;
    }

    .no-rating {
      color: #666;
      font-style: italic;
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

    .btn-sm {
      padding: 0.4rem 0.75rem;
      font-size: 0.875rem;
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
      margin-right: 0.5rem;
    }

    .btn-secondary:hover {
      background-color: #e8eaed;
    }

    .btn-danger {
      background-color: #ea4335;
      color: white;
      margin-right: 0.5rem;
    }

    .btn-danger:hover {
      background-color: #d93025;
    }

    .btn-info {
      background-color: #34a853;
      color: white;
      text-decoration: none;
    }

    .btn-info:hover {
      background-color: #1e8e3e;
    }

    @media (max-width: 768px) {
      .admin-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .admin-header h1 {
        margin-bottom: 1rem;
      }

      .admin-table th,
      .admin-table td {
        padding: 0.75rem 0.5rem;
      }

      .actions-cell {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .btn-sm {
        width: 100%;
        margin-right: 0;
      }
    }
  `]
})
export class AdminProductListComponent implements OnInit {
  products$: Observable<Product[]>;
  loading = true;
  deleteError = '';

  constructor(private apiService: ApiService) {
    // Get products from API and map the response to extract the products array
    this.products$ = this.apiService.getProducts().pipe(
      map(response => response.data.products || [])
    );
  }

  ngOnInit(): void {
    // Set loading to false after a short delay
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  deleteProduct(productId?: string): void {
    if (!productId) {
      this.deleteError = 'Invalid product ID';
      return;
    }

    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      this.apiService.deleteProduct(productId).subscribe({
        next: () => {
          this.deleteError = '';
          // Refresh the products list
          this.products$ = this.apiService.getProducts().pipe(
            map(response => response.data.products || [])
          );
        },
        error: (error) => {
          this.deleteError = 'Failed to delete product. Please try again.';
          console.error('Error deleting product:', error);
        }
      });
    }
  }
}
