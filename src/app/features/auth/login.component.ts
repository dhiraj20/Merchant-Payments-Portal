import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-icon mat-card-avatar class="brand-icon">account_balance</mat-icon>
          <mat-card-title>Merchant Payments Portal</mat-card-title>
          <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="login()" class="login-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email"
                placeholder="user@example.com" autocomplete="email" />
              <mat-icon matSuffix>email</mat-icon>
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password"
                [type]="showPassword ? 'text' : 'password'" autocomplete="current-password" />
              <button mat-icon-button matSuffix type="button"
                (click)="showPassword = !showPassword"
                [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            @if (error()) {
              <div class="login-error" role="alert">
                <mat-icon>error_outline</mat-icon>
                {{ error() }}
              </div>
            }

            <button mat-raised-button color="primary" type="submit"
              class="full-width submit-btn" [disabled]="form.invalid || isLoading()">
              @if (isLoading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Sign In
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-footer>
          <div class="demo-credentials">
            <strong>Demo credentials:</strong>
            <div class="cred-row">sales&#64;test.com / pass <em>(SALES)</em></div>
            <div class="cred-row">reviewer&#64;test.com / pass <em>(REVIEWER)</em></div>
            <div class="cred-row">admin&#64;test.com / pass <em>(ADMIN)</em></div>
          </div>
        </mat-card-footer>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
      padding: 16px;
    }
    .login-card { width: 100%; max-width: 420px; }
    .brand-icon { font-size: 36px; width: 36px; height: 36px; color: #1565c0; }
    .login-form { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
    .full-width { width: 100%; }
    .submit-btn { height: 48px; font-size: 16px; }
    .login-error {
      display: flex; align-items: center; gap: 8px;
      background: #ffebee; border-radius: 4px; padding: 10px 12px;
      color: #c62828; font-size: 14px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .demo-credentials {
      padding: 12px 16px;
      background: #f5f5f5;
      border-top: 1px solid rgba(0,0,0,0.12);
      font-size: 12px;
      color: rgba(0,0,0,0.6);
      .cred-row { margin-top: 4px; }
      em { color: rgba(0,0,0,0.4); }
    }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  error = signal<string | null>(null);
  showPassword = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  login(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading.set(true);
    this.error.set(null);

    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.isLoading.set(false);
        this.error.set(err?.error?.message ?? 'Invalid credentials. Please try again.');
      },
    });
  }
}
