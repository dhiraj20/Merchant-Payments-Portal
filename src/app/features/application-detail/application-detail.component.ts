import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MerchantService } from '../../core/services/merchant.service';
import { AuthService } from '../../core/auth/auth.service';
import { MerchantApplication } from '../../core/models/merchant.model';
import { RiskDecision } from '../../core/models/review.model';
import { SensitiveFieldComponent } from '../../shared/components/sensitive-field/sensitive-field.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule, MatDividerModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule,
    MatTableModule, MatChipsModule, MatSnackBarModule, MatDialogModule,
    CurrencyPipe, SensitiveFieldComponent, StatusBadgeComponent,
  ],
  templateUrl: './application-detail.component.html',
  styleUrl: './application-detail.component.scss',
})
export class ApplicationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private merchantService = inject(MerchantService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  auth = inject(AuthService);

  application = signal<MerchantApplication | null>(null);
  riskHistory = signal<RiskDecision[]>([]);
  isLoading = signal(true);
  isDeciding = signal(false);
  error = signal<string | null>(null);

  reviewForm!: FormGroup;
  riskColumns = ['createdAt', 'reviewerName', 'decision', 'notes'];

  ngOnInit(): void {
    this.reviewForm = this.fb.group({ notes: ['', Validators.required] });

    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadApplication(id);
  }

  private loadApplication(id: string): void {
    this.isLoading.set(true);
    this.merchantService.getApplicationById(id).subscribe({
      next: app => {
        this.application.set(app);
        this.loadRiskHistory(id);
      },
      error: () => {
        this.error.set('Failed to load application');
        this.isLoading.set(false);
      },
    });
  }

  private loadRiskHistory(id: string): void {
    this.merchantService.getRiskDecisions(id).subscribe({
      next: decisions => {
        this.riskHistory.set(decisions);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  approve(): void {
    if (this.reviewForm.invalid) { this.reviewForm.markAllAsTouched(); return; }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Approve Application', message: 'Are you sure you want to approve this application?', confirmLabel: 'Approve', confirmColor: 'primary' },
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) this.submitDecision('APPROVED');
    });
  }

  reject(): void {
    if (this.reviewForm.invalid) { this.reviewForm.markAllAsTouched(); return; }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Reject Application', message: 'Are you sure you want to reject this application?', confirmLabel: 'Reject', confirmColor: 'warn' },
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) this.submitDecision('REJECTED');
    });
  }

  private submitDecision(decision: 'APPROVED' | 'REJECTED'): void {
    const app = this.application();
    if (!app) return;

    this.isDeciding.set(true);
    this.merchantService.submitRiskDecision({
      applicationId: app.id,
      reviewerId: this.auth.currentUser()!.id,
      reviewerName: this.auth.currentUser()!.name,
      decision,
      notes: this.reviewForm.value.notes,
    }).pipe(finalize(() => this.isDeciding.set(false))).subscribe({
      next: () => {
        this.snackBar.open(`Application ${decision.toLowerCase()}!`, 'Close', { duration: 4000 });
        this.reviewForm.reset();
        this.loadApplication(app.id);
      },
      error: () => this.snackBar.open('Decision failed. Please try again.', 'Close', { duration: 4000 }),
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
