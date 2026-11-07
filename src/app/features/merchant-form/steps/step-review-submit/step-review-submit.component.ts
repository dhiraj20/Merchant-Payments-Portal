import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { SensitiveFieldComponent } from '../../../../shared/components/sensitive-field/sensitive-field.component';

@Component({
  selector: 'app-step-review-submit',
  standalone: true,
  imports: [CurrencyPipe, MatExpansionModule, MatIconModule, SensitiveFieldComponent],
  templateUrl: './step-review-submit.component.html',
  styleUrl: './step-review-submit.component.scss',
})
export class StepReviewSubmitComponent {
  @Input({ required: true }) form!: FormGroup;

  get bi() { return this.form.get('businessInfo')?.value ?? {}; }
  get oi() { return this.form.get('ownerInfo')?.value ?? {}; }
  get fi() { return this.form.get('financial')?.value ?? {}; }

  formatAddress(bi: Record<string, string>): string {
    return [bi['street'], bi['city'], bi['state'], bi['zip']].filter(Boolean).join(', ') || '—';
  }

  formatDate(d: string | Date | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
