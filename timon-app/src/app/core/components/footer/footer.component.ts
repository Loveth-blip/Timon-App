import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>Timon Guard</h3>
            <p>Behavioral and Linguistic Review Analyzer</p>
          </div>

          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul class="footer-links">
              <li><a routerLink="/">Home</a></li>
              <li><a routerLink="/products">Products</a></li>
              <li><a routerLink="/auth/login">Login</a></li>
              <li><a routerLink="/auth/signup">Sign Up</a></li>
            </ul>
          </div>

          <div class="footer-section">
            <h4>About</h4>
            <p>Timon Guard enhances review authenticity by combining behavioral biometrics and linguistic forensics.</p>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2025 Timon Guard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: #f8f9fa;
      padding: 3rem 0 1.5rem;
      margin-top: 4rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .footer-section h3 {
      color: #4285f4;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .footer-section h4 {
      color: #333;
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }

    .footer-section p {
      color: #666;
      line-height: 1.6;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 0.5rem;
    }

    .footer-links a {
      color: #666;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-links a:hover {
      color: #4285f4;
    }

    .footer-bottom {
      border-top: 1px solid #ddd;
      padding-top: 1.5rem;
      text-align: center;
      color: #666;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .footer-section {
        margin-bottom: 1.5rem;
      }
    }
  `]
})
export class FooterComponent {}
