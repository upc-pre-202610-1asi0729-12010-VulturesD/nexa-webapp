export const iamRoutes = {
  path: '/auth',
  component: () => import('@/iam/presentation/views/AuthLayout.vue'),
  children: [
    { path: 'login', name: 'auth.login', component: () => import('@/iam/presentation/views/LoginView.vue') },
    { path: 'recover', name: 'auth.recover', component: () => import('@/iam/presentation/views/RecoverView.vue') },
    { path: 'blocked', name: 'auth.blocked', component: () => import('@/iam/presentation/views/BlockedView.vue') },
    { path: 'forbidden', name: 'auth.forbidden', component: () => import('@/iam/presentation/views/ForbiddenView.vue') },
  ],
};
