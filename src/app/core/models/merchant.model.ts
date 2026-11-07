export type AppStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface MerchantApplication {
  id: string;
  businessName: string;
  businessType: string;
  registrationNumber: string;
  taxId: string;           // sensitive
  website: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  ownerName: string;
  ownerDob: string;
  ownerSsn: string;        // sensitive
  ownerEmail: string;
  ownerPhone: string;
  bankName: string;
  bankAccount: string;     // sensitive
  routingNumber: string;
  annualRevenue: number;
  businessAgeYears: number;
  expectedMonthlyVolume: number;
  status: AppStatus;
  assignedReviewerId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApplicationsFilter {
  page: number;
  pageSize: number;
  status?: AppStatus | '';
  search?: string;
}
