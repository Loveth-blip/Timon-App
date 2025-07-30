import { Routes } from '@angular/router';

export const PURCHASES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/purchase-list/purchase-list.component').then(m => m.PurchaseListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/purchase-detail/purchase-detail.component').then(m => m.PurchaseDetailComponent)
  },
  {
    path: 'checkout/:productId',
    loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent)
  }
];
