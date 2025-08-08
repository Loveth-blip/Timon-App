import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { Product } from '../../../../models/product.model';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="admin-container">
      <div class="admin-header">
        <h1>{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</h1>
        <button class="btn btn-secondary" routerLink="/admin/products">Back to Products</button>
      </div>

      <div *ngIf="loading" class="loading">
        <p>Loading...</p>
      </div>

      <div *ngIf="error" class="error">
        <p>{{ error }}</p>
        <button class="btn btn-primary" routerLink="/admin/products">Back to Products</button>
      </div>

      <form *ngIf="!loading && !error" [formGroup]="productForm" (ngSubmit)="onSubmit()" class="product-form">
        <div class="form-group">
          <label for="title">Product Title</label>
          <input
            type="text"
            id="title"
            formControlName="title"
            class="form-control"
            placeholder="Enter product title"
          >
          <div *ngIf="title?.invalid && (title?.dirty || title?.touched)" class="error-message">
            <div *ngIf="title?.errors?.['required']">Product title is required</div>
          </div>
        </div>

        <div class="form-group">
          <label for="category">Category</label>
          <select
            id="category"
            formControlName="category"
            class="form-control"
          >
            <option value="">Select a category</option>
            <option value="Electronics">Electronics</option>
            <option value="Wearables">Wearables</option>
            <option value="Computers">Computers</option>
            <option value="Accessories">Accessories</option>
            <option value="Other">Other</option>
          </select>
          <div *ngIf="category?.invalid && (category?.dirty || category?.touched)" class="error-message">
            <div *ngIf="category?.errors?.['required']">Category is required</div>
          </div>
        </div>

        <div class="form-group">
          <label for="price">Price ($)</label>
          <input
            type="number"
            id="price"
            formControlName="price"
            class="form-control"
            placeholder="Enter price"
            min="0"
            step="0.01"
          >
          <div *ngIf="price?.invalid && (price?.dirty || price?.touched)" class="error-message">
            <div *ngIf="price?.errors?.['required']">Price is required</div>
            <div *ngIf="price?.errors?.['min']">Price must be greater than or equal to 0</div>
          </div>
        </div>

        <div class="form-group">
          <label for="stock">Stock</label>
          <input
            type="number"
            id="stock"
            formControlName="stock"
            class="form-control"
            placeholder="Enter stock quantity"
            min="0"
          >
          <div *ngIf="stock?.invalid && (stock?.dirty || stock?.touched)" class="error-message">
            <div *ngIf="stock?.errors?.['min']">Stock must be greater than or equal to 0</div>
          </div>
        </div>

        <div class="form-group">
          <label>Product Image</label>

          <div class="image-upload-options">
            <div class="option-tabs">
              <button type="button" class="tab-btn" [class.active]="!isUploadMode" (click)="setUploadMode(false)">Image URL</button>
              <button type="button" class="tab-btn" [class.active]="isUploadMode" (click)="setUploadMode(true)">Upload Image</button>
            </div>

            <div *ngIf="!isUploadMode" class="url-input">
              <input
                type="text"
                id="imageUrl"
                formControlName="imageUrl"
                class="form-control"
                placeholder="Enter image URL"
              >
              <div *ngIf="imageUrl?.invalid && (imageUrl?.dirty || imageUrl?.touched) && !isUploadMode" class="error-message">
                <div *ngIf="imageUrl?.errors?.['required']">Image URL is required</div>
                <div *ngIf="imageUrl?.errors?.['pattern']">Please enter a valid URL</div>
              </div>
            </div>

            <div *ngIf="isUploadMode" class="file-upload">
              <input
                type="file"
                id="imageFile"
                (change)="onFileSelected($event)"
                accept="image/*"
                class="file-input"
              >
              <label for="imageFile" class="file-label">
                <span *ngIf="!selectedFile">Choose a file</span>
                <span *ngIf="selectedFile">{{ selectedFile.name }}</span>
              </label>

              <div *ngIf="isUploading" class="upload-progress">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="uploadProgress"></div>
                </div>
                <span class="progress-text">{{ uploadProgress }}% Uploaded</span>
              </div>

              <div *ngIf="uploadError" class="error-message">
                {{ uploadError }}
              </div>

              <button
                *ngIf="selectedFile && !isUploading"
                type="button"
                class="btn btn-upload"
                (click)="uploadFile()"
              >
                Upload Image
              </button>
            </div>
          </div>

          <div *ngIf="(imageUrl?.valid && imageUrl?.value) || (isUploadMode && uploadedImageUrl)" class="image-preview">
            <img [src]="isUploadMode ? uploadedImageUrl : imageUrl?.value" alt="Product image preview">
          </div>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            formControlName="description"
            class="form-control"
            placeholder="Enter product description"
            rows="5"
          ></textarea>
          <div *ngIf="description?.invalid && (description?.dirty || description?.touched)" class="error-message">
            <div *ngIf="description?.errors?.['required']">Description is required</div>
          </div>
        </div>

        <div *ngIf="submitting" class="submitting-message">
          <p>Saving product...</p>
        </div>

        <div *ngIf="submitError" class="alert alert-danger">
          {{ submitError }}
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" routerLink="/admin/products">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid || submitting">
            {{ isEditMode ? 'Update Product' : 'Add Product' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 800px;
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

    .loading, .error {
      text-align: center;
      padding: 3rem 0;
      color: #666;
      font-size: 1.2rem;
    }

    .error {
      color: #d93025;
    }

    .product-form {
      background-color: #fff;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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

    .image-upload-options {
      margin-bottom: 1rem;
    }

    .option-tabs {
      display: flex;
      margin-bottom: 1rem;
      border-bottom: 1px solid #ddd;
    }

    .tab-btn {
      padding: 0.5rem 1rem;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      font-weight: 500;
      color: #555;
      transition: all 0.3s;
    }

    .tab-btn.active {
      color: #4285f4;
      border-bottom-color: #4285f4;
    }

    .file-upload {
      margin-bottom: 1rem;
    }

    .file-input {
      display: none;
    }

    .file-label {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background-color: #f1f3f4;
      color: #4285f4;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
      margin-bottom: 1rem;
    }

    .file-label:hover {
      background-color: #e8eaed;
    }

    .upload-progress {
      margin: 1rem 0;
    }

    .progress-bar {
      height: 8px;
      background-color: #f1f3f4;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background-color: #4285f4;
      transition: width 0.3s;
    }

    .progress-text {
      font-size: 0.875rem;
      color: #555;
    }

    .btn-upload {
      background-color: #34a853;
      color: white;
      margin-top: 0.5rem;
    }

    .btn-upload:hover {
      background-color: #1e8e3e;
    }

    .image-preview {
      margin-top: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 0.5rem;
      max-width: 300px;
    }

    .image-preview img {
      width: 100%;
      height: auto;
      object-fit: contain;
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
      .admin-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .admin-header h1 {
        margin-bottom: 1rem;
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
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  productId: string | null = null;
  loading = false;
  error = '';
  submitting = false;
  submitError = '';
  selectedFile: File | null = null;
  uploadProgress = 0;
  isUploading = false;
  uploadError = '';
  isUploadMode = false;
  uploadedImageUrl = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {
    this.productForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.min(0)]],
      imageUrl: ['', [Validators.required, Validators.pattern(/^(http|https):\/\/[^ "]+$/)]],
      description: ['', Validators.required]
    });
  }

  get title() { return this.productForm.get('title'); }
  get category() { return this.productForm.get('category'); }
  get price() { return this.productForm.get('price'); }
  get stock() { return this.productForm.get('stock'); }
  get imageUrl() { return this.productForm.get('imageUrl'); }
  get description() { return this.productForm.get('description'); }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isEditMode = true;
          this.productId = id;
          this.loading = true;
          return this.apiService.getProduct(id);
        }
        return of(null);
      }),
      tap(response => {
        if (response && response.data.product) {
          const product = response.data.product;
          this.productForm.patchValue({
            title: product.title,
            category: product.category,
            price: product.price,
            stock: product.stock || 0,
            imageUrl: product.imageUrl,
            description: product.description
          });
          this.loading = false;
        }
      }),
      catchError(error => {
        this.error = 'Failed to load product. Please try again.';
        this.loading = false;
        console.error('Error loading product:', error);
        return of(null);
      })
    ).subscribe();
  }

  setUploadMode(mode: boolean): void {
    this.isUploadMode = mode;

    // Update validators based on mode
    if (mode) {
      // In upload mode, imageUrl is not required
      this.imageUrl?.setValidators(null);
    } else {
      // In URL mode, imageUrl is required with URL pattern
      this.imageUrl?.setValidators([
        Validators.required,
        Validators.pattern(/^(http|https):\/\/[^ "]+$/)
      ]);
    }

    // Update form validation
    this.imageUrl?.updateValueAndValidity();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadError = '';
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.uploadError = 'Please select a file first';
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadError = '';

    // For now, we'll simulate file upload since we don't have Firebase storage
    // In a real implementation, you would upload to your backend
    setTimeout(() => {
      this.uploadedImageUrl = 'https://via.placeholder.com/400x300?text=Uploaded+Image';
      this.isUploading = false;
      this.uploadProgress = 100;

      // Update the form with the new image URL
      this.productForm.patchValue({
        imageUrl: this.uploadedImageUrl
      });
    }, 2000);
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;

    this.submitting = true;
    this.submitError = '';

    const product: Omit<Product, 'id' | '_id'> = {
      title: this.title?.value,
      category: this.category?.value,
      price: this.price?.value,
      stock: this.stock?.value || 0,
      imageUrl: this.imageUrl?.value,
      description: this.description?.value
    };

    if (this.isEditMode && this.productId) {
      // Update existing product
      this.apiService.updateProduct(this.productId, product).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/admin/products']);
        },
        error: (error) => {
          this.submitting = false;
          this.submitError = 'Failed to update product. Please try again.';
          console.error('Error updating product:', error);
        }
      });
    } else {
      // Add new product
      this.apiService.createProduct(product).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/admin/products']);
        },
        error: (error) => {
          this.submitting = false;
          this.submitError = 'Failed to add product. Please try again.';
          console.error('Error adding product:', error);
        }
      });
    }
  }
}
