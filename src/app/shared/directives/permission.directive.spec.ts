import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HasRoleDirective } from './permission.directive';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  standalone: true,
  imports: [HasRoleDirective],
  template: `
    <div *hasRole="['ADMIN']" id="admin-only">Admin Content</div>
    <div *hasRole="['SALES', 'REVIEWER']" id="sales-reviewer">Sales/Reviewer Content</div>
  `,
})
class TestHostComponent {}

describe('HasRoleDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => localStorage.clear());

  it('should not render admin content for SALES role', () => {
    authService.currentUser.set({
      id: '1', name: 'Sales', email: 'sales@test.com',
      role: 'SALES', token: 'tok', refreshToken: 'ref',
    });
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('#admin-only');
    expect(el).toBeNull();
  });

  it('should render admin content for ADMIN role', () => {
    authService.currentUser.set({
      id: '3', name: 'Admin', email: 'admin@test.com',
      role: 'ADMIN', token: 'tok', refreshToken: 'ref',
    });
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('#admin-only');
    expect(el).not.toBeNull();
    expect(el.textContent.trim()).toBe('Admin Content');
  });

  it('should render sales/reviewer content for SALES role', () => {
    authService.currentUser.set({
      id: '1', name: 'Sales', email: 'sales@test.com',
      role: 'SALES', token: 'tok', refreshToken: 'ref',
    });
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('#sales-reviewer');
    expect(el).not.toBeNull();
  });

  it('should not render sales/reviewer content for ADMIN role', () => {
    authService.currentUser.set({
      id: '3', name: 'Admin', email: 'admin@test.com',
      role: 'ADMIN', token: 'tok', refreshToken: 'ref',
    });
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('#sales-reviewer');
    expect(el).toBeNull();
  });
});
