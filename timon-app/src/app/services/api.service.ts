import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { Review, ReviewData } from '../models/review.model';
import { Purchase } from '../models/purchase.model';

export interface ApiResponse<T> {
  status: string;
  results?: number;
  data: {
    products?: T[];
    product?: T;
    reviews?: T[];
    review?: T;
    user?: T;
    purchases?: T[];
    purchase?: T;
  };
}

export interface PurchaseWithProductResponse {
  status: string;
  results?: number;
  data: {
    purchases?: (Purchase & { product?: Product })[];
    purchase?: Purchase;
    product?: Product;
  };
}

export interface PurchaseWithProductData {
  purchase: Purchase;
  product: Product;
}

export interface PurchaseListResponse {
  status: string;
  results?: number;
  data: {
    purchases: (Purchase & { product?: Product })[];
  };
}

export interface PurchaseDetailResponse {
  status: string;
  data: {
    purchase: Purchase;
    product: Product;
  };
}

export interface AuthResponse {
  status: string;
  token?: string;
  data: {
    user?: any;
  };
}

export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  active?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface PurchaseData {
  userId: string;
  productId: string;
  amount: number;
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  // Authentication endpoints
  login(loginData: LoginData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/user/login`,
      loginData
    );
  }

  signup(signupData: SignupData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/user/signup`,
      signupData
    );
  }

  isLoggedIn(): Observable<AuthResponse> {
    let options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getToken() || ''}`,
      }),
    };

    return this.http.get<AuthResponse>(
      `${this.baseUrl}/user/isLoggedIn`,
      options
    );
  }

  logout(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.baseUrl}/user/logout`);
  }

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

  // Purchase endpoints
  createPurchase(
    purchaseData: PurchaseData
  ): Observable<ApiResponse<Purchase>> {
    return this.http.post<ApiResponse<Purchase>>(
      `${this.baseUrl}/purchase`,
      purchaseData
    );
  }

  getPurchases(): Observable<ApiResponse<Purchase>> {
    return this.http.get<ApiResponse<Purchase>>(`${this.baseUrl}/purchase`);
  }

  getUserPurchases(userId: string): Observable<ApiResponse<Purchase>> {
    return this.http.get<ApiResponse<Purchase>>(
      `${this.baseUrl}/purchase/user/${userId}`
    );
  }

  getUserPurchasesWithProducts(
    userId: string
  ): Observable<PurchaseListResponse> {
    return this.http.get<PurchaseListResponse>(
      `${this.baseUrl}/purchase/user/${userId}/with-products`
    );
  }

  getPurchase(id: string): Observable<ApiResponse<Purchase>> {
    return this.http.get<ApiResponse<Purchase>>(
      `${this.baseUrl}/purchase/${id}`
    );
  }

  getPurchaseWithProduct(id: string): Observable<PurchaseDetailResponse> {
    return this.http.get<PurchaseDetailResponse>(
      `${this.baseUrl}/purchase/${id}/with-product`
    );
  }

  updatePurchase(
    id: string,
    purchaseData: Partial<PurchaseData>
  ): Observable<ApiResponse<Purchase>> {
    return this.http.patch<ApiResponse<Purchase>>(
      `${this.baseUrl}/purchase/${id}`,
      purchaseData
    );
  }

  deletePurchase(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/purchase/${id}`
    );
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
