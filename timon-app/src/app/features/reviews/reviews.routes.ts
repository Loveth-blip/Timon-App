import { Routes } from '@angular/router';

export const REVIEWS_ROUTES: Routes = [
  {
    path: 'product/:productId',
    loadComponent: () => import('./components/review-list/review-list.component').then(m => m.ReviewListComponent)
  },
  {
    path: 'create/:productId',
    loadComponent: () => import('./components/review-form/review-form.component').then(m => m.ReviewFormComponent)
  }
];
