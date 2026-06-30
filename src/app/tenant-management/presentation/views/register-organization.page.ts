import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { OrganizationRegistrationStore, RegistrationSection } from '@app/tenant-management/application/organization-registration.store';
import { I18nService, Lang } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { NexaIconComponent } from '@app/shared/presentation/icons/nexa-icon.component';

@Component({
  selector: 'nx-register-organization',
  imports: [CommonModule, MatButtonModule, MatCheckboxModule, MatInputModule, MatSelectModule, TranslatePipe, NexaIconComponent],
  template: `
    <div class="auth-page tenant-auth-page">
      <div class="auth-wrap tenant-auth-wrap">
        <aside class="auth-left">
          <div class="auth-left-content">
            <div class="auth-logo"><img src="assets/img/nexa.svg" alt="Nexa" /></div>
            <div class="auth-tagline">{{ 'auth.tagline' | t }}</div>
            <div class="auth-desc">{{ 'auth.desc' | t }}</div>
            <div class="auth-pills" [attr.aria-label]="'tenant.registration.eyebrow' | t">
              <span class="auth-pill">{{ 'auth.pillCatalog' | t }}</span>
              <span class="auth-pill">{{ 'auth.pillStock' | t }}</span>
              <span class="auth-pill">{{ 'auth.pillOrder' | t }}</span>
              <span class="auth-pill">{{ 'auth.pillDelivery' | t }}</span>
            </div>
          </div>
          <div class="auth-footer-left"><span>{{ 'auth.rights' | t }}</span></div>
        </aside>

        <main class="auth-right tenant-register-right">
          <div class="register-toolbar">
            <button type="button" class="back-login" (click)="back()"><nx-icon name="pi-arrow-left"></nx-icon>{{ 'tenant.registration.backLogin' | t }}</button>
            <div class="lang-selector" role="group" [attr.aria-label]="'common.language' | t">
              <button type="button" class="lang-opt" [class.active]="lang() === 'es'" [attr.aria-pressed]="lang() === 'es'" (click)="setLang('es')">ES</button>
              <button type="button" class="lang-opt" [class.active]="lang() === 'en'" [attr.aria-pressed]="lang() === 'en'" (click)="setLang('en')">EN</button>
            </div>
          </div>

          <section class="tenant-register-page">
            <div class="auth-form-title">{{ 'tenant.registration.title' | t }}</div>
            <div class="auth-form-sub">{{ 'tenant.registration.subtitle' | t }}</div>
            <div class="tenant-register-note"><nx-icon name="pi-info-circle"></nx-icon><span>{{ 'tenant.registration.note' | t }}</span></div>

            <form class="tenant-register-panel" (submit)="submit($event)" novalidate>
              <ol class="tm-stepper" [attr.aria-label]="'tenant.registration.progress' | t">
                @for (step of steps; track step; let index = $index) {
                  <li [class.active]="index === currentStep()" [class.done]="index < currentStep()" [attr.aria-current]="index === currentStep() ? 'step' : null">
                    <span>{{ index < currentStep() ? '✓' : index + 1 }}</span>
                    <strong>{{ ('tenant.registration.steps.' + step) | t }}</strong>
                  </li>
                }
              </ol>

              @if (currentStep() === 0) {
                <div class="tm-fields">
                  <div class="tm-field"><label for="legal-name">{{ 'tenant.registration.fields.legalName' | t }}</label><input id="legal-name" matInput [value]="form().company.legalName" [attr.aria-describedby]="error('legalName') ? 'legal-name-error' : null" (input)="input('company','legalName',$event)" /><small id="legal-name-error" class="field-error">{{ error('legalName') | t }}</small></div>
                  <div class="tm-field"><label for="trade-name">{{ 'tenant.registration.fields.tradeName' | t }}</label><input id="trade-name" matInput [value]="form().company.tradeName" (input)="input('company','tradeName',$event)" /></div>
                  <div class="tm-field"><label for="tax-id">{{ 'tenant.registration.fields.taxId' | t }}</label><input id="tax-id" matInput inputmode="numeric" maxlength="14" [value]="form().company.taxId" (input)="input('company','taxId',$event)" /><small class="hint">{{ 'tenant.registration.rucHelp' | t }}</small><small class="field-error">{{ error('taxId') | t }}</small></div>
                  <div class="tm-field"><label>{{ 'tenant.registration.fields.industrySector' | t }}</label><mat-select [value]="form().company.industrySector" (selectionChange)="value('company','industrySector',$event.value)">@for (item of options.industrySectors; track item) { <mat-option [value]="item">{{ ('tenant.registration.options.' + item) | t }}</mat-option> }</mat-select><small class="field-error">{{ error('industrySector') | t }}</small></div>
                  <div class="tm-field span-2 company-size-slider"><label for="company-members">{{ 'tenant.registration.fields.companySize' | t }}</label><div class="slider-head"><strong>{{ form().company.companyMemberCount }} {{ 'tenant.registration.members' | t }}</strong><span>{{ ('tenant.registration.options.' + form().company.companySize) | t }}</span></div><input id="company-members" type="range" min="1" max="100" step="1" [value]="form().company.companyMemberCount" (input)="number('company','companyMemberCount',$event)" /><div class="slider-marks"><span>1</span><span>25</span><span>50</span><span>75</span><span>100 max</span></div><small class="hint">{{ 'tenant.registration.companySizeHelp' | t }}</small><small class="field-error">{{ error('companyMemberCount') | t }}</small></div>
                  <div class="tm-field"><label>{{ 'tenant.registration.fields.country' | t }}</label><mat-select [value]="form().company.country" (selectionChange)="value('company','country',$event.value)">@for (item of options.countries; track item) { <mat-option [value]="item">{{ ('tenant.registration.options.' + item) | t }}</mat-option> }</mat-select><small class="field-error">{{ error('country') | t }}</small></div>
                  <div class="tm-field"><label for="website">{{ 'tenant.registration.fields.website' | t }}</label><input id="website" matInput type="url" [value]="form().company.website" placeholder="https://empresa.pe" (input)="input('company','website',$event)" /><small class="hint">{{ 'tenant.registration.websiteHelp' | t }}</small><small class="field-error">{{ error('website') | t }}</small></div>
                  <div class="tm-field span-2 logo-field"><label for="logo-preview">{{ 'tenant.registration.fields.logo' | t }}</label><div class="logo-preview">@if (form().company.logoPreview) { <img [src]="form().company.logoPreview" [alt]="'tenant.registration.logoPlaceholder' | t" /> } @else { <nx-icon name="pi-image"></nx-icon><span>{{ 'tenant.registration.logoPlaceholder' | t }}</span> }</div><input id="logo-preview" type="file" accept="image/png,image/jpeg" (change)="logo($event)" /><small class="hint">{{ 'tenant.registration.logoHelp' | t }}</small><small class="field-error">{{ error('logoPreview') | t }}</small></div>
                </div>
              } @else if (currentStep() === 1) {
                <div class="tm-fields">
                  <div class="tm-field"><label>{{ 'tenant.registration.fields.operationType' | t }}</label><mat-select [value]="form().operation.operationType" (selectionChange)="value('operation','operationType',$event.value)">@for (item of options.operationTypes; track item) { <mat-option [value]="item">{{ ('tenant.registration.options.' + item) | t }}</mat-option> }</mat-select><small class="field-error">{{ error('operationType') | t }}</small></div>
                  <div class="tm-field"><label>{{ 'tenant.registration.fields.monthlyVolume' | t }}</label><mat-select [value]="form().operation.monthlyVolume" (selectionChange)="value('operation','monthlyVolume',$event.value)">@for (item of options.volumeRanges; track item) { <mat-option [value]="item">{{ ('tenant.registration.options.' + item) | t }}</mat-option> }</mat-select><small class="field-error">{{ error('monthlyVolume') | t }}</small></div>
                  <div class="tm-field"><label>{{ 'tenant.registration.fields.deliveryCoverage' | t }}</label><mat-select [value]="form().operation.deliveryCoverage" (selectionChange)="value('operation','deliveryCoverage',$event.value)">@for (item of options.deliveryCoverages; track item) { <mat-option [value]="item">{{ ('tenant.registration.options.' + item) | t }}</mat-option> }</mat-select><small class="field-error">{{ error('deliveryCoverage') | t }}</small></div>
                  <div class="tm-field"><label for="min-temp">{{ 'tenant.registration.fields.minTemperature' | t }}</label><div class="tm-input-suffix"><input id="min-temp" matInput type="number" min="-30" max="20" [value]="form().operation.minTemperature ?? ''" (input)="nullableNumber('operation','minTemperature',$event)" /><span>°C</span></div></div>
                  <div class="tm-field"><label for="max-temp">{{ 'tenant.registration.fields.maxTemperature' | t }}</label><div class="tm-input-suffix"><input id="max-temp" matInput type="number" min="-30" max="20" [value]="form().operation.maxTemperature ?? ''" (input)="nullableNumber('operation','maxTemperature',$event)" /><span>°C</span></div><small class="field-error">{{ error('temperatureRange') | t }}</small></div>
                  <div class="tm-field span-2"><label>{{ 'tenant.registration.fields.productCategories' | t }}</label><small class="hint">{{ 'tenant.registration.categoryHelp' | t }}</small><div class="tm-category-grid">@for (item of options.productCategories; track item) { <mat-checkbox [checked]="form().operation.productCategories.includes(item)" (change)="category(item,$event.checked)">{{ ('tenant.registration.options.' + item) | t }}</mat-checkbox> }</div><small class="field-error">{{ error('productCategories') | t }}</small></div>
                  <div class="tm-field span-2 tm-toggle-grid"><mat-checkbox [checked]="form().operation.refrigeratedStorage" (change)="value('operation','refrigeratedStorage',$event.checked)">{{ 'tenant.registration.fields.refrigeratedStorage' | t }}</mat-checkbox><mat-checkbox [checked]="form().operation.requiresTraceability" (change)="value('operation','requiresTraceability',$event.checked)">{{ 'tenant.registration.fields.requiresTraceability' | t }}</mat-checkbox><mat-checkbox [checked]="form().operation.requiresTemperatureAlerts" (change)="value('operation','requiresTemperatureAlerts',$event.checked)">{{ 'tenant.registration.fields.requiresTemperatureAlerts' | t }}</mat-checkbox></div>
                </div>
              } @else if (currentStep() === 2) {
                <div class="tm-fields">
                  <div class="tm-field"><label for="facility">{{ 'tenant.registration.fields.facilityName' | t }}</label><input id="facility" matInput [value]="form().location.facilityName" (input)="input('location','facilityName',$event)" /><small class="field-error">{{ error('facilityName') | t }}</small></div>
                  <div class="tm-field"><label>{{ 'tenant.registration.fields.city' | t }}</label><mat-select [value]="form().location.city" (selectionChange)="value('location','city',$event.value)">@for (item of options.cities; track item) { <mat-option [value]="item">{{ ('tenant.registration.options.' + item) | t }}</mat-option> }</mat-select><small class="field-error">{{ error('city') | t }}</small></div>
                  <div class="tm-field span-2"><label for="address">{{ 'tenant.registration.fields.address' | t }}</label><input id="address" matInput [value]="form().location.address" (input)="input('location','address',$event)" /><small class="field-error">{{ error('address') | t }}</small></div>
                  <div class="tm-field"><label>{{ 'tenant.registration.fields.district' | t }}</label><mat-select [value]="form().location.district" (selectionChange)="value('location','district',$event.value)">@for (item of options.districts; track item) { <mat-option [value]="item">{{ ('tenant.registration.options.' + item) | t }}</mat-option> }</mat-select><small class="field-error">{{ error('district') | t }}</small></div>
                  <div class="tm-field"><label>{{ 'tenant.registration.fields.country' | t }}</label><mat-select [value]="form().location.country" (selectionChange)="value('location','country',$event.value)">@for (item of options.countries; track item) { <mat-option [value]="item">{{ ('tenant.registration.options.' + item) | t }}</mat-option> }</mat-select></div>
                  <div class="tm-field span-2"><label for="reference">{{ 'tenant.registration.fields.reference' | t }}</label><input id="reference" matInput [value]="form().location.reference" (input)="input('location','reference',$event)" /></div>
                  <div class="tm-field"><label for="warehouses">{{ 'tenant.registration.fields.warehouseCount' | t }}</label><input id="warehouses" matInput type="number" min="1" max="10" [value]="form().location.warehouseCount" (input)="number('location','warehouseCount',$event)" /><small class="field-error">{{ error('warehouseCount') | t }}</small></div>
                  <div class="tm-field"><label for="cold-rooms">{{ 'tenant.registration.fields.coldRoomsCount' | t }}</label><input id="cold-rooms" matInput type="number" min="0" max="50" [value]="form().location.coldRoomsCount" (input)="number('location','coldRoomsCount',$event)" /><small class="field-error">{{ error('coldRoomsCount') | t }}</small></div>
                  <div class="tm-field span-2"><label>{{ 'tenant.registration.fields.capacityEstimate' | t }}</label><mat-select [value]="form().location.capacityEstimate" (selectionChange)="value('location','capacityEstimate',$event.value)">@for (item of options.capacities; track item) { <mat-option [value]="item">{{ ('tenant.registration.options.' + item) | t }}</mat-option> }</mat-select><small class="field-error">{{ error('capacityEstimate') | t }}</small></div>
                  <div class="tm-field span-2"><mat-checkbox [checked]="form().location.fefoEnabled" (change)="value('location','fefoEnabled',$event.checked)">{{ 'tenant.registration.fields.fefoEnabled' | t }}</mat-checkbox></div>
                </div>
              } @else if (currentStep() === 3) {
                <div class="tm-fields">
                  <div class="tm-field"><label for="first-name">{{ 'tenant.registration.fields.firstName' | t }}</label><input id="first-name" matInput [value]="form().administrator.firstName" (input)="input('administrator','firstName',$event)" /><small class="field-error">{{ error('firstName') | t }}</small></div>
                  <div class="tm-field"><label for="last-name">{{ 'tenant.registration.fields.lastName' | t }}</label><input id="last-name" matInput [value]="form().administrator.lastName" (input)="input('administrator','lastName',$event)" /><small class="field-error">{{ error('lastName') | t }}</small></div>
                  <div class="tm-field"><label for="job-title">{{ 'tenant.registration.fields.jobTitle' | t }}</label><input id="job-title" matInput [value]="form().administrator.jobTitle" (input)="input('administrator','jobTitle',$event)" /><small class="field-error">{{ error('jobTitle') | t }}</small></div>
                  <div class="tm-field"><label for="admin-email">{{ 'tenant.registration.fields.email' | t }}</label><input id="admin-email" matInput type="email" autocomplete="email" [value]="form().administrator.email" (input)="input('administrator','email',$event)" /><small class="field-error">{{ error('email') | t }}</small></div>
                  <div class="tm-field"><label>{{ 'tenant.registration.fields.phonePrefix' | t }}</label><mat-select [value]="form().administrator.phonePrefix" (selectionChange)="value('administrator','phonePrefix',$event.value)">@for (item of options.phonePrefixes; track item) { <mat-option [value]="item">{{ item }}</mat-option> }</mat-select></div>
                  <div class="tm-field"><label for="phone">{{ 'tenant.registration.fields.phone' | t }}</label><input id="phone" matInput inputmode="tel" [value]="form().administrator.phone" (input)="input('administrator','phone',$event)" /><small class="field-error">{{ error('phone') | t }}</small></div>
                  <div class="tm-field"><label>{{ 'tenant.registration.fields.preferredLanguage' | t }}</label><mat-select [value]="form().administrator.preferredLanguage" (selectionChange)="value('administrator','preferredLanguage',$event.value)">@for (item of options.languages; track item) { <mat-option [value]="item">{{ ('tenant.registration.options.languages.' + item) | t }}</mat-option> }</mat-select></div>
                  <div class="tm-field span-2"><label>{{ 'tenant.registration.fields.roleAfterApproval' | t }}</label><div class="role-lock"><strong>{{ 'tenant.registration.ownerRole' | t }}</strong><span>{{ 'tenant.registration.ownerRoleHelp' | t }}</span></div></div>
                </div>
              } @else if (currentStep() === 4) {
                <div class="tm-fields">
                  <div class="tm-field"><label for="workspace-name">{{ 'tenant.registration.fields.workspaceName' | t }}</label><input id="workspace-name" matInput [value]="form().workspace.workspaceName" (input)="input('workspace','workspaceName',$event)" /><small class="field-error">{{ error('workspaceName') | t }}</small></div>
                  <div class="tm-field"><label for="workspace-slug">{{ 'tenant.registration.fields.workspaceSlug' | t }}</label><input id="workspace-slug" matInput [value]="form().workspace.workspaceSlug" (input)="input('workspace','workspaceSlug',$event)" (blur)="checkSlug()" /><small class="field-error">{{ error('workspaceSlug') | t }}</small></div>
                  <div class="workspace-preview span-2"><strong>{{ workspaceUrl() }}</strong><span [class]="'slug-' + slugAvailability().status">{{ ('tenant.registration.slugStatus.' + slugAvailability().status) | t }}</span>@if (slugAvailability().suggestions.length) { <small>{{ 'tenant.registration.suggestions' | t }}: {{ slugAvailability().suggestions.join(', ') }}</small> }</div>
                  <div class="tm-field span-2"><label>{{ 'tenant.registration.fields.plan' | t }}</label><div class="plan-grid">@for (plan of options.plans; track plan) { <button type="button" class="plan-card" [class.selected]="form().workspace.plan === plan" [attr.aria-pressed]="form().workspace.plan === plan" (click)="value('workspace','plan',plan)"><small>{{ ('tenant.registration.planLabels.' + plan) | t }}</small><strong>{{ plan }}</strong><span>{{ ('tenant.registration.planDescriptions.' + plan) | t }}</span><ul>@for (benefit of planBenefits; track benefit) { <li>{{ ('tenant.registration.planBenefits.' + plan + '.' + benefit) | t }}</li> }</ul></button> }</div></div>
                  <div class="tm-field"><label for="display-name">{{ 'tenant.registration.fields.displayName' | t }}</label><input id="display-name" matInput [value]="form().workspace.displayName" (input)="input('workspace','displayName',$event)" /></div>
                  <div class="tm-field"><label for="email-domain">{{ 'tenant.registration.fields.emailDomain' | t }}</label><input id="email-domain" matInput [value]="form().workspace.emailDomain" (input)="input('workspace','emailDomain',$event)" /></div>
                  <div class="tm-field span-2"><label>{{ 'tenant.registration.fields.capabilities' | t }}</label><div class="capability-list">@for (capability of form().workspace.capabilities; track capability) { <span>{{ ('tenant.capabilities.' + capability) | t }}</span> }</div></div>
                </div>
              } @else {
                <div class="review-submit">
                  <section class="review-brief"><div><span>{{ 'tenant.registration.reviewTitle' | t }}</span><strong>{{ form().company.tradeName || form().company.legalName }} · {{ workspaceUrl() }}</strong><p>{{ 'tenant.registration.reviewDesc' | t }}</p></div><div class="review-score"><strong>{{ form().company.companyMemberCount }}/100</strong><span>{{ 'tenant.registration.members' | t }}</span></div></section>
                  <div class="review-grid"><div><span>{{ 'tenant.registration.sections.company' | t }}</span><strong>{{ form().company.legalName }}</strong><small>{{ form().company.taxId }} · {{ ('tenant.registration.options.' + form().company.industrySector) | t }}</small></div><div><span>{{ 'tenant.registration.sections.operation' | t }}</span><strong>{{ ('tenant.registration.options.' + form().operation.operationType) | t }}</strong><small>{{ form().operation.minTemperature }}°C / {{ form().operation.maxTemperature }}°C</small></div><div><span>{{ 'tenant.registration.sections.location' | t }}</span><strong>{{ form().location.facilityName }}</strong><small>{{ form().location.address }}</small></div><div><span>{{ 'tenant.registration.sections.administrator' | t }}</span><strong>{{ form().administrator.firstName }} {{ form().administrator.lastName }}</strong><small>{{ form().administrator.email }}</small></div><div><span>{{ 'tenant.registration.sections.workspace' | t }}</span><strong>{{ workspaceUrl() }}</strong><small>{{ form().workspace.displayName }} · {{ form().workspace.plan }}</small></div><div><span>{{ 'tenant.registration.fields.capabilities' | t }}</span><strong>{{ form().workspace.capabilities.length }}</strong><small>{{ 'tenant.registration.reviewPolicy' | t }}</small></div></div>
                  <div class="review-categories">@for (categoryItem of form().operation.productCategories; track categoryItem) { <span>{{ ('tenant.registration.options.' + categoryItem) | t }}</span> }</div>
                  <mat-checkbox [checked]="form().workspace.termsAccepted" (change)="value('workspace','termsAccepted',$event.checked)">{{ 'tenant.registration.fields.termsAccepted' | t }}</mat-checkbox><small class="field-error">{{ error('termsAccepted') | t }}</small>
                </div>
              }

              @if (submitError()) { <div class="banner banner-danger" role="alert"><nx-icon name="pi-exclamation-triangle"></nx-icon><span>{{ 'tenant.registration.validation.submit' | t }}</span></div> }
              <div class="wizard-actions"><button mat-stroked-button type="button" [disabled]="submitting()" (click)="back()">{{ 'common.back' | t }}</button>@if (currentStep() < steps.length - 1) { <button mat-flat-button type="button" class="btn-primary" (click)="next()">{{ 'common.next' | t }}</button> } @else { <button mat-flat-button type="submit" class="btn-primary" [disabled]="submitting()">{{ submitting() ? ('common.loading' | t) : ('tenant.registration.submit' | t) }}</button> }</div>
            </form>
          </section>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .tenant-auth-page { min-height:100dvh; padding:0; align-items:stretch; background:linear-gradient(120deg,#edf6ff 0%,#f8fafc 45%,#fff 100%); }
    .tenant-auth-wrap { display:grid; grid-template-columns:minmax(0,50%) minmax(0,50%); max-width:none; min-height:100dvh; border-radius:0; box-shadow:none; }
    .tenant-auth-wrap .auth-left { padding:clamp(40px,5vw,76px); }
    .tenant-auth-wrap .auth-right { width:auto; padding:clamp(34px,4.6vw,72px); }
    .tenant-register-right { justify-content:flex-start; overflow-y:auto; }
    .register-toolbar { width:min(100%,760px); display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
    .back-login { display:flex; align-items:center; gap:7px; border:0; background:transparent; color:#475569; cursor:pointer; font-weight:700; }
    .tenant-register-page { display:grid; gap:16px; width:min(100%,760px); }
    .tenant-register-note { display:flex; gap:10px; align-items:flex-start; padding:12px 14px; border:1px solid #bfdbfe; border-radius:14px; background:#eff6ff; color:#1e3a8a; font-size:13px; line-height:1.45; }
    .tenant-register-panel { border:1px solid #dbe3ef; border-radius:22px; background:rgba(255,255,255,.94); padding:22px; box-shadow:0 24px 60px rgba(15,23,42,.10); }
    .tm-stepper { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:10px; margin:0 0 24px; padding:0; list-style:none; }
    .tm-stepper li { min-width:0; color:#64748b; font-size:11px; font-weight:800; text-align:center; }
    .tm-stepper span { width:30px; height:30px; display:flex; align-items:center; justify-content:center; border-radius:999px; background:#e2e8f0; margin:0 auto 7px; }
    .tm-stepper strong { display:block; line-height:1.15; }
    .tm-stepper li.active { color:#1d4ed8; } .tm-stepper li.active span { background:#1d4ed8; color:white; box-shadow:0 0 0 4px #dbeafe; } .tm-stepper li.done span { background:#16a34a; color:white; }
    .tm-fields { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
    .tm-field { min-width:0; } .span-2 { grid-column:1/-1; }
    .tm-field label { display:block; color:#1e293b; font-size:13px; font-weight:650; margin-bottom:7px; }
    .tm-field input:not([type=file]):not([type=range]), .tm-field mat-select { width:100%; min-height:46px; border:1px solid #cbd8ea; border-radius:13px; background:#fff; color:#0f172a; padding:0 13px; box-sizing:border-box; }
    .tm-field mat-select { display:flex; align-items:center; }
    .tm-field small { display:block; margin-top:6px; font-size:12px; } .hint { color:#64748b; } .field-error { min-height:0; color:#b91c1c; }
    .field-error:empty { display:none; }
    .company-size-slider { padding:16px; border:1px solid #dbeafe; border-radius:18px; background:linear-gradient(180deg,#f8fbff,#fff); }
    .slider-head,.slider-marks { display:flex; justify-content:space-between; gap:10px; color:#64748b; font-size:12px; } .slider-head strong { color:#0f172a; } .slider-head span { color:#1d4ed8; font-weight:800; }
    .company-size-slider input[type=range] { width:100%; margin:16px 0 12px; accent-color:#2563eb; }
    .tm-input-suffix { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; border:1px solid #cbd8ea; border-radius:13px; overflow:hidden; } .tm-input-suffix input { border:0!important; } .tm-input-suffix span { padding:0 12px; color:#64748b; border-left:1px solid #e2e8f0; }
    .tm-category-grid,.tm-toggle-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin-top:10px; }
    .tm-category-grid mat-checkbox,.tm-toggle-grid mat-checkbox { padding:9px; border:1px solid #dbe3ef; border-radius:13px; background:#f8fbff; }
    .logo-field input[type=file] { margin-top:10px; } .logo-preview { width:112px; height:76px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; border:1px dashed #93c5fd; border-radius:14px; color:#64748b; overflow:hidden; } .logo-preview img { width:100%; height:100%; object-fit:contain; }
    .role-lock,.workspace-preview { display:grid; gap:4px; padding:12px 14px; border:1px solid #bfdbfe; border-radius:12px; background:#eff6ff; } .role-lock strong,.workspace-preview strong { color:#1d4ed8; }
    .slug-available { color:#15803d; } .slug-unavailable,.slug-error { color:#b91c1c; } .slug-checking { color:#b45309; }
    .plan-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; } .plan-card { min-height:172px; display:grid; align-content:start; gap:6px; border:1px solid #dbe3ef; border-radius:13px; background:#fff; padding:13px; text-align:left; cursor:pointer; color:#334155; } .plan-card.selected { border-color:#93c5fd; background:#eff6ff; } .plan-card small { color:#1d4ed8; font-weight:900; } .plan-card strong { color:#0f172a; } .plan-card span,.plan-card li { color:#64748b; font-size:12px; }
    .capability-list,.review-categories { display:flex; flex-wrap:wrap; gap:8px; } .capability-list span,.review-categories span { padding:6px 10px; border-radius:999px; background:#eff6ff; color:#1d4ed8; font-size:12px; font-weight:700; }
    .review-brief { display:flex; justify-content:space-between; gap:14px; align-items:center; margin-bottom:12px; padding:14px; border:1px solid #bfdbfe; border-radius:14px; background:linear-gradient(135deg,#eff6ff,#f8fafc); } .review-brief span { color:#1d4ed8; font-size:11px; font-weight:900; text-transform:uppercase; } .review-brief strong { display:block; color:#0f172a; } .review-brief p { color:#475569; font-size:12px; } .review-score { text-align:center; padding:10px; border-radius:12px; background:#fff; border:1px solid #dbeafe; }
    .review-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-bottom:14px; } .review-grid div { padding:12px; border:1px solid #e2e8f0; border-radius:12px; } .review-grid span,.review-grid small { display:block; color:#64748b; font-size:12px; margin-top:4px; }
    .wizard-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:22px; } .wizard-actions button { min-height:44px; border-radius:11px; padding:0 18px; } .wizard-actions .btn-primary { background:#1d4ed8; color:#fff; }
    @media (max-width:1024px) { .tenant-auth-wrap { grid-template-columns:minmax(0,38%) minmax(0,62%); } }
    @media (max-width:820px) { .tenant-auth-wrap { grid-template-columns:1fr; } .auth-left { display:none; } .tenant-register-right { padding:28px 16px 38px; } }
    @media (max-width:620px) { .tenant-register-panel { padding:16px; border-radius:18px; } .tm-fields,.tm-category-grid,.tm-toggle-grid,.plan-grid,.review-grid { grid-template-columns:1fr; } .tm-stepper { grid-template-columns:repeat(3,minmax(0,1fr)); } .wizard-actions { flex-direction:column-reverse; } .wizard-actions button { width:100%; } .review-brief { align-items:flex-start; } }
  `],
})
export class RegisterOrganizationPage {
  private readonly store = inject(OrganizationRegistrationStore);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  readonly form = this.store.form;
  readonly currentStep = this.store.currentStep;
  readonly steps = this.store.steps;
  readonly options = this.store.options;
  readonly errors = this.store.errors;
  readonly submitting = this.store.submitting;
  readonly slugAvailability = this.store.slugAvailability;
  readonly workspaceUrl = this.store.workspaceUrl;
  readonly lang = this.i18n.lang;
  readonly planBenefits = ['one', 'two', 'three', 'four'];
  readonly submitError = signal(false);

  setLang(lang: Lang): void { this.i18n.set(lang); }
  value(section: RegistrationSection, field: string, value: unknown): void { this.store.update(section, field, value); }
  input(section: RegistrationSection, field: string, event: Event): void { this.value(section, field, (event.target as HTMLInputElement).value); }
  number(section: RegistrationSection, field: string, event: Event): void { this.value(section, field, Number((event.target as HTMLInputElement).value)); }
  nullableNumber(section: RegistrationSection, field: string, event: Event): void { const value = (event.target as HTMLInputElement).value; this.value(section, field, value === '' ? null : Number(value)); }
  category(category: string, checked: boolean): void { this.store.toggleCategory(category, checked); }
  checkSlug(): void { this.store.checkSlug(); }
  error(field: string): string { return this.errors()[field] ?? ''; }
  logo(event: Event): void { this.store.setLogo((event.target as HTMLInputElement).files?.[0] ?? null); }
  next(): void { this.store.next(); }

  back(): void {
    if (this.currentStep() > 0) this.store.previous();
    else void this.router.navigate(['/login']);
  }

  submit(event: Event): void {
    event.preventDefault();
    this.submitError.set(false);
    const request = this.store.submit();
    if (!request) return;
    request.subscribe({
      next: (registration) => void this.router.navigate(['/tenant-management/registration-pending', registration.externalId]),
      error: () => this.submitError.set(true),
    });
  }
}
