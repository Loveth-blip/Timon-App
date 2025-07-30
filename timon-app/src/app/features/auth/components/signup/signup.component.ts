import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FirebaseService } from '../../../../services/firebase.service';

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
            <label for="name">Full Name</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              class="form-control"
              [class.is-invalid]="name?.invalid && (name?.dirty || name?.touched)"
            >
            <div *ngIf="name?.invalid && (name?.dirty || name?.touched)" class="error-message">
              <div *ngIf="name?.errors?.['required']">Name is required</div>
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
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get name() { return this.signupForm.get('name'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }

  onSubmit() {
    if (this.signupForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password } = this.signupForm.value;

    this.firebaseService.signUp(email, password).subscribe({
      next: (result) => {
        // Create user document in Firestore
        const userId = result.user.uid;
        const userData = {
          id: userId,
          name,
          email,
          createdAt: new Date()
        };

        this.firebaseService.addDocument('users', userData).subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/products']);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = 'Failed to create user profile. Please try again.';
            console.error('Error creating user document:', error);
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error.code);
      }
    });
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already in use. Please use a different email or login.';
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/weak-password':
        return 'The password is too weak. Please use a stronger password.';
      default:
        return 'An error occurred during signup. Please try again.';
    }
  }
}
