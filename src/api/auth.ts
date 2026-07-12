import client from './client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  currency: string;
  currencySymbol: string;
  monthlyIncome: number;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/register', { name, email, password });
  return data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/login', { email, password });
  return data;
};

export const getMe = async (): Promise<AuthUser> => {
  const { data } = await client.get<AuthUser>('/auth/me');
  return data;
};

export const updateProfile = async (profile: Partial<AuthUser>): Promise<AuthUser> => {
  const { data } = await client.put<AuthUser>('/profile', profile);
  return data;
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await client.put('/profile/password', { currentPassword, newPassword });
};
