import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../services/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="container">
        <div class="logo">
          <a routerLink="/">Timon Guard</a>
        </div>

        <nav class="nav">
          <ul class="nav-list">
            <li class="nav-item">
              <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
            </li>
            <li class="nav-item">
              <a routerLink="/products" routerLinkActive="active">Products</a>
            </li>
            <ng-container *ngIf="isLoggedIn$ | async; else notLoggedIn">
              <li class="nav-item">
                <a routerLink="/purchases" routerLinkActive="active">My Purchases</a>
              </li>
              <li class="nav-item">
                <a routerLink="/admin" routerLinkActive="active">Admin</a>
              </li>
              <li class="nav-item">
                <a (click)="logout()" class="logout-btn">Logout</a>
              </li>
            </ng-container>
            <ng-template #notLoggedIn>
              <li class="nav-item">
                <a routerLink="/auth/login" routerLinkActive="active">Login</a>
              </li>
              <li class="nav-item">
                <a routerLink="/auth/signup" routerLinkActive="active">Sign Up</a>
              </li>
            </ng-template>
          </ul>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background-color: #fff;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo a {
      font-size: 1.8rem;
      font-weight: bold;
      color: #4285f4;
      text-decoration: none;
    }

    .nav-list {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      margin-left: 2rem;
    }

    .nav-item a {
      color: #333;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 0;
      transition: color 0.3s ease;
      cursor: pointer;
    }

    .nav-item a:hover, .nav-item a.active {
      color: #4285f4;
    }

    .logout-btn {
      color: #d93025 !important;
    }

    @media (max-width: 768px) {
      .container {
        flex-direction: column;
        padding: 1rem;
      }

      .nav {
        margin-top: 1rem;
        width: 100%;
      }

      .nav-list {
        flex-wrap: wrap;
        justify-content: center;
      }

      .nav-item {
        margin: 0.5rem 1rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  isLoggedIn$: Observable<boolean>;

  constructor(private authService: AuthService) {
    this.isLoggedIn$ = this.authService.currentUser$.pipe(
      map(user => !!user)
    );
  }

  ngOnInit(): void {}

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logged out successfully');
      },
      error: (error) => {
        console.error('Error during logout:', error);
      }
    });
  }
}
