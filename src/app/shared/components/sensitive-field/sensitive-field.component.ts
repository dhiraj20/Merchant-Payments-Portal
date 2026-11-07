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
  templateUrl: './sensitive-field.component.html',
  styleUrl: './sensitive-field.component.scss',
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
