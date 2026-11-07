import { Component, Input } from '@angular/core';
import { MatChip } from '@angular/material/chips';
import { AppStatus } from '../../../core/models/merchant.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [MatChip],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  @Input() status: AppStatus = 'DRAFT';

  get label(): string {
    return this.status.replace('_', ' ');
  }
}
