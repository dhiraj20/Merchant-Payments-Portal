import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpStatusCode, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { tokenRefreshInterceptor } from './token-refresh.interceptor';
import { AuthService } from './auth.service';

describe('tokenRefreshInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenRefreshInterceptor])),
        provideHttpClientTesting(),
        provideRouter([], withNavigationErrorHandler(() => {})),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should attach Bearer token when user is logged in', () => {
    // Simulate logged-in state
    authService.currentUser.set({
      id: '1', name: 'Sales', email: 'sales@test.com',
      role: 'SALES', token: 'my-token', refreshToken: 'my-refresh',
    });

    http.get('/api/applications').subscribe();

    const req = httpMock.expectOne('/api/applications');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush([]);
  });

  it('should not attach token when user is not logged in', () => {
    http.get('/api/applications').subscribe();
    const req = httpMock.expectOne('/api/applications');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush([]);
  });

  it('should call refresh endpoint and replay request on 401', () => {
    authService.currentUser.set({
      id: '1', name: 'Sales', email: 'sales@test.com',
      role: 'SALES', token: 'expired-token', refreshToken: 'refresh-token',
    });

    http.get('/api/applications').subscribe();

    // First request returns 401
    const req = httpMock.expectOne('/api/applications');
    req.flush({ message: 'Unauthorized' }, { status: HttpStatusCode.Unauthorized, statusText: 'Unauthorized' });

    // Interceptor calls refresh
    const refreshReq = httpMock.expectOne('/api/auth/refresh');
    expect(refreshReq.request.body).toEqual({ refreshToken: 'refresh-token' });
    refreshReq.flush({ token: 'new-token', refreshToken: 'new-refresh' });

    // Replayed request with new token
    const replayedReq = httpMock.expectOne('/api/applications');
    expect(replayedReq.request.headers.get('Authorization')).toBe('Bearer new-token');
    replayedReq.flush([]);
  });

  it('should logout when refresh token fails', () => {
    const logoutSpy = vi.spyOn(authService, 'logout');
    authService.currentUser.set({
      id: '1', name: 'Sales', email: 'sales@test.com',
      role: 'SALES', token: 'expired-token', refreshToken: 'bad-refresh',
    });

    http.get('/api/applications').subscribe({ error: () => {} });

    httpMock.expectOne('/api/applications').flush(
      { message: 'Unauthorized' },
      { status: HttpStatusCode.Unauthorized, statusText: 'Unauthorized' }
    );

    httpMock.expectOne('/api/auth/refresh').flush(
      { message: 'Invalid refresh' },
      { status: HttpStatusCode.Unauthorized, statusText: 'Unauthorized' }
    );

    expect(logoutSpy).toHaveBeenCalled();
  });
});
