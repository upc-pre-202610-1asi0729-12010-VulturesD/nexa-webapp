import { Component, Input } from '@angular/core';

@Component({
  selector: 'nx-page-header',
  standalone: true,
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ title }}</h1>
        @if (subtitle) { <div class="page-subtitle">{{ subtitle }}</div> }
      </div>
      <div class="page-header-actions"><ng-content /></div>
    </div>
  `,
  styles: [`.page-header-actions { display: flex; gap: 8px; align-items: center; }`],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
