import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatChipsModule, MatDividerModule, MatTooltipModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  auth = inject(AuthService);
  private breakpoints = inject(BreakpointObserver);

  isMobile = toSignal(
    this.breakpoints.observe(Breakpoints.Handset).pipe(map(r => r.matches)),
    { initialValue: false }
  );

  sidenavOpened = signal(true);

  role = this.auth.role;
  userName = computed(() => this.auth.currentUser()?.name ?? '');
  userRole = computed(() => this.auth.role() ?? '');

  toggleSidenav(): void {
    if (this.isMobile()) {
      this.sidenavOpened.update(v => !v);
    }
  }

  logout(): void {
    this.auth.logout();
  }

  getRoleColor(): string {
    const r = this.role();
    if (r === 'ADMIN') return 'warn';
    if (r === 'REVIEWER') return 'accent';
    return 'primary';
  }
}
