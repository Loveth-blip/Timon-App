import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../../../../services/firebase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Login to Timon</h2>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              [class.is-invalid]="email?.invalid && (email?.dirty || email?.touched)"
            >
            <div *ngIf="email?.invalid && (email?.dirty || email?.touched)" class="error-message">
              <div *ngIf="email?.errors?.['required']">Email is required</div>
              <div *ngIf="email?.errors?.['email']">Please enter a valid email</div>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-control"
              [class.is-invalid]="password?.invalid && (password?.dirty || password?.touched)"
            >
            <div *ngIf="password?.invalid && (password?.dirty || password?.touched)" class="error-message">
              <div *ngIf="password?.errors?.['required']">Password is required</div>
              <div *ngIf="password?.errors?.['minlength']">Password must be at least 6 characters</div>
            </div>
          </div>

          <div *ngIf="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>

          <div class="auth-links">
            <p>Don't have an account? <a routerLink="/auth/signup">Sign up</a></p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
    }

    .auth-card {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      width: 100%;
      max-width: 450px;
    }

    h2 {
      color: #333;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
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

    .form-control.is-invalid {
      border-color: #d93025;
    }

    .error-message {
      color: #d93025;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .btn {
      padding: 0.75rem 1rem;
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

    .btn:disabled {
      background-color: #a8c7fa;
      cursor: not-allowed;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .alert-danger {
      background-color: #fce8e6;
      color: #d93025;
      border: 1px solid #f5c2c7;
    }

    .auth-links {
      margin-top: 1.5rem;
      text-align: center;
    }

    .auth-links a {
      color: #4285f4;
      text-decoration: none;
    }

    .auth-links a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.firebaseService.signIn(email, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/products']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error.code);
      }
    });
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful login attempts. Please try again later.';
      default:
        return 'An error occurred during login. Please try again.';
    }
  }
}
