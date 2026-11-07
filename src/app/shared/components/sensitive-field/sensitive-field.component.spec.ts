import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { SensitiveFieldComponent } from './sensitive-field.component';
import { AuthService } from '../../../core/auth/auth.service';

describe('SensitiveFieldComponent', () => {
  let component: SensitiveFieldComponent;
  let fixture: ComponentFixture<SensitiveFieldComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SensitiveFieldComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideAnimationsAsync(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SensitiveFieldComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    component.value = '123-45-6789';
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mask value by default', () => {
    expect(component.revealed()).toBe(false);
    const el = fixture.nativeElement.querySelector('.sensitive-value');
    expect(el.textContent.trim()).not.toContain('123-45-6789');
  });

  it('should not show reveal button for SALES role', () => {
    authService.currentUser.set({
      id: '1', name: 'Sales', email: 'sales@test.com',
      role: 'SALES', token: 'tok', refreshToken: 'ref',
    });
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.reveal-btn');
    expect(btn).toBeNull();
  });

  it('should show reveal button for REVIEWER role', () => {
    authService.currentUser.set({
      id: '2', name: 'Reviewer', email: 'reviewer@test.com',
      role: 'REVIEWER', token: 'tok', refreshToken: 'ref',
    });
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn).not.toBeNull();
  });

  it('should reveal value when ADMIN clicks reveal button', () => {
    authService.currentUser.set({
      id: '3', name: 'Admin', email: 'admin@test.com',
      role: 'ADMIN', token: 'tok', refreshToken: 'ref',
    });
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    fixture.detectChanges();

    expect(component.revealed()).toBe(true);
    const el = fixture.nativeElement.querySelector('.sensitive-value');
    expect(el.textContent.trim()).toContain('123-45-6789');
  });

  it('should toggle back to masked on second click', () => {
    authService.currentUser.set({
      id: '3', name: 'Admin', email: 'admin@test.com',
      role: 'ADMIN', token: 'tok', refreshToken: 'ref',
    });
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button');
    btn.click(); // reveal
    btn.click(); // hide
    fixture.detectChanges();

    expect(component.revealed()).toBe(false);
  });
});
