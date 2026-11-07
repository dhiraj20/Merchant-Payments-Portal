import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

const mockUser: User = {
  id: '1', name: 'Sales User', email: 'sales@test.com',
  role: 'SALES', token: 'token-abc', refreshToken: 'refresh-abc',
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([], withNavigationErrorHandler(() => {})),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with null currentUser', () => {
    expect(service.currentUser()).toBeNull();
  });

  it('should set currentUser signal on successful login', () => {
    service.login('sales@test.com', 'pass').subscribe();
    const req = httpMock.expectOne('/api/auth/login');
    req.flush(mockUser);
    expect(service.currentUser()).toEqual(mockUser);
  });

  it('should persist user to localStorage on login', () => {
    service.login('sales@test.com', 'pass').subscribe();
    httpMock.expectOne('/api/auth/login').flush(mockUser);
    const stored = JSON.parse(localStorage.getItem('currentUser')!);
    expect(stored.email).toBe('sales@test.com');
  });

  it('should derive role from currentUser signal', () => {
    service.login('sales@test.com', 'pass').subscribe();
    httpMock.expectOne('/api/auth/login').flush(mockUser);
    expect(service.role()).toBe('SALES');
  });

  it('should return true for isLoggedIn when user is set', () => {
    service.login('sales@test.com', 'pass').subscribe();
    httpMock.expectOne('/api/auth/login').flush(mockUser);
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should clear currentUser and localStorage on logout', () => {
    service.login('sales@test.com', 'pass').subscribe();
    httpMock.expectOne('/api/auth/login').flush(mockUser);
    service.logout();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('currentUser')).toBeNull();
  });

  it('should return correct role from computed signal for ADMIN', () => {
    const adminUser = { ...mockUser, role: 'ADMIN' as const };
    service.login('admin@test.com', 'pass').subscribe();
    httpMock.expectOne('/api/auth/login').flush(adminUser);
    expect(service.role()).toBe('ADMIN');
  });

  it('hasRole should return true for matching role', () => {
    service.login('sales@test.com', 'pass').subscribe();
    httpMock.expectOne('/api/auth/login').flush(mockUser);
    expect(service.hasRole('SALES')).toBe(true);
    expect(service.hasRole('ADMIN')).toBe(false);
  });

  it('hasRole should support multiple roles', () => {
    service.login('sales@test.com', 'pass').subscribe();
    httpMock.expectOne('/api/auth/login').flush(mockUser);
    expect(service.hasRole('SALES', 'ADMIN')).toBe(true);
  });
});
