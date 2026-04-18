import { Component, Input } from '@angular/core';

@Component({
  selector: 'nx-status',
  standalone: true,
  template: `<span class="badge {{ cls }}">{{ label || status }}</span>`,
})
export class StatusBadgeComponent {
  @Input() status = '';
  @Input() label = '';
  @Input() variant: 'status' | 'priority' = 'status';

  get cls(): string {
    const s = (this.status || '').toLowerCase().replace(/[_\s]/g, '-');
    if (this.variant === 'priority') {
      if (s === 'high') return 'badge-priority-high';
      if (s === 'medium') return 'badge-priority-medium';
      return 'badge-priority-low';
    }
    if (['active', 'ok', 'delivered', 'completed', 'available', 'paid', 'success', 'confirmed'].includes(s)) return 'badge-green';
    if (['pending', 'warn', 'warning', 'low', 'reserved', 'preparing', 'validating'].includes(s)) return 'badge-amber';
    if (['alert', 'ready'].includes(s)) return 'badge-orange';
    if (['canceled', 'cancelled', 'expired', 'danger', 'blocked', 'rejected'].includes(s)) return 'badge-red';
    if (['in-transit', 'in_transit', 'dispatched', 'info', 'transit', 'shipped'].includes(s)) return 'badge-blue';
    return 'badge-gray';
  }
}
