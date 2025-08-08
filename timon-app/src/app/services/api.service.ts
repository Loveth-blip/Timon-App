import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { Review, ReviewData } from '../models/review.model';

export interface ApiResponse<T> {
  status: string;
  results?: number;
  data: {
    products?: T[];
    product?: T;
    reviews?: T[];
    review?: T;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  // Product endpoints
  getProducts(): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.baseUrl}/product`);
  }

  getProduct(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.baseUrl}/product/${id}`);
  }

  createProduct(
    product: Omit<Product, 'id'>
  ): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(
      `${this.baseUrl}/product`,
      product
    );
  }

  updateProduct(
    id: string,
    product: Partial<Product>
  ): Observable<ApiResponse<Product>> {
    return this.http.patch<ApiResponse<Product>>(
      `${this.baseUrl}/product/${id}`,
      product
    );
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/product/${id}`);
  }

  bulkCreateProducts(
    products: Omit<Product, 'id'>[]
  ): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(
      `${this.baseUrl}/product/bulk`,
      { products }
    );
  }

  // Review endpoints
  createReview(reviewData: ReviewData): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(
      `${this.baseUrl}/review`,
      reviewData
    );
  }

  getReviews(): Observable<ApiResponse<Review>> {
    return this.http.get<ApiResponse<Review>>(`${this.baseUrl}/review`);
  }

  getReviewsByProduct(productId: string): Observable<ApiResponse<Review>> {
    return this.http.get<ApiResponse<Review>>(
      `${this.baseUrl}/review/product/${productId}`
    );
  }

  getReviewsByUser(userId: string): Observable<ApiResponse<Review>> {
    return this.http.get<ApiResponse<Review>>(
      `${this.baseUrl}/review/user/${userId}`
    );
  }

  getReview(id: string): Observable<ApiResponse<Review>> {
    return this.http.get<ApiResponse<Review>>(`${this.baseUrl}/review/${id}`);
  }

  updateReview(
    id: string,
    reviewData: Partial<ReviewData>
  ): Observable<ApiResponse<Review>> {
    return this.http.patch<ApiResponse<Review>>(
      `${this.baseUrl}/review/${id}`,
      reviewData
    );
  }

  deleteReview(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/review/${id}`);
  }

  markReviewHelpful(id: string): Observable<ApiResponse<Review>> {
    return this.http.patch<ApiResponse<Review>>(
      `${this.baseUrl}/review/${id}/helpful`,
      {}
    );
  }

  reportReview(id: string): Observable<ApiResponse<Review>> {
    return this.http.patch<ApiResponse<Review>>(
      `${this.baseUrl}/review/${id}/report`,
      {}
    );
  }

  getSuspiciousReviews(): Observable<ApiResponse<Review>> {
    return this.http.get<ApiResponse<Review>>(
      `${this.baseUrl}/review/suspicious`
    );
  }

  updateReviewAnalysis(
    id: string,
    analysisData: any
  ): Observable<ApiResponse<Review>> {
    return this.http.patch<ApiResponse<Review>>(
      `${this.baseUrl}/review/${id}/analysis`,
      { analysisData }
    );
  }
}
