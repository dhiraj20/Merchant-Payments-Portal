export interface RiskDecision {
  id: string;
  applicationId: string;
  reviewerId: string;
  reviewerName: string;
  decision: 'APPROVED' | 'REJECTED';
  notes: string;
  createdAt: string;
}
