import { Component, computed, inject } from '@angular/core';
import { IamStore } from '@app/iam/application/iam.store';
import { WorkspaceSetupStore } from '@app/tenant-management/application/workspace-setup.store';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';
import { I18nService } from '@app/shared/presentation/services/i18n.service';

const SEGMENTS = [
  { key: 'catalog', icon: 'pi-box' },
  { key: 'sales', icon: 'pi-inbox' },
  { key: 'warehouse', icon: 'pi-database' },
  { key: 'logistics', icon: 'pi-send' },
  { key: 'invoicing', icon: 'pi-file-check' },
];

@Component({
  selector: 'nx-workspace-setup',
  imports: [TranslatePipe, NexaIconComponent],
  template: `
    @if (loading()) {
      <div class="flow-panel flow-panel-pad" aria-live="polite"><div class="skeleton" style="height:32px;margin-bottom:12px"></div><div class="skeleton" style="height:16px;width:70%"></div></div>
    } @else if (error() || !setup()) {
      <div class="banner banner-danger" role="alert"><nx-icon name="pi-exclamation-triangle"></nx-icon><span>{{ 'tenant.workspace.loadError' | t }}</span></div>
    } @else if (setup(); as data) {
      <section class="workspace-setup-page">
        <header class="workspace-setup-header">
          <div><span>{{ 'tenant.workspace.eyebrow' | t }}</span><h1>{{ 'tenant.workspace.title' | t }}</h1><p>{{ 'tenant.workspace.subtitle' | t }}</p></div>
          <div class="status-pill">{{ data.tenant.status }}</div>
        </header>
        <div class="workspace-grid">
          <section class="tm-card branding-card"><div class="brand-mark">{{ initials() }}</div><div><span>{{ 'tenant.workspace.profile' | t }}</span><h2>{{ data.tenant.name }}</h2><p>{{ data.workspace.url }} · {{ data.tenant.plan }} · {{ data.tenant.status }}</p></div></section>
          <section class="tm-card"><h3>{{ 'tenant.workspace.operationalSetup' | t }}</h3><div class="setup-grid"><div><span>{{ 'tenant.workspace.mainWarehouse' | t }}</span><strong>{{ preference('mainWarehouse', notConfigured()) }}</strong></div><div><span>{{ 'tenant.workspace.coldRooms' | t }}</span><strong>{{ preference('coldRooms','0') }}</strong></div><div><span>{{ 'tenant.workspace.temperatureRange' | t }}</span><strong>{{ preference('temperatureRange', notConfigured()) }}</strong></div><div><span>{{ 'tenant.workspace.inventoryLotPolicy' | t }}</span><strong>{{ preference('inventoryLotPolicy', notConfigured()) }}</strong></div><div><span>FEFO</span><strong>{{ booleanPreference('fefoEnabled') }}</strong></div><div><span>{{ 'tenant.workspace.temperatureAlerts' | t }}</span><strong>{{ booleanPreference('temperatureAlertsEnabled') }}</strong></div><div><span>{{ 'tenant.workspace.dispatchTracking' | t }}</span><strong>{{ booleanPreference('dispatchTrackingEnabled') }}</strong></div></div></section>
          <section class="tm-card"><div class="section-head"><h3>{{ 'tenant.workspace.onboarding' | t }}</h3><strong>{{ completionPercent() }}%</strong></div><ul class="checklist">@for (item of checklist(); track item.key) { <li [class.done]="item.done"><nx-icon [name]="item.done ? 'pi-check-circle' : 'pi-circle'"></nx-icon>{{ ('tenant.workspace.checklist.' + item.key) | t }}</li> }</ul></section>
          <section class="tm-card"><h3>{{ 'tenant.workspace.capabilities' | t }}</h3><div class="cap-list">@for (capability of enabledCapabilities(); track capability.code) { <span>{{ ('tenant.capabilities.' + normalizedCapability(capability.code)) | t }}</span> } @empty { <p>{{ 'tenant.workspace.noCapabilities' | t }}</p> }</div></section>
        </div>
        <section class="tm-card segment-section"><h3>{{ 'tenant.workspace.segmentConnections' | t }}</h3><div class="segment-grid">@for (segment of segments; track segment.key) { <article><nx-icon [name]="segment.icon"></nx-icon><strong>{{ ('tenant.workspace.segments.' + segment.key + '.title') | t }}</strong><p>{{ ('tenant.workspace.segments.' + segment.key + '.desc') | t }}</p></article> }</div></section>
      </section>
    }
  `,
  styles: [`
    .workspace-setup-page { display:grid; gap:22px; }
    .workspace-setup-header { display:flex; justify-content:space-between; gap:18px; align-items:flex-start; padding:26px; border-radius:20px; background:linear-gradient(135deg,#0f3f91,#155cbb); color:white; }
    .workspace-setup-header span { font-size:12px; font-weight:800; text-transform:uppercase; opacity:.78; } .workspace-setup-header h1 { margin:8px 0; font-size:30px; line-height:1.12; } .workspace-setup-header p { margin:0; max-width:680px; color:rgba(255,255,255,.78); line-height:1.6; }
    .status-pill { padding:8px 12px; border:1px solid rgba(255,255,255,.22); border-radius:999px; background:rgba(255,255,255,.10); font-size:12px; font-weight:800; }
    .workspace-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; } .tm-card { border:1px solid #e2e8f0; border-radius:18px; background:#fff; padding:18px; box-shadow:0 12px 26px rgba(15,23,42,.05); }
    .branding-card { display:flex; align-items:center; gap:14px; } .brand-mark { width:54px; height:54px; display:flex; align-items:center; justify-content:center; border-radius:16px; background:#1d4ed8; color:white; font-weight:800; } .tm-card h2,.tm-card h3 { margin:0 0 12px; color:#0f172a; } .tm-card span { color:#64748b; font-size:12px; } .tm-card p { margin:4px 0 0; color:#475569; font-size:13px; }
    .setup-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; } .setup-grid div { padding:11px; border-radius:12px; background:#f8fafc; border:1px solid #e2e8f0; } .setup-grid strong { display:block; color:#0f172a; font-size:13px; margin-top:4px; }
    .section-head { display:flex; justify-content:space-between; align-items:center; } .checklist { list-style:none; padding:0; margin:0; display:grid; gap:9px; } .checklist li { display:flex; gap:8px; align-items:center; color:#475569; font-size:13px; } .checklist li.done { color:#166534; font-weight:700; }
    .cap-list { display:flex; flex-wrap:wrap; gap:8px; } .cap-list span { padding:6px 10px; border-radius:999px; background:#eff6ff; color:#1d4ed8; font-weight:700; }
    .segment-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:12px; } .segment-grid article { padding:14px; border:1px solid #e2e8f0; border-radius:14px; background:#f8fafc; } .segment-grid nx-icon { color:#1d4ed8; margin-bottom:10px; } .segment-grid strong { display:block; color:#0f172a; font-size:13px; margin-bottom:5px; }
    @media (max-width:1100px) { .segment-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } } @media (max-width:760px) { .workspace-setup-header { flex-direction:column; } .workspace-grid,.setup-grid,.segment-grid { grid-template-columns:1fr; } }
  `],
})
export class WorkspaceSetupPage {
  private readonly store = inject(WorkspaceSetupStore);
  private readonly session = inject(IamStore);
  private readonly i18n = inject(I18nService);
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly setup = this.store.setup;
  readonly checklist = this.store.checklist;
  readonly completionPercent = this.store.completionPercent;
  readonly segments = SEGMENTS;
  readonly enabledCapabilities = computed(() => this.setup()?.capabilities.filter((feature) => feature.enabled) ?? []);

  constructor() { this.store.load(this.session.user()?.workspaceSlug || 'icisa'); }
  preference(key: string, fallback = ''): string { return this.store.preference(key, fallback); }
  booleanPreference(key: string): string { return this.i18n.t(this.store.preference(key) === 'true' ? 'common.yes' : 'common.no'); }
  notConfigured(): string { return this.i18n.t('tenant.workspace.notConfigured'); }
  initials(): string { return (this.setup()?.tenant.name || 'NX').slice(0, 2).toUpperCase(); }
  normalizedCapability(code: string): string { return code.replaceAll('_', '-'); }
}
