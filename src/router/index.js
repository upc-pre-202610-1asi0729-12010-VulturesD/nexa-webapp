import { createRouter, createWebHashHistory } from 'vue-router';
import { opsRoutes, portalRoutes } from '@/app/presentation/app-routes';
import { iamRoutes } from '@/iam/presentation/iam.routes';
import { useAuthStore } from '@/iam/application/iam.store';

const routes = [
  { path: '/', redirect: '/auth/login' },
  iamRoutes,
  opsRoutes,
  portalRoutes,
  { path: '/:pathMatch(.*)*', redirect: '/auth/login' },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() { return { top: 0 }; },
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  const requiresAuth = to.matched.some(r => r.meta.requiresAuth);
  const requiredScope = to.matched.find(r => r.meta.scope)?.meta.scope;

  if (requiresAuth && !auth.isAuthenticated) {
    return { name: 'auth.login' };
  }
  if (requiresAuth && requiredScope && auth.scope !== requiredScope) {
    return { name: 'auth.forbidden', query: { from: to.fullPath, required: requiredScope } };
  }
  const rolesRecord = to.matched.find(r => r.meta.roles);
  if (rolesRecord && auth.isAuthenticated) {
    const userRole = auth.user?.roleKey || 'commercial';
    if (!rolesRecord.meta.roles.includes(userRole)) {
      return userRole === 'logistics'
        ? { path: '/ops/operations/dashboard' }
        : { path: '/ops/commercial/dashboard' };
    }
  }
});

export default router;
