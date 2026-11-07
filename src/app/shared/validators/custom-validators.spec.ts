import { FormControl, FormGroup } from '@angular/forms';
import {
  ageValidator,
  accountNotEqualRoutingValidator,
  routingNumberValidator,
  ssnFormatValidator,
  taxIdValidator,
  urlValidator,
} from './custom-validators';

describe('Custom Validators', () => {

  describe('ssnFormatValidator', () => {
    const validator = ssnFormatValidator();

    it('should return null for valid SSN format', () => {
      const ctrl = new FormControl('123-45-6789');
      expect(validator(ctrl)).toBeNull();
    });

    it('should return error for SSN without dashes', () => {
      const ctrl = new FormControl('123456789');
      expect(validator(ctrl)).toEqual({ ssnFormat: true });
    });

    it('should return error for wrong digit counts', () => {
      const ctrl = new FormControl('12-345-6789');
      expect(validator(ctrl)).toEqual({ ssnFormat: true });
    });

    it('should return null for empty value', () => {
      const ctrl = new FormControl('');
      expect(validator(ctrl)).toBeNull();
    });
  });

  describe('ageValidator', () => {
    it('should return null for DOB exactly 18 years ago', () => {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - 18);
      const ctrl = new FormControl(dob.toISOString());
      expect(ageValidator(18)(ctrl)).toBeNull();
    });

    it('should return error for DOB less than 18 years ago', () => {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - 17);
      const ctrl = new FormControl(dob.toISOString());
      const result = ageValidator(18)(ctrl);
      expect(result).not.toBeNull();
      expect(result?.['minAge']).toBeDefined();
    });

    it('should return null for empty value', () => {
      const ctrl = new FormControl('');
      expect(ageValidator(18)(ctrl)).toBeNull();
    });
  });

  describe('routingNumberValidator', () => {
    const validator = routingNumberValidator();

    it('should return null for valid routing number 021000021', () => {
      const ctrl = new FormControl('021000021');
      expect(validator(ctrl)).toBeNull();
    });

    it('should return null for valid routing number 026009593', () => {
      const ctrl = new FormControl('026009593');
      expect(validator(ctrl)).toBeNull();
    });

    it('should return error for routing number wrong length', () => {
      const ctrl = new FormControl('12345');
      expect(validator(ctrl)).toEqual({ routingNumber: true });
    });

    it('should return error for routing number with invalid checksum', () => {
      // 123456789: checksum = 3*(1+4+7) + 7*(2+5+8) + (3+6+9) = 36+105+18 = 159, 159%10 = 9 ≠ 0
      const ctrl = new FormControl('123456789');
      expect(validator(ctrl)).toEqual({ routingNumber: true });
    });

    it('should return null for empty value', () => {
      const ctrl = new FormControl('');
      expect(validator(ctrl)).toBeNull();
    });
  });

  describe('taxIdValidator', () => {
    const validator = taxIdValidator();

    it('should return null for valid EIN format', () => {
      const ctrl = new FormControl('12-3456789');
      expect(validator(ctrl)).toBeNull();
    });

    it('should return error for invalid EIN format', () => {
      const ctrl = new FormControl('123-456789');
      expect(validator(ctrl)).toEqual({ taxId: true });
    });
  });

  describe('urlValidator', () => {
    const validator = urlValidator();

    it('should return null for valid https URL', () => {
      const ctrl = new FormControl('https://example.com');
      expect(validator(ctrl)).toBeNull();
    });

    it('should return error for invalid URL', () => {
      const ctrl = new FormControl('not-a-url');
      expect(validator(ctrl)).toEqual({ url: true });
    });

    it('should return null for empty value', () => {
      const ctrl = new FormControl('');
      expect(validator(ctrl)).toBeNull();
    });
  });

  describe('accountNotEqualRoutingValidator', () => {
    it('should return null when account differs from routing', () => {
      const group = new FormGroup({
        bankAccount: new FormControl('123456789'),
        routingNumber: new FormControl('021000021'),
      });
      const result = accountNotEqualRoutingValidator('bankAccount', 'routingNumber')(group);
      expect(result).toBeNull();
    });

    it('should return error when account equals routing', () => {
      const group = new FormGroup({
        bankAccount: new FormControl('021000021'),
        routingNumber: new FormControl('021000021'),
      });
      const result = accountNotEqualRoutingValidator('bankAccount', 'routingNumber')(group);
      expect(result).toEqual({ accountEqualsRouting: true });
    });
  });
});
