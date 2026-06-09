import { apiRequest } from './http';

export interface AdminUserResponse {
  id: string;
  username: string;
  role: 'ADMIN';
}

export interface AdminUserCreatePayload {
  username: string;
  password: string;
}

export async function listAdmins(): Promise<AdminUserResponse[]> {
  return apiRequest('/admins');
}

export async function createAdmin(payload: AdminUserCreatePayload): Promise<AdminUserResponse> {
  return apiRequest('/admins', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function deleteAdmin(id: string): Promise<void> {
  await apiRequest(`/admins/${id}`, {
    method: 'DELETE'
  });
}
