import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function ssnFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
    return ssnPattern.test(control.value) ? null : { ssnFormat: true };
  };
}

export function ageValidator(minAge = 18): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const dob = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear() -
      (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
    return age >= minAge ? null : { minAge: { required: minAge, actual: age } };
  };
}

export function routingNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const routing = control.value.replace(/\D/g, '');
    return routing.length === 9 ? null : { routingNumber: true };
  };
}

export function urlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    try {
      new URL(control.value);
      return null;
    } catch {
      return { url: true };
    }
  };
}

export function taxIdValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const einPattern = /^\d{2}-\d{7}$/;
    return einPattern.test(control.value) ? null : { taxId: true };
  };
}

export function accountNotEqualRoutingValidator(accountField: string, routingField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const account = group.get(accountField)?.value;
    const routing = group.get(routingField)?.value;
    if (!account || !routing) return null;
    return account === routing ? { accountEqualsRouting: true } : null;
  };
}
