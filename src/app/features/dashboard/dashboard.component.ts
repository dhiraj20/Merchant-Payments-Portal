import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, combineLatest } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MerchantService } from '../../core/services/merchant.service';
import { AuthService } from '../../core/auth/auth.service';
import { AppStatus, MerchantApplication } from '../../core/models/merchant.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatChipsModule, MatCardModule, MatTooltipModule,
    StatusBadgeComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private merchantService = inject(MerchantService);
  auth = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  applications = signal<MerchantApplication[]>([]);
  totalCount = signal(0);
  isLoading = signal(false);
  error = signal<string | null>(null);
  pageIndex = signal(0);
  pageSize = signal(10);
  statusFilter = signal<AppStatus | ''>('');
  searchControl = new FormControl('');

  // toObservable MUST be declared as class fields (injection context)
  private statusFilter$ = toObservable(this.statusFilter);
  private page$ = toObservable(computed(() => ({ page: this.pageIndex(), pageSize: this.pageSize() })));

  displayedColumns = computed(() => {
    const cols = ['businessName', 'businessType', 'status', 'createdAt', 'actions'];
    if (this.auth.hasRole('ADMIN', 'REVIEWER')) cols.splice(3, 0, 'assignedReviewer');
    return cols;
  });

  readonly statuses: Array<{ value: AppStatus | ''; label: string }> = [
    { value: '', label: 'All Statuses' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  ngOnInit(): void {
    const search$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(400),
      distinctUntilChanged()
    );

    combineLatest([search$, this.statusFilter$, this.page$])
      .pipe(
        debounceTime(50),
        switchMap(([search, status, { page, pageSize }]) => {
          this.isLoading.set(true);
          this.error.set(null);
          return this.merchantService.getApplications({ page, pageSize, status, search: search ?? '' }).pipe(
            catchError(err => {
              this.error.set(err?.message ?? 'Failed to load applications. Please try again.');
              return EMPTY;
            }),
            finalize(() => this.isLoading.set(false))
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(result => {
        this.applications.set(result.data ?? []);
        this.totalCount.set(result.total ?? 0);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onStatusChange(status: AppStatus | ''): void {
    this.statusFilter.set(status);
    this.pageIndex.set(0);
  }

  retry(): void {
    this.error.set(null);
    this.pageIndex.set(this.pageIndex());
  }

  viewDetail(id: string): void {
    this.router.navigate(['/applications', id]);
  }

  editApplication(id: string): void {
    this.router.navigate(['/applications', id, 'edit']);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
