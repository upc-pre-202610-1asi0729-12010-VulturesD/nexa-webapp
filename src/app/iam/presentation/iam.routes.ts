import { Routes } from '@angular/router';

export const LOGIN_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./views/login.page').then((m) => m.LoginPage) },
];

export const PROFILE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./views/profile.page').then((m) => m.ProfilePage) },
];
