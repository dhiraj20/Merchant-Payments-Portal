import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-step-owner-info',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatIconModule, MatButtonModule],
  template: `
    <div [formGroup]="form" class="step-content">
      <div class="form-row">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Owner Full Name *</mat-label>
          <input matInput formControlName="ownerName" placeholder="John Doe" autocomplete="name" />
          @if (form.get('ownerName')?.hasError('required') && form.get('ownerName')?.touched) {
            <mat-error>Owner name is required</mat-error>
          }
        </mat-form-field>
      </div>

      <div class="form-row two-col">
        <mat-form-field appearance="outline">
          <mat-label>Date of Birth *</mat-label>
          <input matInput [matDatepicker]="dobPicker" formControlName="ownerDob" autocomplete="bday" />
          <mat-datepicker-toggle matIconSuffix [for]="dobPicker" aria-label="Open calendar"></mat-datepicker-toggle>
          <mat-datepicker #dobPicker startView="multi-year"></mat-datepicker>
          @if (form.get('ownerDob')?.hasError('required') && form.get('ownerDob')?.touched) {
            <mat-error>Date of birth is required</mat-error>
          }
          @if (form.get('ownerDob')?.hasError('minAge') && form.get('ownerDob')?.touched) {
            <mat-error>Owner must be at least 18 years old</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>SSN *</mat-label>
          <input matInput formControlName="ownerSsn" placeholder="123-45-6789"
            [type]="showSsn ? 'text' : 'password'" autocomplete="off" />
          <button mat-icon-button matSuffix type="button"
            (click)="showSsn = !showSsn" [attr.aria-label]="showSsn ? 'Hide SSN' : 'Show SSN'">
            <mat-icon>{{ showSsn ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (form.get('ownerSsn')?.hasError('required') && form.get('ownerSsn')?.touched) {
            <mat-error>SSN is required</mat-error>
          }
          @if (form.get('ownerSsn')?.hasError('ssnFormat') && form.get('ownerSsn')?.touched) {
            <mat-error>Format: XXX-XX-XXXX</mat-error>
          }
        </mat-form-field>
      </div>

      <div class="form-row two-col">
        <mat-form-field appearance="outline">
          <mat-label>Email *</mat-label>
          <input matInput formControlName="ownerEmail" type="email" placeholder="john@example.com" autocomplete="email" />
          @if (form.get('ownerEmail')?.hasError('required') && form.get('ownerEmail')?.touched) {
            <mat-error>Email is required</mat-error>
          }
          @if (form.get('ownerEmail')?.hasError('email') && form.get('ownerEmail')?.touched) {
            <mat-error>Enter a valid email</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Phone *</mat-label>
          <input matInput formControlName="ownerPhone" type="tel" placeholder="+1 (555) 000-0000" autocomplete="tel" />
          @if (form.get('ownerPhone')?.hasError('required') && form.get('ownerPhone')?.touched) {
            <mat-error>Phone number is required</mat-error>
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
    @media (max-width: 600px) { .two-col { grid-template-columns: 1fr; } }
  `],
})
export class StepOwnerInfoComponent {
  @Input({ required: true }) form!: FormGroup;
  showSsn = false;
}
