import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../core/auth/auth.service';
import { MerchantService } from '../../core/services/merchant.service';
import { of, throwError } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: AuthService;
  let merchantService: MerchantService;

  const mockPagedResult = {
    data: [
      { id: 'app-001', businessName: 'Acme', businessType: 'LLC', status: 'SUBMITTED',
        createdAt: '2026-10-01T10:00:00Z', assignedReviewerId: null },
    ],
    total: 1, page: 0, pageSize: 10,
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideAnimationsAsync(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    merchantService = TestBed.inject(MerchantService);

    authService.currentUser.set({
      id: '1', name: 'Sales', email: 'sales@test.com',
      role: 'SALES', token: 'tok', refreshToken: 'ref',
    });
  });

  afterEach(() => localStorage.clear());

  it('should create', () => {
    vi.spyOn(merchantService, 'getApplications').mockReturnValue(of(mockPagedResult as any));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display loading spinner when isLoading is true', () => {
    vi.spyOn(merchantService, 'getApplications').mockReturnValue(of(mockPagedResult as any));
    component.isLoading.set(true);
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).not.toBeNull();
  });

  it('should show error banner when error signal is set', () => {
    vi.spyOn(merchantService, 'getApplications').mockReturnValue(of(mockPagedResult as any));
    fixture.detectChanges();
    component.error.set('Something went wrong');
    component.isLoading.set(false);
    fixture.detectChanges();
    const errorBanner = fixture.nativeElement.querySelector('.error-banner');
    expect(errorBanner).not.toBeNull();
  });

  it('should show retry button when error is set', () => {
    vi.spyOn(merchantService, 'getApplications').mockReturnValue(of(mockPagedResult as any));
    fixture.detectChanges();
    component.error.set('Network error');
    component.isLoading.set(false);
    fixture.detectChanges();
    const retryBtn = fixture.nativeElement.querySelector('.error-banner button');
    expect(retryBtn).not.toBeNull();
    expect(retryBtn.textContent).toContain('Retry');
  });

  it('should not show edit button for REVIEWER role', async () => {
    authService.currentUser.set({
      id: '2', name: 'Reviewer', email: 'reviewer@test.com',
      role: 'REVIEWER', token: 'tok', refreshToken: 'ref',
    });
    vi.spyOn(merchantService, 'getApplications').mockReturnValue(of(mockPagedResult as any));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const editBtn = fixture.nativeElement.querySelector('[aria-label="Edit application"]');
    expect(editBtn).toBeNull();
  });

  it('should update pageIndex signal on page change', () => {
    component.onPageChange({ pageIndex: 2, pageSize: 10, length: 100, previousPageIndex: 1 });
    expect(component.pageIndex()).toBe(2);
  });

  it('should reset pageIndex when status filter changes', () => {
    component.pageIndex.set(3);
    component.onStatusChange('APPROVED');
    expect(component.pageIndex()).toBe(0);
    expect(component.statusFilter()).toBe('APPROVED');
  });

  it('should include assignedReviewer column for ADMIN role', () => {
    authService.currentUser.set({
      id: '3', name: 'Admin', email: 'admin@test.com',
      role: 'ADMIN', token: 'tok', refreshToken: 'ref',
    });
    vi.spyOn(merchantService, 'getApplications').mockReturnValue(of(mockPagedResult as any));
    fixture.detectChanges();
    expect(component.displayedColumns()).toContain('assignedReviewer');
  });

  it('should not include assignedReviewer column for SALES role', () => {
    vi.spyOn(merchantService, 'getApplications').mockReturnValue(of(mockPagedResult as any));
    fixture.detectChanges();
    expect(component.displayedColumns()).not.toContain('assignedReviewer');
  });
});
