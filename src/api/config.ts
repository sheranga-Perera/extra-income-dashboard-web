import { apiRequest } from './http';

export interface DashboardSettingResponse {
  key: string;
  value: string | null;
  description: string | null;
  updatedAt: string;
}

export interface DashboardSettingPayload {
  value?: string;
  description?: string;
}

export async function listSettings(): Promise<DashboardSettingResponse[]> {
  return apiRequest('/config');
}

export async function saveSetting(key: string, payload: DashboardSettingPayload): Promise<DashboardSettingResponse> {
  return apiRequest(`/config/${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function deleteSetting(key: string): Promise<void> {
  await apiRequest(`/config/${encodeURIComponent(key)}`, {
    method: 'DELETE'
  });
}
