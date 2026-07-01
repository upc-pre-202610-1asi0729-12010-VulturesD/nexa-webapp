import { Component, inject } from '@angular/core';
import { IamStore } from '@app/iam/application/iam.store';
import { WorkspaceSetupStore } from '@app/tenant-management/application/workspace-setup.store';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';

@Component({
  selector: 'nx-workspace-profile',
  imports: [TranslatePipe],
  template: `
    <section class="tm-card">
      <h1>{{ 'tenant.workspace.profile' | t }}</h1>
      <p>{{ 'tenant.workspace.subtitle' | t }}</p>
      @if (setup(); as data) { <dl><div><dt>{{ 'tenant.workspace.tenantName' | t }}</dt><dd>{{ data.tenant.name }}</dd></div><div><dt>{{ 'tenant.workspace.workspaceName' | t }}</dt><dd>{{ data.workspace.name }}</dd></div><div><dt>{{ 'tenant.workspace.workspaceUrl' | t }}</dt><dd>{{ data.workspace.url }}</dd></div><div><dt>{{ 'tenant.workspace.status' | t }}</dt><dd>{{ data.workspace.status }}</dd></div></dl> }
    </section>
  `,
  styles: [`.tm-card{border:1px solid #e2e8f0;border-radius:18px;background:#fff;padding:22px}.tm-card h1{margin:0 0 8px;color:#0f172a}.tm-card p{color:#64748b}dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:20px}dl div{padding:12px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc}dt{color:#64748b;font-size:12px}dd{margin:5px 0 0;color:#0f172a;font-weight:700;overflow-wrap:anywhere}@media(max-width:640px){dl{grid-template-columns:1fr}}`],
})
export class WorkspaceProfilePage {
  private readonly store = inject(WorkspaceSetupStore);
  private readonly session = inject(IamStore);
  readonly setup = this.store.setup;
  constructor() { if (!this.setup()) this.store.load(this.session.user()?.workspaceSlug || 'icisa'); }
}
