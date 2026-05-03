export const purchaseOrdersRoutes = [
  { path: 'orders', name: 'ops.orders', component: () => import('@/purchase-orders/presentation/views/OrdersView.vue') },
  { path: 'orders/new', name: 'ops.orders.new', component: () => import('@/purchase-orders/presentation/views/CreateOrderView.vue') },
  { path: 'orders/:id', name: 'ops.orders.detail', component: () => import('@/purchase-orders/presentation/views/OrderDetailView.vue') },
];
