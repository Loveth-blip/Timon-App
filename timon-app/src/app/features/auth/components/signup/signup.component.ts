import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Create an Account</h2>

        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              formControlName="firstName"
              class="form-control"
              [class.is-invalid]="firstName?.invalid && (firstName?.dirty || firstName?.touched)"
            >
            <div *ngIf="firstName?.invalid && (firstName?.dirty || firstName?.touched)" class="error-message">
              <div *ngIf="firstName?.errors?.['required']">First name is required</div>
            </div>
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              formControlName="lastName"
              class="form-control"
              [class.is-invalid]="lastName?.invalid && (lastName?.dirty || lastName?.touched)"
            >
            <div *ngIf="lastName?.invalid && (lastName?.dirty || lastName?.touched)" class="error-message">
              <div *ngIf="lastName?.errors?.['required']">Last name is required</div>
            </div>
          </div>

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

          <button type="submit" class="btn btn-primary" [disabled]="signupForm.invalid || isLoading">
            {{ isLoading ? 'Creating Account...' : 'Sign Up' }}
          </button>

          <div class="auth-links">
            <p>Already have an account? <a routerLink="/auth/login">Login</a></p>
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
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get firstName() { return this.signupForm.get('firstName'); }
  get lastName() { return this.signupForm.get('lastName'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }

  onSubmit() {
    if (this.signupForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { firstName, lastName, email, password } = this.signupForm.value;

    this.authService.signup({ firstName, lastName, email, password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/products']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error);
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.error && error.error.message) {
      return error.error.message;
    }
    
    if (error.status === 409) {
      return 'This email is already in use. Please use a different email or login.';
    }
    
    if (error.status === 400) {
      return 'Please check your input and try again.';
    }
    
    if (error.status === 0) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    
    return 'An error occurred during signup. Please try again.';
  }
}
