import { Routes } from '@angular/router';

export const LOGIN_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./views/login.page').then((m) => m.LoginPage) },
];

export const IAM_PUBLIC_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', loadComponent: () => import('./views/login.page').then((m) => m.LoginPage) },
  { path: 'recover', data: { mode: 'recover' }, loadComponent: () => import('./views/auth-state.page').then((m) => m.AuthStatePage) },
  { path: 'blocked', data: { mode: 'blocked' }, loadComponent: () => import('./views/auth-state.page').then((m) => m.AuthStatePage) },
  { path: 'forbidden', data: { mode: 'forbidden' }, loadComponent: () => import('./views/auth-state.page').then((m) => m.AuthStatePage) },
];

export const PROFILE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./views/profile.page').then((m) => m.ProfilePage) },
];
