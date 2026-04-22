import axios from '@/lib/utils/axios.customize';
import type { LoginInput } from '@/views/auth/LoginForm/LoginFormSchema';
import type { RegisterInput } from '@/views/auth/RegisterForm/RegisterFormSchema';
import type { IBackendRes, ILoginResponse, IUser } from '@/types/global';

export const loginAPI = (
  data: LoginInput
): Promise<IBackendRes<ILoginResponse>> => {
  return axios.post('/login', data);
};
export const registerAPI = (
  data: RegisterInput
): Promise<IBackendRes<IUser>> => {
  return axios.post('/register', data);
};
export const fetchProfileAPI = (): Promise<IBackendRes<IUser>> => {
  return axios.get('/me');
};
export const logoutAPI = (): Promise<IBackendRes<null>> => {
  return axios.post('/logout');
};
export const refreshTokenAPI = (): Promise<
  IBackendRes<{ accessToken: string }>
> => {
  return axios.post('/refresh');
};
