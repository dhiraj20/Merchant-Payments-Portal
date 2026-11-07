import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-step-business-info',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './step-business-info.component.html',
  styleUrl: './step-business-info.component.scss',
})
export class StepBusinessInfoComponent {
  @Input({ required: true }) form!: FormGroup;

  businessTypes = ['Sole Proprietorship', 'LLC', 'Corporation', 'Partnership', 'Non-Profit', 'Other'];
}
