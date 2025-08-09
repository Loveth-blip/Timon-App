import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <h1>Welcome to Timon Guard</h1>
        <p class="subtitle">Behavioral and Linguistic Review Analyzer</p>
        <p class="description">
          Enhancing review authenticity by combining behavioral biometrics and linguistic forensics.
        </p>
        <div class="cta-buttons">
          <a routerLink="/products" class="btn btn-primary">Browse Products</a>
          <a routerLink="/auth/login" class="btn btn-secondary">Sign In</a>
        </div>
      </div>

      <div class="features-section">
        <h2>How It Works</h2>
        <div class="features-grid">
          <div class="feature-card">
            <h3>Behavioral Biometrics</h3>
            <p>We analyze typing patterns, mouse movements, and other behavioral signals to verify authenticity.</p>
          </div>
          <div class="feature-card">
            <h3>Linguistic Forensics</h3>
            <p>Our AI detects patterns in text that distinguish between human-written and AI-generated content.</p>
          </div>
          <div class="feature-card">
            <h3>Combined Analysis</h3>
            <p>By merging behavioral and linguistic signals, we provide a comprehensive authenticity score.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .hero-section {
      text-align: center;
      padding: 4rem 1rem;
      margin-bottom: 3rem;
    }

    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #333;
    }

    .subtitle {
      font-size: 1.5rem;
      color: #666;
      margin-bottom: 1.5rem;
    }

    .description {
      font-size: 1.2rem;
      max-width: 800px;
      margin: 0 auto 2rem;
      line-height: 1.6;
    }

    .cta-buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.8rem 1.5rem;
      border-radius: 4px;
      font-weight: bold;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background-color: #4285f4;
      color: white;
    }

    .btn-secondary {
      background-color: #f1f3f4;
      color: #4285f4;
    }

    .features-section {
      padding: 3rem 1rem;
    }

    h2 {
      text-align: center;
      margin-bottom: 3rem;
      font-size: 2rem;
      color: #333;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background-color: #f8f9fa;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    h3 {
      margin-bottom: 1rem;
      color: #4285f4;
    }
  `]
})
export class HomeComponent {}
