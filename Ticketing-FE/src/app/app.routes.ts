import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard.js';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component.js').then(m => m.LoginComponent)
    // Temporarily removed guard to test: canActivate: [guestGuard]
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.routes.js').then(m => m.HOME_ROUTES)
    // Temporarily removed guard to test: canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
