import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'applications/new',
        loadComponent: () =>
          import('./features/merchant-form/merchant-form.component').then(m => m.MerchantFormComponent),
        data: { roles: ['SALES'] },
        canActivate: [authGuard],
      },
      {
        path: 'applications/:id/edit',
        loadComponent: () =>
          import('./features/merchant-form/merchant-form.component').then(m => m.MerchantFormComponent),
        data: { roles: ['SALES'] },
        canActivate: [authGuard],
      },
      {
        path: 'applications/:id',
        loadComponent: () =>
          import('./features/application-detail/application-detail.component').then(
            m => m.ApplicationDetailComponent
          ),
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./features/admin/admin.component').then(m => m.AdminComponent),
        data: { roles: ['ADMIN'] },
        canActivate: [authGuard],
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
