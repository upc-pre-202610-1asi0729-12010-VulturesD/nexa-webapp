import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { Client } from '@app/clients/domain/model';
import { PortalSnapshot } from '@app/portal/domain/model';
import { PortalStore } from '@app/portal/application/portal.store';
import { PortalCartStore } from '@app/portal/application/portal-cart.store';
import { IamStore } from '@app/iam/application/iam.store';
import { I18nService } from '@app/shared/presentation/services/i18n.service';
import { TranslatePipe } from '@app/shared/presentation/pipes/t.pipe';
import { PlatformReferenceOption } from '@app/portal/infrastructure/portal-api';

@Component({
  selector: 'nx-portal-request-builder',
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="buyer-page">
      <div class="page-header">
        <div>
          <div class="page-title">{{ 'buyerRequestBuilder.title' | t }}</div>
          <div class="page-subtitle">{{ 'buyerRequestBuilder.subtitle' | t }}</div>
        </div>
      </div>

      <ng-container *ngIf="loading(); else mainContent">
        <div class="flow-panel flow-panel-pad"><div class="skeleton" style="height:16px"></div></div>
      </ng-container>

      <ng-template #mainContent>
        <div *ngIf="!user()?.clientId; else builderFlow" class="empty-state">
          <div class="empty-state-icon"><i class="pi pi-ban"></i></div>
          <div class="empty-state-title">{{ 'buyerRequestBuilder.noClient' | t }}</div>
        </div>

        <ng-template #builderFlow>
          <div class="buyer-builder-flow">
            <div class="stepper buyer-stepper">
              <ng-container *ngFor="let label of steps; let idx = index">
                <div class="step-item" [ngClass]="step === idx + 1 ? 'step-active' : step > idx + 1 ? 'step-done' : 'step-pending'">
                  <div class="step-circle">
                    <i *ngIf="step > idx + 1" class="pi pi-check"></i>
                    <span *ngIf="step <= idx + 1">{{ idx + 1 }}</span>
                  </div>
                  <div class="step-label">{{ label }}</div>
                </div>
                <div *ngIf="idx < steps.length - 1" class="step-connector" [ngClass]="step > idx + 1 ? 'step-connector-done' : 'step-connector-pending'"></div>
              </ng-container>
            </div>

            <!-- STEP 1: Buyer validation -->
            <section *ngIf="step === 1" class="flow-panel buyer-validation-panel">
              <div class="flow-panel-head">
                <div>
                  <div class="flow-title">{{ 'buyerRequestBuilder.buyerTitle' | t }}</div>
                  <div class="flow-subtitle">{{ 'buyerRequestBuilder.buyerSubtitle' | t }}</div>
                </div>
              </div>
              <div class="flow-panel-pad buyer-validation-grid">
                <div class="review-check ok">
                  <i class="pi pi-user"></i>
                  <span><strong>{{ user()?.name }}</strong><small>{{ user()?.email }}</small></span>
                </div>
                <div class="review-check ok">
                  <i class="pi pi-building"></i>
                  <span><strong>{{ snapshot()?.client?.commercialName || snapshot()?.client?.businessName || user()?.clientId }}</strong><small>{{ user()?.clientId }}</small></span>
                </div>
                <div class="review-check ok">
                  <i class="pi pi-map-marker"></i>
                  <span><strong>{{ primaryWarehouse.name }}</strong><small>{{ primaryWarehouse.address }}</small></span>
                </div>
                <button class="btn btn-primary span-full" type="button" (click)="step = 2">
                  {{ 'buyerRequestBuilder.continueProducts' | t }} <i class="pi pi-arrow-right"></i>
                </button>
              </div>
            </section>

            <!-- STEP 2: Products Cart Selection -->
            <div *ngIf="step === 2" class="request-builder-grid">
              <section class="flow-panel request-items-panel">
                <div class="flow-panel-head">
                  <div>
                    <div class="flow-title">{{ 'buyerRequestBuilder.itemsTitle' | t }}</div>
                    <div class="flow-subtitle">{{ cart.count() }} {{ 'buyerRequestBuilder.units' | t }} {{ 'buyerRequestBuilder.itemsSubtitle' | t : { count: cart.count() } }}</div>
                  </div>
                  <button class="btn btn-secondary btn-sm" (click)="goToCatalog()"><i class="pi pi-plus"></i> {{ 'buyerRequestBuilder.addProducts' | t }}</button>
                </div>
                <div class="flow-panel-pad request-item-list">
                  <div *ngFor="let item of enrichedItems" class="request-item-card">
                    <div class="request-item-mark"><i class="pi pi-box"></i></div>
                    <div class="request-item-copy">
                      <strong>{{ item.name }}</strong>
                      <span>{{ item.metadata }}</span>
                      <small [ngClass]="item.catalogLinked ? 'ok-text' : 'danger-text'">
                        {{ item.catalogLinked ? ('buyerRequestBuilder.catalogLinked' | t) : ('buyerRequestBuilder.catalogMissing' | t) }}
                      </small>
                    </div>
                    <div class="request-item-controls">
                      <button class="btn btn-ghost btn-sm" type="button" [aria-label]="'portal.cartDecrease' | t : { name: item.name }" (click)="cart.setQty(item.productId, item.qty - 1)">-</button>
                      <input class="qty-input" type="number" min="1" [value]="item.qty" [aria-label]="'portal.cartQuantity' | t : { qty: item.qty }" (input)="updateCartQty(item.productId, $event)" />
                      <button class="btn btn-ghost btn-sm" type="button" [aria-label]="'portal.cartIncrease' | t : { name: item.name }" (click)="cart.setQty(item.productId, item.qty + 1)">+</button>
                      <strong>S/ {{ (item.price * item.qty) | number:'1.2-2' }}</strong>
                      <button class="btn btn-ghost btn-sm" type="button" [aria-label]="'portal.cartRemove' | t : { name: item.name }" (click)="cart.remove(item.productId)"><i class="pi pi-trash" aria-hidden="true"></i></button>
                    </div>
                  </div>
                  <div *ngIf="!cart.items().length" class="empty-state compact">
                    <div class="empty-state-title">{{ 'buyerRequestBuilder.emptyTitle' | t }}</div>
                    <div class="empty-state-desc">{{ 'buyerRequestBuilder.emptyDescription' | t }}</div>
                  </div>
                  <div class="request-step-actions">
                    <button class="btn btn-ghost" type="button" (click)="step = 1"><i class="pi pi-arrow-left"></i> {{ 'common.back' | t }}</button>
                    <button class="btn btn-primary" type="button" [disabled]="!canContinueProducts" (click)="step = 3">
                      {{ 'buyerRequestBuilder.continueDelivery' | t }} <i class="pi pi-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <!-- STEP 3: Delivery Form and Route calculation -->
            <div *ngIf="step === 3" class="delivery-grid">
              <section class="flow-panel delivery-form-card" style="margin-bottom:0">
                <div class="flow-panel-head">
                  <div>
                    <div class="flow-title">{{ 'buyerRequestBuilder.deliveryTitle' | t }}</div>
                    <div class="flow-subtitle">{{ snapshot()?.client?.commercialName || snapshot()?.client?.businessName || user()?.clientId }}</div>
                  </div>
                </div>
                <div class="flow-panel-pad form-grid">
                  <div class="span-full nexa-select-grid delivery-mode-grid">
                    <button class="nexa-select-card" [class.active]="deliveryMode === 'manual'" type="button" (click)="useManualAddress()">
                      <i class="pi pi-pencil"></i>
                      <span><strong>{{ 'buyerRequestBuilder.manualAddress' | t }}</strong><small>{{ 'buyerRequestBuilder.manualAddressDescription' | t }}</small></span>
                    </button>
                    <button class="nexa-select-card" [class.active]="deliveryMode === 'saved'" type="button" (click)="selectSavedAddress()">
                      <i class="pi pi-bookmark"></i>
                      <span><strong>{{ 'buyerRequestBuilder.savedAddress' | t }}</strong><small>{{ selectedAddress.label || ('buyerRequestBuilder.savedAddressDescription' | t) }}</small></span>
                    </button>
                    <button class="nexa-select-card" [class.active]="deliveryMode === 'current'" type="button" (click)="useCurrentLocation()">
                      <i class="pi pi-map-marker"></i>
                      <span><strong>{{ 'buyerRequestBuilder.currentLocation' | t }}</strong><small>{{ 'buyerRequestBuilder.currentLocationDescription' | t : { warehouse: primaryWarehouse.name } }}</small></span>
                    </button>
                  </div>

                  <ng-container *ngIf="addresses.length && deliveryMode === 'saved'">
                    <label class="field span-full">
                      <span class="field-label">{{ 'buyerRequestBuilder.savedAddress' | t }}</span>
                      <select [(ngModel)]="selectedAddressId" class="plain-input" (change)="onSavedAddressDropdownChange()">
                        <option *ngFor="let address of addresses" [value]="address.id">{{ address.label }} - {{ address.window }}</option>
                      </select>
                    </label>
                  </ng-container>

                  <ng-container *ngIf="addressFieldsVisible">
                    <label class="field">
                      <span class="field-label">{{ 'buyerRequestBuilder.city' | t }}</span>
                      <select [(ngModel)]="city" class="plain-input" (change)="selectCity()">
                        <option value="">{{ 'buyerRequestBuilder.selectCity' | t }}</option>
                        <option *ngFor="let item of cityOptions" [value]="item.code">{{ item.label }}</option>
                      </select>
                    </label>
                    <label class="field">
                      <span class="field-label">{{ 'buyerRequestBuilder.province' | t }}</span>
                      <select [(ngModel)]="province" class="plain-input" [disabled]="!city" (change)="selectProvince()">
                        <option value="">{{ 'buyerRequestBuilder.selectProvince' | t }}</option>
                        <option *ngFor="let item of provinceOptions" [value]="item.code">{{ item.label }}</option>
                      </select>
                    </label>
                    <label class="field">
                      <span class="field-label">{{ 'buyerRequestBuilder.district' | t }}</span>
                      <select [(ngModel)]="district" class="plain-input" [disabled]="!province">
                        <option value="">{{ 'buyerRequestBuilder.selectDistrict' | t }}</option>
                        <option *ngFor="let item of districtOptions" [value]="item.code">{{ item.label }}</option>
                      </select>
                    </label>
                    <div class="field span-full">
                      <span class="field-label">{{ 'buyerRequestBuilder.addressLine' | t }}</span>
                      <div class="buyer-address-line">
                        <select [(ngModel)]="addressType" class="plain-input">
                          <option value="Av.">Av.</option>
                          <option value="Calle">Calle</option>
                          <option value="Jr.">Jr.</option>
                          <option value="Pasaje">Pasaje</option>
                        </select>
                        <input [(ngModel)]="addressLine" class="plain-input" [placeholder]="'buyerRequestBuilder.addressPlaceholder' | t" />
                      </div>
                    </div>
                  </ng-container>

                  <label class="field span-full">
                    <span class="field-label">{{ 'buyerRequestBuilder.reference' | t }}</span>
                    <input [(ngModel)]="reference" class="plain-input" [placeholder]="'buyerRequestBuilder.referencePlaceholder' | t" />
                  </label>
                  <label class="field span-full">
                    <span class="field-label">{{ 'buyerRequestBuilder.requestedDate' | t }}</span>
                    <input type="date" [(ngModel)]="requestedDeliveryDate" class="plain-input" [min]="minimumDeliveryDateISO" />
                    <small *ngIf="deliveryDateWarning" class="field-error">{{ deliveryDateWarning }}</small>
                  </label>
                  <label class="field span-full">
                    <span class="field-label">{{ 'buyerRequestBuilder.salesMessage' | t }}</span>
                    <textarea [(ngModel)]="comments" rows="4" class="plain-input" [placeholder]="'portal.requestNotesPlaceholder' | t"></textarea>
                  </label>
                  <div class="span-full nexa-select-grid">
                    <button class="nexa-select-card" [class.active]="paymentMode === 'credit_line'" type="button" (click)="paymentMode = 'credit_line'">
                      <i class="pi pi-wallet"></i>
                      <span><strong>{{ 'buyerRequestBuilder.useCredit' | t }}</strong><small>{{ snapshot()?.client?.condition || ('buyerRequestBuilder.creditLine' | t) }} · {{ 'buyerRequestBuilder.salesValidation' | t }}</small></span>
                    </button>
                    <button class="nexa-select-card" [class.active]="paymentMode === 'bank_transfer'" type="button" (click)="paymentMode = 'bank_transfer'">
                      <i class="pi pi-credit-card"></i>
                      <span><strong>{{ 'buyerRequestBuilder.bankTransfer' | t }}</strong><small>{{ 'buyerRequestBuilder.bankTransferDescription' | t }}</small></span>
                    </button>
                  </div>
                  <div class="request-step-actions span-full" style="margin-top:20px">
                    <button class="btn btn-ghost" type="button" (click)="step = 2"><i class="pi pi-arrow-left"></i> {{ 'common.back' | t }}</button>
                    <button class="btn btn-primary" type="button" [disabled]="!canSubmit" (click)="step = 4">
                      {{ 'buyerRequestBuilder.continueConfirm' | t }} <i class="pi pi-arrow-right"></i>
                    </button>
                  </div>
                  <p *ngIf="submitError" class="muted-text span-full" style="color:#b91c1c;margin-top:10px">{{ submitError }}</p>
                </div>
              </section>

              <aside class="flow-panel route-map-card" style="margin-bottom:0">
                <div class="flow-panel-head">
                  <div>
                    <div class="flow-title">{{ 'buyerRequestBuilder.routePreview' | t }}</div>
                    <p style="font-size:12px;color:#64748b;margin-top:4px">{{ 'buyerRequestBuilder.routePreviewDescription' | t }}</p>
                  </div>
                  <a *ngIf="mapReady" class="btn btn-secondary btn-sm" [href]="mapDirectionsUrl" target="_blank" rel="noopener noreferrer">
                    <i class="pi pi-external-link"></i> {{ 'buyerRequestBuilder.openMaps' | t }}
                  </a>
                </div>
                <div class="flow-panel-pad flow-stack" style="gap:14px">
                  <div class="span-full route-trace-card" style="margin:0">
                    <div>
                      <span>{{ 'buyerRequestBuilder.traceableRoute' | t }}</span>
                      <strong>{{ deliverySummary }}</strong>
                    </div>
                    <small *ngIf="locationError" style="color:#b91c1c;display:block;margin-top:4px">{{ locationError }}</small>
                  </div>
                  
                  <iframe *ngIf="mapReady && mapEmbedUrl" [title]="'buyerRequestBuilder.routePreview' | t" [src]="mapEmbedUrl" loading="lazy" referrerpolicy="no-referrer-when-downgrade" style="width:100%;height:300px;border:1px solid #e2e8f0;border-radius:12px;margin:0"></iframe>
                  <div *ngIf="!mapReady" class="empty-state compact">{{ 'buyerRequestBuilder.completeAddressToPreview' | t }}</div>
                  
                  <div class="span-full request-cost-card" style="margin:0">
                    <div><span>{{ 'buyerRequestBuilder.products' | t }}</span><strong>S/ {{ subtotal | number:'1.2-2' }}</strong></div>
                    <div><span>{{ 'buyerRequestBuilder.shippingCost' | t }}</span><strong>S/ {{ shippingCost | number:'1.2-2' }}</strong></div>
                    <div><span>{{ 'buyerRequestBuilder.shippingEta' | t }}</span><strong>{{ shippingEta }}</strong></div>
                    <div><span>{{ 'buyerRequestBuilder.total' | t }}</span><strong>S/ {{ grandTotal | number:'1.2-2' }}</strong></div>
                  </div>
                  <div class="banner banner-info span-full" style="margin:0">
                    <i class="pi pi-map-marker"></i>
                    <div>{{ 'buyerRequestBuilder.traceabilityNotice' | t }}</div>
                  </div>
                </div>
              </aside>
            </div>

            <!-- STEP 4: Review and Submit request -->
            <section *ngIf="step === 4" class="flow-panel buyer-confirm-panel">
              <div class="flow-panel-head">
                <div>
                  <div class="flow-title">{{ 'buyerRequestBuilder.confirmTitle' | t }}</div>
                  <div class="flow-subtitle">{{ snapshot()?.client?.commercialName || snapshot()?.client?.businessName || user()?.clientId }} · {{ deliveryAddressText }}</div>
                </div>
                <span class="flow-pill flow-pill-blue">{{ totalUnits }} {{ 'buyerRequestBuilder.units' | t }}</span>
              </div>
              <div class="flow-panel-pad buyer-confirm-grid">
                <div class="request-item-list">
                  <div *ngFor="let item of enrichedItems" class="request-item-card">
                    <div class="request-item-mark"><i class="pi pi-box"></i></div>
                    <div class="request-item-copy">
                      <strong>{{ item.name }}</strong>
                      <span>{{ item.metadata }}</span>
                    </div>
                    <div class="request-item-controls">
                      <button class="btn btn-ghost btn-sm" type="button" (click)="cart.setQty(item.productId, item.qty - 1)">-</button>
                      <input class="qty-input" type="number" min="1" [value]="item.qty" (input)="updateCartQty(item.productId, $event)" />
                      <button class="btn btn-ghost btn-sm" type="button" (click)="cart.setQty(item.productId, item.qty + 1)">+</button>
                      <strong>S/ {{ (item.price * item.qty) | number:'1.2-2' }}</strong>
                    </div>
                  </div>
                </div>
                <aside class="flow-stack">
                  <div class="review-check ok"><i class="pi pi-map-marker"></i><span><strong>{{ 'buyerRequestBuilder.deliveryTitle' | t }}</strong><small>{{ deliveryAddressText }}</small></span></div>
                  <div class="review-check ok"><i class="pi pi-calendar"></i><span><strong>{{ 'buyerRequestBuilder.requestedDate' | t }}</strong><small>{{ requestedDeliveryDate }}</small></span></div>
                  <div class="review-check ok"><i class="pi pi-credit-card"></i><span><strong>{{ paymentMode === 'credit_line' ? ('buyerRequestBuilder.useCredit' | t) : ('buyerRequestBuilder.bankTransfer' | t) }}</strong><small>{{ 'buyerRequestBuilder.salesValidation' | t }}</small></span></div>
                  <div class="request-cost-card">
                    <div><span>{{ 'buyerRequestBuilder.products' | t }}</span><strong>S/ {{ subtotal | number:'1.2-2' }}</strong></div>
                    <div><span>{{ 'buyerRequestBuilder.shippingCost' | t }}</span><strong>S/ {{ shippingCost | number:'1.2-2' }}</strong></div>
                    <div><span>{{ 'buyerRequestBuilder.shippingEta' | t }}</span><strong>{{ shippingEta }}</strong></div>
                    <div><span>{{ 'buyerRequestBuilder.total' | t }}</span><strong>S/ {{ grandTotal | number:'1.2-2' }}</strong></div>
                  </div>
                  <div class="banner banner-info" style="margin:0">
                    <i class="pi pi-info-circle"></i>
                    <div>{{ 'buyerRequestBuilder.traceabilityNotice' | t }}</div>
                  </div>
                  <div class="request-step-actions" style="margin-top:20px">
                    <button class="btn btn-ghost" type="button" (click)="step = 2"><i class="pi pi-arrow-left"></i> {{ 'buyerRequestBuilder.backToCart' | t }}</button>
                    <button class="btn btn-primary" type="button" [disabled]="!canSubmit || submittingState" (click)="submitRequest()">
                      <i class="pi pi-send"></i> {{ submittingState ? ('buyerRequestBuilder.submitting' | t) : ('buyerRequestBuilder.submit' | t) }}
                    </button>
                  </div>
                  <p *ngIf="submitError" class="muted-text" style="color:#b91c1c;margin-top:10px">{{ submitError }}</p>
                </aside>
              </div>
            </section>
          </div>
        </ng-template>
      </ng-template>
    </div>
  `,
  styles: [`
    .delivery-date-picker { width:100%; }
    .buyer-builder-flow {
      display: grid;
      gap: 18px;
      width: min(100%, 1480px);
      margin: 0 auto;
    }
    .buyer-stepper {
      margin-bottom: 0;
    }
    .buyer-validation-panel,
    .buyer-confirm-panel {
      width: 100%;
    }
    .buyer-validation-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
    }
    .buyer-confirm-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.45fr) minmax(360px, .55fr);
      gap: 18px;
      align-items: start;
    }
    .request-builder-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 18px;
      align-items: start;
    }
    .request-items-panel,
    .request-side-panel {
      min-width: 0;
    }
    .delivery-mode-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .delivery-mode-grid .nexa-select-card {
      min-height: 118px;
      justify-content: flex-start;
    }
    .buyer-address-line {
      display: grid;
      grid-template-columns: 112px minmax(0, 1fr);
      gap: 10px;
    }
    .request-item-list {
      display: grid;
      gap: 12px;
    }
    .request-item-card {
      display: grid;
      grid-template-columns: 54px minmax(0, 1fr) auto;
      gap: 14px;
      align-items: center;
      padding: 14px;
      border: 1px solid #dbe3ef;
      border-radius: 14px;
      background: #ffffff;
    }
    .request-item-mark {
      width: 54px;
      height: 54px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #eff6ff;
      color: #2563eb;
      font-size: 21px;
    }
    .request-item-copy strong {
      display: block;
      color: #0f172a;
      font-size: 15px;
      line-height: 1.25;
    }
    .request-item-copy span,
    .request-item-copy small {
      display: block;
      margin-top: 4px;
      color: #64748b;
      font-size: 12px;
    }
    .ok-text { color: #15803d !important; }
    .danger-text { color: #b91c1c !important; }
    .request-item-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .qty-input {
      width: 54px;
      height: 36px;
      border: 1px solid #d7deea;
      border-radius: 10px;
      text-align: center;
      font-weight: 800;
    }
    .request-cost-card {
      display: grid;
      gap: 10px;
      padding: 14px;
      border: 1px solid #bfdbfe;
      border-radius: 14px;
      background: linear-gradient(180deg, #ffffff 0%, #eff6ff 100%);
    }
    .request-cost-card div {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .request-cost-card div:last-child {
      margin-top: 4px;
      padding: 10px 12px;
      border-top: 1px solid #dbe3ef;
      border-radius: 12px;
      background: #dbeafe;
      color: #1d4ed8;
      font-size: 16px;
    }
    .route-trace-card {
      padding: 16px;
      border: 1px solid #bfdbfe;
      border-radius: 16px;
      background: #eff6ff;
      color: #1e40af;
    }
    .route-trace-card span,
    .route-trace-card small {
      display: block;
      color: #64748b;
      font-size: 13px;
      line-height: 1.35;
    }
    .route-trace-card strong {
      display: block;
      margin-top: 4px;
      color: #0f172a;
      font-size: 15px;
      line-height: 1.35;
    }
    .request-step-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    }
    .review-check {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      padding: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      background: #f8fafc;
    }
    .review-check.ok {
      border-color: #bbf7d0;
      background: #f0fdf4;
    }
    .review-check i {
      color: #1d4ed8;
      margin-top: 2px;
    }
    .review-check span {
      display: grid;
      gap: 3px;
      min-width: 0;
    }
    .review-check small {
      color: #64748b;
      line-height: 1.4;
      overflow-wrap: anywhere;
    }
    .delivery-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }
    .nexa-select-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .nexa-select-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      background: #fff;
      cursor: pointer;
      text-align: left;
      transition: all 140ms;
      width: 100%;
    }
    .nexa-select-card:hover {
      border-color: #bfdbfe;
      background: #eff6ff;
    }
    .nexa-select-card.active {
      border-color: #2563eb;
      background: #eff6ff;
      box-shadow: 0 0 0 1px #bfdbfe;
    }
    .nexa-select-card i {
      font-size: 20px;
      color: #2563eb;
    }
    .nexa-select-card span {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .nexa-select-card strong {
      font-size: 13px;
      color: #0f172a;
    }
    .nexa-select-card small {
      font-size: 11px;
      color: #64748b;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }
    .field-label {
      font-size: 12px;
      font-weight: 700;
      color: #334155;
    }
    .plain-input {
      width: 100%;
      min-height: 42px;
      border: 1px solid #dbe3ef;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13px;
      color: #0f172a;
      background: #fff;
      outline: none;
    }
    .plain-input:focus {
      border-color: #2563eb;
    }
    .field-error {
      font-size: 11px;
      color: #b91c1c;
    }
    @media (max-width: 1180px) {
      .request-builder-grid,
      .buyer-confirm-grid,
      .delivery-grid {
        grid-template-columns: 1fr;
      }
      .buyer-validation-grid {
        grid-template-columns: 1fr;
      }
      .delivery-mode-grid {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 720px) {
      .request-item-card {
        grid-template-columns: 44px minmax(0, 1fr);
      }
      .buyer-address-line {
        grid-template-columns: 1fr;
      }
      .request-item-controls {
        grid-column: 1 / -1;
        justify-content: flex-end;
      }
    }
  `]
})
export class PortalRequestBuilderPage implements OnInit {
  private readonly store = inject(PortalStore);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  readonly cart = inject(PortalCartStore);
  private readonly session = inject(IamStore);
  readonly i18n = inject(I18nService);

  readonly user = this.session.user;
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly submitErrorSignal = signal('');
  readonly snapshot = signal<PortalSnapshot | null>(null);

  step = 1;
  requestedDeliveryDate = '';
  comments = '';
  district = '';
  province = '';
  city = '';
  addressType = 'Av.';
  addressLine = '';
  reference = '';
  paymentMode = 'credit_line';
  deliveryMode = 'manual';
  currentLocation: { lat: number; lng: number } | null = null;
  locationError = '';
  selectedAddressId = '';
  submittingState = false;
  submitError = '';

  departments: PlatformReferenceOption[] = [];
  provinces: PlatformReferenceOption[] = [];
  districts: PlatformReferenceOption[] = [];

  get steps(): string[] {
    return [
      this.i18n.t('buyerRequestBuilder.steps.buyer'),
      this.i18n.t('buyerRequestBuilder.steps.products'),
      this.i18n.t('buyerRequestBuilder.steps.delivery'),
      this.i18n.t('buyerRequestBuilder.steps.confirm'),
    ];
  }

  get cityOptions() {
    return this.departments;
  }

  get provinceOptions() {
    return this.provinces.filter(item => !this.city || item.parentCode === this.city);
  }

  get districtOptions() {
    return this.districts.filter(item => !this.province || item.parentCode === this.province);
  }

  ngOnInit() {
    const user = this.user();
    if (!user?.clientId) {
      this.loading.set(false);
      return;
    }

    // Load reference data and snapshot in parallel
    forkJoin([
      this.store.getDepartments(),
      this.store.getProvinces(),
      this.store.getDistricts(),
      this.store.load(user.clientId)
    ]).subscribe({
      next: ([depts, provs, dists, snapshot]) => {
        this.departments = depts;
        this.provinces = provs;
        this.districts = dists;
        this.snapshot.set(snapshot);

        if (snapshot.deliveryAddresses.length) {
          this.selectedAddressId = snapshot.deliveryAddresses[0].id;
        }

        this.initializeClientAddress();
        this.loading.set(false);

        // Advance to step 2 if items are already in cart
        if (this.cart.items().length) {
          this.step = 2;
        }
      },
      error: () => this.loading.set(false),
    });
  }

  initializeClientAddress() {
    const client = this.snapshot()?.client;
    if (!client || !this.provinces.length) return;
    if (!this.addressLine) {
      const parsedAddress = this.splitStreetAddress(client.address || '');
      this.addressType = parsedAddress.type;
      this.addressLine = parsedAddress.line;
    }
    if (!this.province) this.province = this.referenceCode(this.provinces, client.province);
    const provItem = this.provinces.find(item => item.code === this.province);
    if (!this.city) this.city = provItem?.parentCode || this.referenceCode(this.departments, (client as any).city || client.province);
    if (!this.district) this.district = this.referenceCode(this.districts, client.district);
    if (!this.reference) this.reference = client.deliveryReference || '';
  }

  referenceCode(rows: PlatformReferenceOption[], value: any): string {
    const normalized = String(value || '').trim().toLowerCase();
    return rows.find(item => item.code === value || String(item.label).toLowerCase() === normalized)?.code || '';
  }

  referenceLabel(rows: PlatformReferenceOption[], code: string): string {
    return rows.find(item => item.code === code)?.label || code;
  }

  splitStreetAddress(value = '') {
    const address = String(value).trim();
    const match = address.match(/^(av(?:enida)?\.?|jr\.?|jir[oó]n|calle)\s+/i);
    if (!match) return { type: 'Av.', line: address };
    const key = match[1].toLowerCase();
    const type = key.startsWith('jr') || key.startsWith('jir') ? 'Jr.' : key.startsWith('calle') ? 'Calle' : 'Av.';
    return { type, line: address.slice(match[0].length).trim() };
  }

  get addresses() {
    const snap = this.snapshot();
    if (!snap) return [];
    const saved = snap.deliveryAddresses;
    const client = snap.client;
    if (!client?.address) return saved;
    const clientAddress = {
      id: `client-${client.backendId || client.id}`,
      clientId: client.id,
      label: this.i18n.t('buyerRequestBuilder.primaryAddress'),
      address: client.address,
      district: client.district || '',
      province: client.province || '',
      city: (client as any).city || client.province || '',
      reference: client.deliveryReference || '',
      window: client.deliveryPreference || '',
    };
    return saved.some(address => address.address === clientAddress.address) ? saved : [clientAddress, ...saved];
  }

  get selectedAddress() {
    return this.addresses.find(address => address.id === this.selectedAddressId) || this.addresses[0] || null;
  }

  get primaryWarehouse() {
    return {
      name: 'ICISA Lima Cold Hub',
      address: 'Av. Guillermo Dansey 2211, Cercado de Lima, Lima, Perú',
      district: 'Cercado de Lima',
      province: 'Lima',
    };
  }

  get warehouseOriginText(): string {
    return `${this.primaryWarehouse.name}, ${this.primaryWarehouse.address}`;
  }

  get manualAddressText(): string {
    const mainAddress = [this.addressType, this.addressLine].filter(Boolean).join(' ');
    const parts = [
      mainAddress,
      this.referenceLabel(this.districts, this.district),
      this.referenceLabel(this.provinces, this.province),
      this.referenceLabel(this.departments, this.city)
    ];
    return parts.filter(Boolean).join(', ');
  }

  get savedAddressText(): string {
    return this.selectedAddress?.address || this.manualAddressText;
  }

  get deliveryAddressText(): string {
    if (this.deliveryMode === 'current' && this.currentLocation) {
      return this.i18n.t('buyerRequestBuilder.currentCoordinates', {
        lat: this.currentLocation.lat.toFixed(5),
        lng: this.currentLocation.lng.toFixed(5)
      });
    }
    if (this.deliveryMode === 'saved') return this.savedAddressText;
    return this.manualAddressText;
  }

  get deliveryAddressLine(): string {
    if (this.deliveryMode === 'current' && this.currentLocation) return this.deliveryAddressText;
    if (this.deliveryMode === 'saved') return this.selectedAddress?.address || this.addressLine;
    return this.addressLine;
  }

  get mapDestinationQuery(): string {
    if (this.deliveryMode === 'current' && this.currentLocation) {
      return `${this.currentLocation.lat},${this.currentLocation.lng}`;
    }
    return `${this.deliveryAddressText}, Peru`;
  }

  get mapReady(): boolean {
    return Boolean(this.primaryWarehouse.name && this.primaryWarehouse.address && this.deliveryAddressText);
  }

  get mapDirectionsUrl(): string {
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(this.warehouseOriginText)}&destination=${encodeURIComponent(this.mapDestinationQuery)}&travelmode=driving`;
  }

  get mapEmbedUrl(): SafeResourceUrl | null {
    if (!this.mapReady) return null;
    const url = `https://maps.google.com/maps?f=d&source=s_d&saddr=${encodeURIComponent(this.warehouseOriginText)}&daddr=${encodeURIComponent(this.mapDestinationQuery)}&hl=${this.i18n.lang()}&z=12&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  get subtotal(): number {
    return this.cart.total();
  }

  get shippingCost(): number {
    const sub = this.subtotal;
    return sub > 0 ? Math.max(18, Math.min(85, sub * 0.035)) : 0;
  }

  get grandTotal(): number {
    return this.subtotal + this.shippingCost;
  }

  get shippingEta(): string {
    return this.i18n.t('buyerRequestBuilder.shippingEtaValue', { date: this.requestedDeliveryDate });
  }

  get totalUnits(): number {
    return this.cart.items().reduce((sum, item) => sum + Number(item.qty || 0), 0);
  }

  get canContinueProducts(): boolean {
    return this.cart.items().length > 0;
  }

  get minimumDeliveryDateISO(): string {
    return this.nextBusinessDateISO(3);
  }

  get deliveryDateWarning(): string {
    if (!this.requestedDeliveryDate) return this.i18n.t('buyerRequestBuilder.deliveryDateRequired');
    const selected = new Date(`${this.requestedDeliveryDate}T00:00:00`);
    const minimum = new Date(`${this.minimumDeliveryDateISO}T00:00:00`);
    if (selected < minimum) return this.i18n.t('buyerRequestBuilder.deliveryDateMinimum');
    return [0, 6].includes(selected.getDay()) ? this.i18n.t('buyerRequestBuilder.deliveryDateWeekday') : '';
  }

  get canSubmit(): boolean {
    const user = this.user();
    if (!user?.clientId || !this.cart.items().length || !this.deliveryAddressText || this.deliveryDateWarning || this.submittingState) return false;
    if (this.addressFieldsVisible) {
      return Boolean(this.district && this.city && this.province && this.addressLine);
    }
    return true;
  }

  get addressFieldsVisible(): boolean {
    return this.deliveryMode === 'manual';
  }

  get enrichedItems() {
    const products = this.snapshot()?.products || [];
    return this.cart.items().map(item => {
      const product = products.find(p => p.id === item.productId) || {} as any;
      const catalogLinked = Boolean((item as any).catalogItemId || product.catalogItemId);
      const coldType = (item as any).coldType || product.coldType || 'chilled';
      const brandName = (item as any).brandName || product.brandName || product.brand || '';
      const metadata = [item.sku || item.productId, brandName, coldType].filter(Boolean).join(' · ');
      return {
        ...item,
        catalogLinked,
        coldType,
        brandName,
        metadata,
        price: Number(item.price ?? 0),
        stock: product.stock
      };
    });
  }

  get deliverySummary(): string {
    if (this.deliveryMode === 'current' && !this.currentLocation) {
      return this.i18n.t('buyerRequestBuilder.enableLocation');
    }
    return this.i18n.t('buyerRequestBuilder.routeSummary', {
      warehouse: this.primaryWarehouse.name,
      destination: this.deliveryAddressText
    });
  }

  selectCity() {
    if (!this.provinceOptions.some(item => item.code === this.province)) {
      this.province = '';
      this.district = '';
    }
  }

  selectProvince() {
    if (!this.districtOptions.some(item => item.code === this.district)) {
      this.district = '';
    }
  }

  onSavedAddressDropdownChange() {
    this.selectSavedAddress(this.selectedAddressId);
  }

  selectSavedAddress(addressId = '') {
    this.deliveryMode = 'saved';
    this.selectedAddressId = addressId || this.selectedAddress?.id || '';
    const address = this.selectedAddress;
    const client = this.snapshot()?.client;
    if (!address) return;
    this.addressLine = address.address || client?.address || this.addressLine;
    this.district = this.referenceCode(this.districts, (address as any).district || client?.district || this.district);
    this.province = this.referenceCode(this.provinces, (address as any).province || client?.province || this.province);
    const provItem = this.provinces.find(item => item.code === this.province);
    this.city = provItem?.parentCode || this.referenceCode(this.departments, (address as any).city || (client as any)?.city || client?.province || this.city);
    this.reference = (address as any).reference || address.window || client?.deliveryReference || this.reference;
  }

  useManualAddress() {
    this.deliveryMode = 'manual';
    this.locationError = '';
  }

  useCurrentLocation() {
    this.deliveryMode = 'current';
    this.locationError = '';
    if (!navigator.geolocation) {
      this.locationError = this.i18n.t('buyerRequestBuilder.geolocationUnavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position => {
        this.currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.addressLine = this.i18n.t('buyerRequestBuilder.currentCoordinates', {
          lat: position.coords.latitude.toFixed(5),
          lng: position.coords.longitude.toFixed(5)
        });
        const client = this.snapshot()?.client;
        this.district = client?.district || this.district || 'Lima';
        this.province = client?.province || this.province || 'Lima';
        this.city = (client as any)?.city || this.city || 'Lima Metropolitana';
      },
      () => {
        this.locationError = this.i18n.t('buyerRequestBuilder.geolocationFailed');
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 }
    );
  }

  updateCartQty(productId: string, event: Event) {
    const value = Number((event.target as HTMLInputElement).value || 1);
    this.cart.setQty(productId, value);
  }

  goToCatalog() {
    void this.router.navigate(['/portal/product-catalog']);
  }

  submitRequest(): void {
    if (!this.canSubmit) return;
    this.submittingState = true;
    this.submitError = '';

    const payloadComments = [
      this.comments.trim(),
      this.i18n.t('buyerRequestBuilder.shippingEta') + ': ' + this.shippingEta,
      `Origin: ${this.primaryWarehouse.address}`,
    ].filter(Boolean).join('\n');

    this.store.submitPurchaseRequest({
      clientId: this.user()?.clientId || '',
      requestedDeliveryDate: this.requestedDeliveryDate,
      deliveryAddressId: this.selectedAddress?.id || 'manual-address',
      deliveryAddress: this.deliveryAddressLine,
      deliveryDistrict: this.referenceLabel(this.districts, this.district),
      deliveryCity: this.referenceLabel(this.departments, this.city),
      deliveryProvince: this.referenceLabel(this.provinces, this.province),
      paymentOption: this.paymentMode,
      shippingEstimate: this.shippingCost,
      comments: payloadComments,
      items: this.cart.items().map(i => ({ productId: i.productId, qty: i.qty, unit: i.unit })),
    }).subscribe({
      next: (request) => {
        this.cart.clear();
        this.submittingState = false;
        void this.router.navigate(['/portal/purchase-requests']);
      },
      error: (err) => {
        this.submittingState = false;
        this.submitError = err?.response?.data?.detail
          || err?.response?.data?.message
          || err?.nexaMessage
          || err?.message
          || this.i18n.t('buyerRequestBuilder.submitError');
      },
    });
  }

  clientDisplayName(client: any): string {
    return client?.commercialName || client?.name || this.user()?.clientId || this.i18n.t('portal.noClientShort');
  }

  utcDatePlusISO(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  dateFromISO(value: string): Date | null {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  dateToISO(value: Date): string {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return '';
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  nextBusinessDateISO(days: number): string {
    let value = this.utcDatePlusISO(days);
    let date = this.dateFromISO(value);
    if (!date) return value;
    while ([0, 6].includes(date.getDay())) {
      date.setDate(date.getDate() + 1);
      value = this.dateToISO(date);
    }
    return value;
  }
}
