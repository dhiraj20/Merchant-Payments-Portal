import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { SensitiveFieldComponent } from '../../../../shared/components/sensitive-field/sensitive-field.component';

@Component({
  selector: 'app-step-review-submit',
  standalone: true,
  imports: [CurrencyPipe, MatExpansionModule, MatIconModule, SensitiveFieldComponent],
  template: `
    <div class="step-content">
      <p class="review-intro">Please review your application before submitting. Sensitive fields are masked.</p>

      <mat-accordion>
        <mat-expansion-panel expanded>
          <mat-expansion-panel-header>
            <mat-panel-title><mat-icon>business</mat-icon> Business Information</mat-panel-title>
          </mat-expansion-panel-header>
          <div class="review-grid">
            <div class="review-item"><span class="label">Business Name</span><span class="value">{{ bi.businessName }}</span></div>
            <div class="review-item"><span class="label">Business Type</span><span class="value">{{ bi.businessType }}</span></div>
            <div class="review-item"><span class="label">Registration #</span><span class="value">{{ bi.registrationNumber }}</span></div>
            <div class="review-item"><span class="label">Tax ID</span><span class="value"><app-sensitive-field [value]="bi.taxId" /></span></div>
            <div class="review-item"><span class="label">Website</span><span class="value">{{ bi.website || '—' }}</span></div>
            <div class="review-item full"><span class="label">Address</span><span class="value">{{ formatAddress(bi) }}</span></div>
          </div>
        </mat-expansion-panel>

        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title><mat-icon>person</mat-icon> Owner Information</mat-panel-title>
          </mat-expansion-panel-header>
          <div class="review-grid">
            <div class="review-item"><span class="label">Name</span><span class="value">{{ oi.ownerName }}</span></div>
            <div class="review-item"><span class="label">Date of Birth</span><span class="value">{{ formatDate(oi.ownerDob) }}</span></div>
            <div class="review-item"><span class="label">SSN</span><span class="value"><app-sensitive-field [value]="oi.ownerSsn" /></span></div>
            <div class="review-item"><span class="label">Email</span><span class="value">{{ oi.ownerEmail }}</span></div>
            <div class="review-item"><span class="label">Phone</span><span class="value">{{ oi.ownerPhone }}</span></div>
          </div>
        </mat-expansion-panel>

        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title><mat-icon>account_balance</mat-icon> Financial Details</mat-panel-title>
          </mat-expansion-panel-header>
          <div class="review-grid">
            <div class="review-item"><span class="label">Bank Name</span><span class="value">{{ fi.bankName }}</span></div>
            <div class="review-item"><span class="label">Account #</span><span class="value"><app-sensitive-field [value]="fi.bankAccount" /></span></div>
            <div class="review-item"><span class="label">Routing #</span><span class="value"><app-sensitive-field [value]="fi.routingNumber" /></span></div>
            <div class="review-item"><span class="label">Annual Revenue</span><span class="value">{{ fi.annualRevenue | currency:'USD':'symbol':'1.0-0' }}</span></div>
            <div class="review-item"><span class="label">Business Age</span><span class="value">{{ fi.businessAgeYears }} year(s)</span></div>
            <div class="review-item"><span class="label">Monthly Volume</span><span class="value">{{ fi.expectedMonthlyVolume | currency:'USD':'symbol':'1.0-0' }}</span></div>
          </div>
        </mat-expansion-panel>
      </mat-accordion>
    </div>
  `,
  styles: [`
    .step-content { padding: 8px 0; }
    .review-intro { color: rgba(0,0,0,0.6); margin-bottom: 16px; font-size: 14px; }
    mat-panel-title { display: flex; align-items: center; gap: 8px; }
    .review-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 12px;
      padding: 8px 0;
    }
    .review-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
      &.full { grid-column: 1 / -1; }
    }
    .label { font-size: 12px; color: rgba(0,0,0,0.5); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { font-size: 14px; color: rgba(0,0,0,0.87); }
  `],
})
export class StepReviewSubmitComponent {
  @Input({ required: true }) form!: FormGroup;

  get bi() { return this.form.get('businessInfo')?.value ?? {}; }
  get oi() { return this.form.get('ownerInfo')?.value ?? {}; }
  get fi() { return this.form.get('financial')?.value ?? {}; }

  formatAddress(bi: Record<string, string>): string {
    return [bi['street'], bi['city'], bi['state'], bi['zip']].filter(Boolean).join(', ') || '—';
  }

  formatDate(d: string | Date | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
