import { Component, Input } from '@angular/core';

@Component({
  selector: 'nx-icon',
  standalone: true,
  template: `<i [class]="'pi ' + name" aria-hidden="true"></i>`,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--nexa-icon-box, 18px);
      height: var(--nexa-icon-box, 18px);
      flex-shrink: 0;
      line-height: 1;
    }
    .pi {
      font-size: var(--nexa-icon-size, 15px);
      line-height: 1;
    }
  `],
})
export class NexaIconComponent {
  @Input({ required: true }) name = '';
}
