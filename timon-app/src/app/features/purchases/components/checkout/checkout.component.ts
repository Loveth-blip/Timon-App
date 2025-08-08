import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { Product } from '../../../../models/product.model';
import { Purchase } from '../../../../models/purchase.model';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="checkout-container">
      <div *ngIf="loading" class="loading">
        <p>Loading...</p>
      </div>

      <div *ngIf="error" class="error">
        <p>{{ error }}</p>
        <button class="btn btn-primary" (click)="goBack()">Back to Products</button>
      </div>

      <div *ngIf="!loading && !error && product" class="checkout-content">
        <h1>Checkout</h1>

        <div class="product-summary">
          <div class="product-image">
            <img [src]="product.imageUrl || 'https://via.placeholder.com/200x200?text=No+Image'" [alt]="product.title">
          </div>

          <div class="product-details">
            <h2>{{ product.title }}</h2>
            <p class="product-price">{{ product.price | currency }}</p>
            <p class="product-description">{{ product.description }}</p>
          </div>
        </div>

        <div class="checkout-form-container">
          <h3>Payment Information</h3>
          <p class="demo-notice">This is a demo checkout. No real payment will be processed.</p>
          <p class="security-notice">Note: Your browser may show security warnings because this is a demo form running locally without HTTPS. In a production environment, this would be served over a secure connection.</p>

          <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()" class="checkout-form">
            <div class="form-group">
              <label for="cardName">Name on Card</label>
              <input
                type="text"
                id="cardName"
                formControlName="cardName"
                class="form-control"
                placeholder="John Doe"
                (focus)="onFieldFocus('cardName')"
                (input)="onFieldInput()"
              >
              <div *ngIf="cardName?.invalid && (cardName?.dirty || cardName?.touched)" class="error-message">
                <div *ngIf="cardName?.errors?.['required']">Name on card is required</div>
              </div>
            </div>

            <div class="form-group">
              <label for="cardNumber">Card Number</label>
              <input
                type="text"
                id="cardNumber"
                formControlName="cardNumber"
                class="form-control"
                placeholder="1234 5678 9012 3456"
                (focus)="onFieldFocus('cardNumber')"
                (input)="onFieldInput()"
              >
              <div *ngIf="cardNumber?.invalid && (cardNumber?.dirty || cardNumber?.touched)" class="error-message">
                <div *ngIf="cardNumber?.errors?.['required']">Card number is required</div>
                <div *ngIf="cardNumber?.errors?.['pattern']">Please enter a valid card number (15-19 digits, spaces or dashes allowed)</div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="expiryDate">Expiry Date</label>
                <input
                  type="text"
                  id="expiryDate"
                  formControlName="expiryDate"
                  class="form-control"
                  placeholder="MM/YY"
                  (focus)="onFieldFocus('expiryDate')"
                  (input)="onFieldInput()"
                >
                <div *ngIf="expiryDate?.invalid && (expiryDate?.dirty || expiryDate?.touched)" class="error-message">
                  <div *ngIf="expiryDate?.errors?.['required']">Expiry date is required</div>
                  <div *ngIf="expiryDate?.errors?.['pattern']">Please enter a valid expiry date (MM/YY)</div>
                </div>
              </div>

              <div class="form-group">
                <label for="cvv">CVV</label>
                <input
                  type="text"
                  id="cvv"
                  formControlName="cvv"
                  class="form-control"
                  placeholder="123"
                  (focus)="onFieldFocus('cvv')"
                  (input)="onFieldInput()"
                >
                <div *ngIf="cvv?.invalid && (cvv?.dirty || cvv?.touched)" class="error-message">
                  <div *ngIf="cvv?.errors?.['required']">CVV is required</div>
                  <div *ngIf="cvv?.errors?.['pattern']">Please enter a valid CVV</div>
                </div>
              </div>
            </div>

            <!-- Suggestion Card -->
            <div *ngIf="showSuggestion && activeField && !isTyping" class="suggestion-card">
              <div class="suggestion-content">
                <p class="suggestion-title">Suggested Value:</p>
                <p class="suggestion-value">{{ getSuggestionForField(activeField) }}</p>
                <button type="button" class="btn btn-suggestion" (click)="useSuggestion()">
                  Use Suggested Value
                </button>
              </div>
            </div>

            <div *ngIf="submitting" class="submitting-message">
              <p>Processing your payment...</p>
            </div>

            <div *ngIf="submitError" class="alert alert-danger">
              {{ submitError }}
            </div>

            <div class="checkout-summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>{{ product.price | currency }}</span>
              </div>
              <div class="summary-row">
                <span>Tax:</span>
                <span>{{ product.price * 0.1 | currency }}</span>
              </div>
              <div class="summary-row total">
                <span>Total:</span>
                <span>{{ product.price * 1.1 | currency }}</span>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" (click)="goBack()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="checkoutForm.invalid || submitting">
                Complete Purchase
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
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

    h1 {
      font-size: 2rem;
      color: #333;
      margin-bottom: 2rem;
    }

    .product-summary {
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

    .product-details {
      flex-grow: 1;
    }

    h2 {
      font-size: 1.5rem;
      color: #333;
      margin: 0 0 0.5rem;
    }

    .product-price {
      font-weight: bold;
      color: #4285f4;
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }

    .product-description {
      color: #666;
      line-height: 1.6;
    }

    h3 {
      font-size: 1.2rem;
      color: #333;
      margin: 0 0 1rem;
    }

    .demo-notice {
      background-color: #e8f0fe;
      color: #1a73e8;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .security-notice {
      background-color: #fef7e0;
      color: #ea8600;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }

    .suggestion-card {
      background-color: #e6f4ea;
      border: 1px solid #34a853;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .suggestion-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .suggestion-title {
      font-weight: 500;
      color: #137333;
      margin-bottom: 0.5rem;
    }

    .suggestion-value {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e8e3e;
      margin-bottom: 1rem;
    }

    .btn-suggestion {
      background-color: #34a853;
      color: white;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }

    .btn-suggestion:hover {
      background-color: #1e8e3e;
    }

    .checkout-form {
      margin-top: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-row .form-group {
      flex: 1;
      margin-bottom: 0;
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
    }

    .form-control:focus {
      border-color: #4285f4;
      outline: none;
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

    .checkout-summary {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .summary-row.total {
      font-weight: bold;
      font-size: 1.1rem;
      border-top: 1px solid #ddd;
      padding-top: 0.5rem;
      margin-top: 0.5rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
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
      .product-summary {
        flex-direction: column;
      }

      .product-image {
        width: 100%;
        height: 250px;
      }

      .form-row {
        flex-direction: column;
        gap: 1.5rem;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  product: Product | null = null;
  loading = true;
  error = '';
  submitting = false;
  submitError = '';
  showSuggestion = false;
  activeField: string | null = null;
  isTyping = false;
  private productSubscription: Subscription | null = null;

  // Suggested card data
  suggestedCardData = {
    cardName: 'John Doe',
    cardNumber: '4111 1111 1111 1111',
    expiryDate: '12/25',
    cvv: '123'
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {
    this.checkoutForm = this.fb.group({
      cardName: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.pattern(/^[\d\s-]{15,19}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
    });
  }

  get cardName() { return this.checkoutForm.get('cardName'); }
  get cardNumber() { return this.checkoutForm.get('cardNumber'); }
  get expiryDate() { return this.checkoutForm.get('expiryDate'); }
  get cvv() { return this.checkoutForm.get('cvv'); }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('productId');
    if (!productId) {
      this.error = 'Product ID is required';
      this.loading = false;
      return;
    }

    this.productSubscription = this.apiService.getProduct(productId)
      .subscribe({
        next: (response) => {
          this.product = response.data.product!;
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
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid || !this.product) return;

    this.submitting = true;
    this.submitError = '';

    const userId = 'user123'; // In a real app, get this from auth service
    const purchaseData = {
      userId,
      productId: this.product.id || this.product._id!,
      amount: this.product.price * 1.1, // Including tax
      paymentMethod: 'Credit Card',
      shippingAddress: {
        street: '123 Demo Street',
        city: 'Demo City',
        state: 'Demo State',
        zipCode: '12345',
        country: 'Demo Country'
      }
    };

    // Simulate payment processing delay
    setTimeout(() => {
      this.apiService.createPurchase(purchaseData).subscribe({
        next: (response) => {
          this.submitting = false;
          this.router.navigate(['/purchases']);
        },
        error: (error) => {
          this.submitting = false;
          this.submitError = 'Failed to process payment. Please try again.';
          console.error('Error creating purchase:', error);
        }
      });
    }, 2000);
  }

  goBack(): void {
    if (this.product && (this.product.id || this.product._id)) {
      this.router.navigate(['/products', this.product.id || this.product._id]);
    } else {
      this.router.navigate(['/products']);
    }
  }

  // Handle field focus
  onFieldFocus(fieldName: string): void {
    this.activeField = fieldName;
    this.showSuggestion = true;
    this.isTyping = false;
  }

  // Handle field input
  onFieldInput(): void {
    this.isTyping = true;
    // Hide suggestion after user starts typing
    setTimeout(() => {
      if (this.isTyping) {
        this.showSuggestion = false;
      }
    }, 500);
  }

  // Get suggestion value for the active field
  getSuggestionForField(fieldName: string): string {
    return this.suggestedCardData[fieldName as keyof typeof this.suggestedCardData] || '';
  }

  // Use the suggested value for the active field
  useSuggestion(): void {
    if (this.activeField) {
      this.checkoutForm.get(this.activeField)?.setValue(
        this.suggestedCardData[this.activeField as keyof typeof this.suggestedCardData]
      );
      this.showSuggestion = false;
    }
  }
}
