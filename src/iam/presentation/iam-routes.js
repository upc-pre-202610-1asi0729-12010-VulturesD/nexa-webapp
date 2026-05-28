export const iamRoutes = {
  path: '/auth',
  component: () => import('@/iam/presentation/views/auth-layout.vue'),
  children: [
    { path: 'login', name: 'auth.login', component: () => import('@/iam/presentation/views/login-view.vue') },
    { path: 'recover', name: 'auth.recover', component: () => import('@/iam/presentation/views/recover-view.vue') },
    { path: 'blocked', name: 'auth.blocked', component: () => import('@/iam/presentation/views/blocked-view.vue') },
    { path: 'forbidden', name: 'auth.forbidden', component: () => import('@/iam/presentation/views/forbidden-view.vue') },
  ],
};
