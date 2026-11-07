import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EMPTY, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';

import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

import { StepBusinessInfoComponent } from './steps/step-business-info/step-business-info.component';
import { StepOwnerInfoComponent } from './steps/step-owner-info/step-owner-info.component';
import { StepFinancialComponent } from './steps/step-financial/step-financial.component';
import { StepReviewSubmitComponent } from './steps/step-review-submit/step-review-submit.component';
import { MerchantService } from '../../core/services/merchant.service';
import { DraftService } from '../../core/services/draft.service';
import { AuthService } from '../../core/auth/auth.service';
import {
  accountNotEqualRoutingValidator,
  ageValidator,
  routingNumberValidator,
  ssnFormatValidator,
  taxIdValidator,
  urlValidator,
} from '../../shared/validators/custom-validators';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-merchant-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatStepperModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressBarModule, MatSnackBarModule, MatCardModule,
    StepBusinessInfoComponent, StepOwnerInfoComponent,
    StepFinancialComponent, StepReviewSubmitComponent,
  ],
  templateUrl: './merchant-form.component.html',
  styleUrl: './merchant-form.component.scss',
})
export class MerchantFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private merchantService = inject(MerchantService);
  private draftService = inject(DraftService);
  private auth = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  draftId = signal<string>(crypto.randomUUID());
  isEditMode = signal(false);
  isSubmitting = signal(false);
  saveStatus = signal<SaveStatus>('idle');

  form!: FormGroup;

  get businessInfoForm() { return this.form.get('businessInfo') as FormGroup; }
  get ownerInfoForm() { return this.form.get('ownerInfo') as FormGroup; }
  get financialForm() { return this.form.get('financial') as FormGroup; }

  ngOnInit(): void {
    this.buildForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.draftId.set(id);
      this.isEditMode.set(true);
      this.loadApplication(id);
    } else {
      this.restoreDraft();
    }

    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      businessInfo: this.fb.group({
        businessName: ['', Validators.required],
        businessType: ['', Validators.required],
        registrationNumber: ['', Validators.required],
        taxId: ['', [Validators.required, taxIdValidator()]],
        website: ['', urlValidator()],
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        zip: ['', Validators.required],
      }),
      ownerInfo: this.fb.group({
        ownerName: ['', Validators.required],
        ownerDob: ['', [Validators.required, ageValidator(18)]],
        ownerSsn: ['', [Validators.required, ssnFormatValidator()]],
        ownerEmail: ['', [Validators.required, Validators.email]],
        ownerPhone: ['', Validators.required],
      }),
      financial: this.fb.group(
        {
          bankName: ['', Validators.required],
          bankAccount: ['', [Validators.required, Validators.minLength(8)]],
          routingNumber: ['', [Validators.required, routingNumberValidator()]],
          annualRevenue: [null, [Validators.required, Validators.min(0)]],
          businessAgeYears: [null, [Validators.required, Validators.min(0)]],
          expectedMonthlyVolume: [null, [Validators.required, Validators.min(0)]],
        },
        { validators: accountNotEqualRoutingValidator('bankAccount', 'routingNumber') }
      ),
    });
  }

  private loadApplication(id: string): void {
    this.merchantService.getApplicationById(id).subscribe({
      next: app => this.form.patchValue({
        businessInfo: {
          businessName: app.businessName,
          businessType: app.businessType,
          registrationNumber: app.registrationNumber,
          taxId: app.taxId,
          website: app.website,
          street: app.address?.street,
          city: app.address?.city,
          state: app.address?.state,
          zip: app.address?.zip,
        },
        ownerInfo: {
          ownerName: app.ownerName,
          ownerDob: app.ownerDob,
          ownerSsn: app.ownerSsn,
          ownerEmail: app.ownerEmail,
          ownerPhone: app.ownerPhone,
        },
        financial: {
          bankName: app.bankName,
          bankAccount: app.bankAccount,
          routingNumber: app.routingNumber,
          annualRevenue: app.annualRevenue,
          businessAgeYears: app.businessAgeYears,
          expectedMonthlyVolume: app.expectedMonthlyVolume,
        },
      }, { emitEvent: false }),
      error: () => this.snackBar.open('Failed to load application', 'Close', { duration: 4000 }),
    });
  }

  private restoreDraft(): void {
    const draft = this.draftService.loadDraft(this.draftId());
    if (draft) {
      this.form.patchValue(draft as Record<string, unknown>, { emitEvent: false });
      this.snackBar.open('Draft restored', undefined, { duration: 2000 });
    }
  }

  private setupAutoSave(): void {
    // Instant localStorage save
    this.form.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.destroy$)
    ).subscribe(val => this.draftService.saveDraftLocally(this.draftId(), val));

    // Debounced API sync
    this.form.valueChanges.pipe(
      debounceTime(1500),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      filter(() => this.form.dirty),
      tap(() => this.saveStatus.set('saving')),
      switchMap(value =>
        this.draftService.syncDraftToServer(this.draftId(), value).pipe(
          tap(() => this.saveStatus.set('saved')),
          catchError(() => { this.saveStatus.set('error'); return EMPTY; })
        )
      ),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const payload = {
      businessName: v.businessInfo.businessName,
      businessType: v.businessInfo.businessType,
      registrationNumber: v.businessInfo.registrationNumber,
      taxId: v.businessInfo.taxId,
      website: v.businessInfo.website,
      address: {
        street: v.businessInfo.street,
        city: v.businessInfo.city,
        state: v.businessInfo.state,
        zip: v.businessInfo.zip,
        country: 'US',
      },
      ownerName: v.ownerInfo.ownerName,
      ownerDob: v.ownerInfo.ownerDob instanceof Date
        ? v.ownerInfo.ownerDob.toISOString()
        : v.ownerInfo.ownerDob,
      ownerSsn: v.ownerInfo.ownerSsn,
      ownerEmail: v.ownerInfo.ownerEmail,
      ownerPhone: v.ownerInfo.ownerPhone,
      bankName: v.financial.bankName,
      bankAccount: v.financial.bankAccount,
      routingNumber: v.financial.routingNumber,
      annualRevenue: v.financial.annualRevenue,
      businessAgeYears: v.financial.businessAgeYears,
      expectedMonthlyVolume: v.financial.expectedMonthlyVolume,
      status: 'SUBMITTED' as const,
      createdBy: this.auth.currentUser()?.id ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.merchantService.updateApplication(this.draftId(), { ...payload, status: 'SUBMITTED' })
      : this.merchantService.createApplication(payload);

    request$.pipe(
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: app => {
        this.draftService.clearDraft(this.draftId());
        this.snackBar.open('Application submitted successfully!', 'Close', { duration: 4000 });
        this.router.navigate(['/applications', app.id]);
      },
      error: () => this.snackBar.open('Failed to submit application. Please try again.', 'Close', { duration: 5000 }),
    });
  }

  getSaveStatusLabel(): string {
    switch (this.saveStatus()) {
      case 'saving': return 'Saving…';
      case 'saved': return 'Saved ✓';
      case 'error': return 'Save failed';
      default: return '';
    }
  }

  getSaveStatusColor(): 'primary' | 'warn' | undefined {
    if (this.saveStatus() === 'error') return 'warn';
    if (this.saveStatus() === 'saved') return 'primary';
    return undefined;
  }
}
