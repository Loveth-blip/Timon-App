import { Routes } from '@angular/router';
import { LayoutComponent } from './core/components/layout/layout.component';
import { HomeComponent } from './core/components/home/home.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { SignupComponent } from './features/auth/components/signup/signup.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      {
        path: 'auth',
        children: [
          { path: 'login', component: LoginComponent },
          { path: 'signup', component: SignupComponent }
        ]
      },
      {
        path: 'products',
        loadChildren: () => import('./features/products/products.routes').then(m => m.PRODUCTS_ROUTES)
      },
      {
        path: 'reviews',
        loadChildren: () => import('./features/reviews/reviews.routes').then(m => m.REVIEWS_ROUTES)
      },
      {
        path: 'purchases',
        loadChildren: () => import('./features/purchases/purchases.routes').then(m => m.PURCHASES_ROUTES)
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
