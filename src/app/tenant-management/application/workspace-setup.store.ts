import { Injectable, computed, inject, signal } from '@angular/core';
import { WorkspaceSetup } from '@app/tenant-management/domain/model';
import { TenantManagementApi } from '@app/tenant-management/infrastructure/tenant-management-api';

export interface WorkspaceChecklistItem { key: string; done: boolean; }

@Injectable({ providedIn: 'root' })
export class WorkspaceSetupStore {
  private readonly api = inject(TenantManagementApi);

  readonly loading = signal(true);
  readonly error = signal(false);
  readonly setup = signal<WorkspaceSetup | null>(null);
  readonly checklist = computed<WorkspaceChecklistItem[]>(() => {
    const setup = this.setup();
    if (!setup) return [];
    const preferences = this.preferenceMap(setup);
    return [
      { key: 'companyProfile', done: !!setup.tenant.legalName },
      { key: 'uploadLogo', done: !!preferences['logoUrl'] },
      { key: 'mainWarehouse', done: !!preferences['mainWarehouse'] },
      { key: 'temperatureRanges', done: !!preferences['temperatureRange'] },
      { key: 'firstProducts', done: preferences['firstProducts'] === 'true' },
      { key: 'inviteLogisticsTeam', done: preferences['inviteLogisticsTeam'] === 'true' },
      { key: 'firstDispatch', done: preferences['firstDispatch'] === 'true' },
    ];
  });
  readonly completionPercent = computed(() => {
    const checklist = this.checklist();
    return checklist.length ? Math.round(checklist.filter((item) => item.done).length / checklist.length * 100) : 0;
  });

  load(slug: string): void {
    this.loading.set(true);
    this.error.set(false);
    this.api.workspaceSetup(slug).subscribe({
      next: (setup) => { this.setup.set(setup); this.loading.set(false); },
      error: () => { this.setup.set(null); this.error.set(true); this.loading.set(false); },
    });
  }

  preference(key: string, fallback = ''): string {
    const setup = this.setup();
    return setup ? this.preferenceMap(setup)[key] ?? fallback : fallback;
  }

  private preferenceMap(setup: WorkspaceSetup): Record<string, string> {
    return Object.fromEntries(setup.preferences.map((preference) => [preference.key, preference.value]));
  }
}
