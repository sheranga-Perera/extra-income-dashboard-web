import { apiRequest } from './http';

export interface ActiveAdResponse {
  id: string;
  companyName: string;
  adTitle: string;
  adDescription: string;
  adType: string;
  mediaUrl: string | null;
  mediaContent?: string | null;
  cta: string | null;
  ctaUrl?: string | null;
  viewsPerDay: number | null;
  minutesPerDay: number | null;
  startDate: string | null;
  endDate: string | null;
}

export interface AdRequestPayload {
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone?: string;
  adTitle: string;
  adDescription: string;
  adType: string;
  adGoal?: string;
  mediaUrl?: string;
  mediaContent?: string;
  mediaNotes?: string;
  cta?: string;
  ctaUrl?: string;
  viewsPerDay?: number;
  minutesPerDay?: number;
  startDate?: string;
  endDate?: string;
}

export interface AdRequestResponse extends AdRequestPayload {
  id: string;
  status: string;
  createdAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
}

export interface AdSummaryResponse {
  pending: number;
  approved: number;
  rejected: number;
  discontinued: number;
  active: number;
}

export async function fetchActiveAds(): Promise<ActiveAdResponse[]> {
  return apiRequest('/ads/active');
}

export async function createAdRequest(payload: AdRequestPayload): Promise<AdRequestResponse> {
  return apiRequest('/ads/requests', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function listAdRequests(status?: string): Promise<AdRequestResponse[]> {
  const suffix = status ? `?status=${encodeURIComponent(status)}` : '';
  return apiRequest(`/ads/requests${suffix}`);
}

export async function fetchAdSummary(): Promise<AdSummaryResponse> {
  return apiRequest('/ads/summary');
}

export async function approveAdRequest(id: string, payload?: { startDate?: string; endDate?: string }) {
  return apiRequest<AdRequestResponse>(`/ads/requests/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify(payload ?? {})
  });
}

export async function rejectAdRequest(id: string) {
  return apiRequest<AdRequestResponse>(`/ads/requests/${id}/reject`, {
    method: 'PATCH'
  });
}

export async function discontinueAdRequest(id: string) {
  return apiRequest<AdRequestResponse>(`/ads/requests/${id}/discontinue`, {
    method: 'PATCH'
  });
}
