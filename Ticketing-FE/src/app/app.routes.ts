import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard.js';
import { TicketListResolver } from './resolvers/ticket-list.resolver.js';
import { TicketFormResolver } from './resolvers/ticket-form.resolver.js';

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
    path: 'tickets',
    children: [
      {
        path: 'list',
        loadComponent: () => import('./ticket-list/ticket-list.component.js').then(m => m.TicketListComponent),
        resolve: {
          tickets: TicketListResolver
        }
        // canActivate: [authGuard]
      },
      {
        path: 'form',
        loadComponent: () => import('./ticket-form/ticket-form.component.js').then(m => m.TicketFormComponent),
        resolve: {
          formData: TicketFormResolver
        }
        // canActivate: [authGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
