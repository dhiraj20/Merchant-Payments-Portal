import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MerchantService } from '../../core/services/merchant.service';
import { MerchantApplication } from '../../core/models/merchant.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

const REVIEWERS = [
  { id: '2', name: 'Reviewer User' },
];

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatSnackBarModule, MatProgressSpinnerModule,
    StatusBadgeComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  private merchantService = inject(MerchantService);
  private snackBar = inject(MatSnackBar);

  applications = signal<MerchantApplication[]>([]);
  isLoading = signal(true);
  reviewers = REVIEWERS;
  displayedColumns = ['businessName', 'status', 'assignedTo', 'createdAt'];

  ngOnInit(): void {
    this.merchantService.getApplications({ page: 0, pageSize: 100, status: 'SUBMITTED' }).subscribe({
      next: result => { this.applications.set(result.data ?? []); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  assign(app: MerchantApplication, reviewerId: string): void {
    this.merchantService.assignReviewer(app.id, reviewerId).subscribe({
      next: () => this.snackBar.open('Reviewer assigned!', undefined, { duration: 2000 }),
      error: () => this.snackBar.open('Assignment failed', 'Close', { duration: 3000 }),
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
