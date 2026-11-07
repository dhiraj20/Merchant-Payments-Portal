import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationsFilter, MerchantApplication, PagedResult } from '../models/merchant.model';
import { RiskDecision } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class MerchantService {
  private http = inject(HttpClient);

  getApplications(filter: ApplicationsFilter): Observable<PagedResult<MerchantApplication>> {
    let params = new HttpParams()
      .set('_page', filter.page + 1)
      .set('_per_page', filter.pageSize);

    if (filter.status) params = params.set('status', filter.status);
    if (filter.search) params = params.set('businessName_like', filter.search);

    return this.http.get<PagedResult<MerchantApplication>>('/api/applications', { params });
  }

  getApplicationById(id: string): Observable<MerchantApplication> {
    return this.http.get<MerchantApplication>(`/api/applications/${id}`);
  }

  createApplication(data: Partial<MerchantApplication>): Observable<MerchantApplication> {
    return this.http.post<MerchantApplication>('/api/applications', data);
  }

  updateApplication(id: string, data: Partial<MerchantApplication>): Observable<MerchantApplication> {
    return this.http.patch<MerchantApplication>(`/api/applications/${id}`, data);
  }

  submitApplication(id: string): Observable<MerchantApplication> {
    return this.http.patch<MerchantApplication>(`/api/applications/${id}`, {
      status: 'SUBMITTED',
      updatedAt: new Date().toISOString(),
    });
  }

  getRiskDecisions(applicationId: string): Observable<RiskDecision[]> {
    return this.http.get<RiskDecision[]>(`/api/risk_decisions?applicationId=${applicationId}`);
  }

  submitRiskDecision(decision: Omit<RiskDecision, 'id' | 'createdAt'>): Observable<RiskDecision> {
    return this.http.post<RiskDecision>('/api/risk_decisions', {
      ...decision,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    });
  }

  assignReviewer(applicationId: string, reviewerId: string): Observable<MerchantApplication> {
    return this.http.patch<MerchantApplication>(`/api/applications/${applicationId}`, {
      assignedReviewerId: reviewerId,
      status: 'UNDER_REVIEW',
      updatedAt: new Date().toISOString(),
    });
  }
}
