import { Component, Input, computed, inject, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-sensitive-field',
  standalone: true,
  imports: [MatIconButton, MatIcon, MatTooltip],
  template: `
    <span class="sensitive-wrapper">
      <span class="sensitive-value" [attr.aria-label]="revealed() ? 'Sensitive value revealed' : 'Sensitive value masked'">
        @if (revealed()) {
          {{ value }}
        } @else {
          {{ masked() }}
        }
      </span>
      @if (canReveal()) {
        <button
          mat-icon-button
          class="reveal-btn"
          (click)="toggle()"
          [matTooltip]="revealed() ? 'Hide' : 'Reveal'"
          [attr.aria-label]="revealed() ? 'Hide sensitive value' : 'Reveal sensitive value'"
        >
          <mat-icon>{{ revealed() ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
      }
    </span>
  `,
  styles: [`
    .sensitive-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .sensitive-value {
      font-family: monospace;
      letter-spacing: 2px;
    }
    .reveal-btn {
      width: 24px;
      height: 24px;
      line-height: 24px;
    }
    .reveal-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `],
})
export class SensitiveFieldComponent {
  @Input() value = '';
  @Input() maskChar = '•';
  @Input() revealRoles: Role[] = ['ADMIN', 'REVIEWER'];

  private auth = inject(AuthService);

  revealed = signal(false);
  canReveal = computed(() => this.auth.hasRole(...this.revealRoles));
  masked = computed(() => this.maskChar.repeat(Math.min(this.value.length || 8, 12)));

  toggle(): void {
    if (this.canReveal()) this.revealed.update(v => !v);
  }
}
