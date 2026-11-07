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
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Admin — Application Assignments</h1>
      </div>

      @if (isLoading()) {
        <div class="loading-overlay"><mat-spinner /></div>
      } @else {
        <mat-card>
          <mat-card-content>
            <table mat-table [dataSource]="applications()" aria-label="Applications pending assignment">
              <ng-container matColumnDef="businessName">
                <th mat-header-cell *matHeaderCellDef>Business Name</th>
                <td mat-cell *matCellDef="let row">
                  <a [routerLink]="['/applications', row.id]" class="link">{{ row.businessName }}</a>
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let row"><app-status-badge [status]="row.status" /></td>
              </ng-container>

              <ng-container matColumnDef="assignedTo">
                <th mat-header-cell *matHeaderCellDef>Assigned Reviewer</th>
                <td mat-cell *matCellDef="let row">
                  <mat-form-field appearance="outline" class="reviewer-select">
                    <mat-select [value]="row.assignedReviewerId ?? ''"
                      (selectionChange)="assign(row, $event.value)"
                      aria-label="Assign reviewer">
                      <mat-option value="">— Unassigned —</mat-option>
                      @for (r of reviewers; track r.id) {
                        <mat-option [value]="r.id">{{ r.name }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </td>
              </ng-container>

              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Created</th>
                <td mat-cell *matCellDef="let row">{{ formatDate(row.createdAt) }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell no-data" colspan="4">No submitted applications to assign.</td>
              </tr>
            </table>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; .page-title { margin: 0; font-size: 24px; font-weight: 500; } }
    .reviewer-select { width: 220px; }
    .link { color: #1565c0; text-decoration: none; &:hover { text-decoration: underline; } }
    .no-data { text-align: center; padding: 32px; color: rgba(0,0,0,0.5); }
    table { width: 100%; }
  `],
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
