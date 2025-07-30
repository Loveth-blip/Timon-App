import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FirebaseService } from '../../../../services/firebase.service';
import { Product } from '../../../../models/product.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="products-container">
      <div class="products-header">
        <h1>Products</h1>
        <div class="filters">
          <!-- Filters can be added here in the future -->
        </div>
      </div>

      <div *ngIf="loading" class="loading">
        <p>Loading products...</p>
      </div>

      <div *ngIf="!loading && (products$ | async)?.length === 0" class="no-products">
        <p>No products available.</p>
      </div>

      <div class="products-grid">
        <div *ngFor="let product of products$ | async" class="product-card">
          <a [routerLink]="['/products', product.id]" class="product-link">
            <div class="product-image" [style.background-image]="'url(' + (product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image') + ')'"></div>
            <div class="product-info">
              <h3 class="product-title">{{ product.title }}</h3>
              <p class="product-category">{{ product.category }}</p>
              <p class="product-price">{{ product.price | currency }}</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .products-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .products-header {
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

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 2rem;
    }

    .product-card {
      background-color: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    .product-link {
      text-decoration: none;
      color: inherit;
      display: block;
    }

    .product-image {
      height: 200px;
      background-size: cover;
      background-position: center;
      background-color: #f8f9fa;
    }

    .product-info {
      padding: 1.5rem;
    }

    .product-title {
      margin: 0 0 0.5rem;
      font-size: 1.2rem;
      color: #333;
    }

    .product-category {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .product-price {
      font-weight: bold;
      color: #4285f4;
      font-size: 1.1rem;
      margin: 0;
    }

    @media (max-width: 768px) {
      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.5rem;
      }

      .products-header {
        flex-direction: column;
        align-items: flex-start;
      }

      h1 {
        margin-bottom: 1rem;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  products$: Observable<Product[]>;
  loading = true;

  constructor(private firebaseService: FirebaseService) {
    this.products$ = this.firebaseService.getCollection<Product>('products');
  }

  ngOnInit(): void {
    // Add some sample products if none exist
    this.addSampleProducts();

    // Set loading to false after a short delay
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  private addSampleProducts(): void {
    // This is just for demo purposes
    // In a real app, you would have an admin interface to add products
    const sampleProducts: Product[] = [
      {
        title: 'Smartphone X',
        category: 'Electronics',
        description: 'The latest smartphone with advanced features and a stunning display.',
        price: 799.99,
        imageUrl: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      },
      {
        title: 'Wireless Headphones',
        category: 'Electronics',
        description: 'Premium wireless headphones with noise cancellation and long battery life.',
        price: 199.99,
        imageUrl: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      },
      {
        title: 'Fitness Tracker',
        category: 'Wearables',
        description: 'Track your fitness goals with this advanced fitness tracker.',
        price: 99.99,
        imageUrl: 'https://images.pexels.com/photos/4498482/pexels-photo-4498482.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      },
      {
        title: 'Smart Watch',
        category: 'Wearables',
        description: 'Stay connected with this feature-packed smart watch.',
        price: 249.99,
        imageUrl: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      },
      {
        title: 'Laptop Pro',
        category: 'Computers',
        description: 'Powerful laptop for professionals and creatives.',
        price: 1299.99,
        imageUrl: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      },
      {
        title: 'Wireless Mouse',
        category: 'Accessories',
        description: 'Ergonomic wireless mouse for comfortable use.',
        price: 49.99,
        imageUrl: 'https://images.pexels.com/photos/5082577/pexels-photo-5082577.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      }
    ];

    // Check if products already exist
    this.firebaseService.getCollection<Product>('products').subscribe(products => {
      if (products.length === 0) {
        // Add sample products if none exist
        sampleProducts.forEach(product => {
          this.firebaseService.addDocument<Product>('products', product).subscribe();
        });
      }
    });
  }
}
