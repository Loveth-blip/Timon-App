import { Routes } from '@angular/router';
import { AdminProductListComponent } from './components/product-list/product-list.component';
import { ProductFormComponent } from './components/product-form/product-form.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'products',
    component: AdminProductListComponent
  },
  {
    path: 'products/new',
    component: ProductFormComponent
  },
  {
    path: 'products/edit/:id',
    component: ProductFormComponent
  },
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  }
];
