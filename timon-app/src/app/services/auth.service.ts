import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService, User, LoginData, SignupData } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService) {
    // Check if user is logged in on app start
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    this.apiService.isLoggedIn().subscribe({
      next: (response) => {
        if (response.status === 'success' && response.data.user) {
          this.currentUserSubject.next(response.data.user);
        } else {
          this.currentUserSubject.next(null);
        }
      },
      error: () => {
        this.currentUserSubject.next(null);
      }
    });
  }

  login(loginData: LoginData): Observable<any> {
    return new Observable(observer => {
      this.apiService.login(loginData).subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data.user) {
            // Store token in localStorage
            if (response.token) {
              localStorage.setItem('authToken', response.token);
            }
            this.currentUserSubject.next(response.data.user);
            observer.next(response);
          } else {
            observer.error('Login failed');
          }
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  signup(signupData: SignupData): Observable<any> {
    return new Observable(observer => {
      this.apiService.signup(signupData).subscribe({
        next: (response) => {
          if (response.status === 'success' && response.data.user) {
            // Store token in localStorage
            if (response.token) {
              localStorage.setItem('authToken', response.token);
            }
            this.currentUserSubject.next(response.data.user);
            observer.next(response);
          } else {
            observer.error('Signup failed');
          }
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  logout(): Observable<any> {
    return new Observable(observer => {
      this.apiService.logout().subscribe({
        next: (response) => {
          // Clear token and user data
          localStorage.removeItem('authToken');
          this.currentUserSubject.next(null);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          // Even if logout fails on server, clear local data
          localStorage.removeItem('authToken');
          this.currentUserSubject.next(null);
          observer.error(error);
        }
      });
    });
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}
