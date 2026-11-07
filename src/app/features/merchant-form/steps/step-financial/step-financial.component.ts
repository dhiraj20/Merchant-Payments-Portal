import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-step-financial',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatButtonModule],
  template: `
    <div [formGroup]="form" class="step-content">
      <div class="form-row two-col">
        <mat-form-field appearance="outline">
          <mat-label>Bank Name *</mat-label>
          <input matInput formControlName="bankName" placeholder="Chase Bank" />
          @if (form.get('bankName')?.hasError('required') && form.get('bankName')?.touched) {
            <mat-error>Bank name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Account Number *</mat-label>
          <input matInput formControlName="bankAccount" [type]="showAccount ? 'text' : 'password'"
            placeholder="000123456789" autocomplete="off" />
          <button mat-icon-button matSuffix type="button"
            (click)="showAccount = !showAccount" [attr.aria-label]="showAccount ? 'Hide' : 'Show'">
            <mat-icon>{{ showAccount ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.get('bankAccount')?.hasError('required') && form.get('bankAccount')?.touched) {
            <mat-error>Account number is required</mat-error>
          }
          @if (form.get('bankAccount')?.hasError('minlength') && form.get('bankAccount')?.touched) {
            <mat-error>Minimum 8 digits required</mat-error>
          }
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Routing Number *</mat-label>
          <input matInput formControlName="routingNumber" placeholder="021000021" maxlength="9" autocomplete="off" />
          @if (form.get('routingNumber')?.hasError('required') && form.get('routingNumber')?.touched) {
            <mat-error>Routing number is required</mat-error>
          }
          @if (form.get('routingNumber')?.hasError('routingNumber') && form.get('routingNumber')?.touched) {
            <mat-error>Enter a valid 9-digit routing number</mat-error>
          }
        </mat-form-field>
      </div>

      @if (form.hasError('accountEqualsRouting') && form.touched) {
        <div class="cross-field-error">Account number and routing number cannot be the same</div>
      }

      <div class="form-row two-col">
        <mat-form-field appearance="outline">
          <mat-label>Annual Revenue ($) *</mat-label>
          <input matInput formControlName="annualRevenue" type="number" min="0" placeholder="500000" />
          @if (form.get('annualRevenue')?.hasError('required') && form.get('annualRevenue')?.touched) {
            <mat-error>Annual revenue is required</mat-error>
          }
          @if (form.get('annualRevenue')?.hasError('min') && form.get('annualRevenue')?.touched) {
            <mat-error>Must be a positive value</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Business Age (years) *</mat-label>
          <input matInput formControlName="businessAgeYears" type="number" min="0" placeholder="5" />
          @if (form.get('businessAgeYears')?.hasError('required') && form.get('businessAgeYears')?.touched) {
            <mat-error>Business age is required</mat-error>
          }
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Expected Monthly Volume ($) *</mat-label>
          <input matInput formControlName="expectedMonthlyVolume" type="number" min="0" placeholder="50000" />
          @if (form.get('expectedMonthlyVolume')?.hasError('required') && form.get('expectedMonthlyVolume')?.touched) {
            <mat-error>Expected monthly volume is required</mat-error>
          }
        </mat-form-field>
      </div>
    </div>
  `,
  styles: [`
    .step-content { padding: 8px 0; }
    .form-row { margin-bottom: 8px; }
    .full-width { width: 100%; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    mat-form-field { width: 100%; }
    .cross-field-error { color: #c62828; font-size: 12px; margin: -4px 0 12px 16px; }
    @media (max-width: 600px) { .two-col { grid-template-columns: 1fr; } }
  `],
})
export class StepFinancialComponent {
  @Input({ required: true }) form!: FormGroup;
  showAccount = false;
}
