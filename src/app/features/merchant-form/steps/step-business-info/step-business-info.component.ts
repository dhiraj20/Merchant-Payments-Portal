import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-step-business-info',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <div [formGroup]="form" class="step-content">
      <div class="form-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Business Name *</mat-label>
          <input matInput formControlName="businessName" placeholder="Acme Corp" />
          @if (form.get('businessName')?.hasError('required') && form.get('businessName')?.touched) {
            <mat-error>Business name is required</mat-error>
          }
        </mat-form-field>
      </div>

      <div class="form-row two-col">
        <mat-form-field appearance="outline">
          <mat-label>Business Type *</mat-label>
          <mat-select formControlName="businessType">
            @for (type of businessTypes; track type) {
              <mat-option [value]="type">{{ type }}</mat-option>
            }
          </mat-select>
          @if (form.get('businessType')?.hasError('required') && form.get('businessType')?.touched) {
            <mat-error>Business type is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Registration Number *</mat-label>
          <input matInput formControlName="registrationNumber" placeholder="REG-123456" />
          @if (form.get('registrationNumber')?.hasError('required') && form.get('registrationNumber')?.touched) {
            <mat-error>Registration number is required</mat-error>
          }
        </mat-form-field>
      </div>

      <div class="form-row two-col">
        <mat-form-field appearance="outline">
          <mat-label>Tax ID (EIN) *</mat-label>
          <input matInput formControlName="taxId" placeholder="12-3456789" />
          @if (form.get('taxId')?.hasError('required') && form.get('taxId')?.touched) {
            <mat-error>Tax ID is required</mat-error>
          }
          @if (form.get('taxId')?.hasError('taxId') && form.get('taxId')?.touched) {
            <mat-error>Format: XX-XXXXXXX</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Website</mat-label>
          <input matInput formControlName="website" placeholder="https://example.com" type="url" />
          @if (form.get('website')?.hasError('url') && form.get('website')?.touched) {
            <mat-error>Enter a valid URL</mat-error>
          }
        </mat-form-field>
      </div>

      <h4 class="section-subtitle">Business Address</h4>
      <div class="form-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Street Address *</mat-label>
          <input matInput formControlName="street" placeholder="123 Main St" />
          @if (form.get('street')?.hasError('required') && form.get('street')?.touched) {
            <mat-error>Street is required</mat-error>
          }
        </mat-form-field>
      </div>

      <div class="form-row three-col">
        <mat-form-field appearance="outline">
          <mat-label>City *</mat-label>
          <input matInput formControlName="city" />
          @if (form.get('city')?.hasError('required') && form.get('city')?.touched) {
            <mat-error>City is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>State *</mat-label>
          <input matInput formControlName="state" placeholder="NY" maxlength="2" />
          @if (form.get('state')?.hasError('required') && form.get('state')?.touched) {
            <mat-error>State is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>ZIP *</mat-label>
          <input matInput formControlName="zip" placeholder="10001" maxlength="10" />
          @if (form.get('zip')?.hasError('required') && form.get('zip')?.touched) {
            <mat-error>ZIP is required</mat-error>
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
    .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .section-subtitle { margin: 16px 0 8px; font-size: 14px; font-weight: 500; color: rgba(0,0,0,0.6); }
    mat-form-field { width: 100%; }
    @media (max-width: 600px) {
      .two-col, .three-col { grid-template-columns: 1fr; }
    }
  `],
})
export class StepBusinessInfoComponent {
  @Input({ required: true }) form!: FormGroup;

  businessTypes = ['Sole Proprietorship', 'LLC', 'Corporation', 'Partnership', 'Non-Profit', 'Other'];
}
