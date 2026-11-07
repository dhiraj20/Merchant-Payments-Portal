import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Role, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<User | null>(this.loadFromStorage());
  role = computed(() => this.currentUser()?.role ?? null);
  isLoggedIn = computed(() => !!this.currentUser());

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>('/api/auth/login', { email, password }).pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']).catch(() => {
      // navigation may fail in test environments with minimal router config
    });
  }

  refreshToken(): Observable<{ token: string; refreshToken: string }> {
    return this.http
      .post<{ token: string; refreshToken: string }>('/api/auth/refresh', {
        refreshToken: this.currentUser()?.refreshToken,
      })
      .pipe(
        tap(({ token, refreshToken }) => {
          const user = this.currentUser();
          if (user) {
            const updated = { ...user, token, refreshToken };
            this.currentUser.set(updated);
            localStorage.setItem('currentUser', JSON.stringify(updated));
          }
        })
      );
  }

  getToken(): string | null {
    return this.currentUser()?.token ?? null;
  }

  hasRole(...roles: Role[]): boolean {
    const r = this.role();
    return r !== null && roles.includes(r);
  }

  private loadFromStorage(): User | null {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
