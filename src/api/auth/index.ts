import { API_ROUTES } from '@/constants/api';
import { fetchClient } from '@/api/fetchClient';
import {
  LoginParams,
  LoginResponse,
  TwoFactorConfirmParams,
  TwoFactorEnableResponse,
  TwoFactorRecoveryCodesResponse,
  TwoFactorVerifyParams,
} from '@/api/auth/types';

export const getSession = async () => {
  return await fetchClient(API_ROUTES.AUTH.SESSION);
};

export const login = async (params: LoginParams) => {
  return await fetchClient<LoginResponse>(API_ROUTES.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const logout = async () => {
  return await fetchClient(API_ROUTES.AUTH.LOGOUT, {
    method: 'POST',
  });
};

export const enableTwoFactor = async () => {
  return await fetchClient<TwoFactorEnableResponse>(API_ROUTES.AUTH.TWO_FACTOR_ENABLE, {
    method: 'POST',
  });
};

export const confirmTwoFactor = async (params: TwoFactorConfirmParams) => {
  return await fetchClient(API_ROUTES.AUTH.TWO_FACTOR_CONFIRM, {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const verifyTwoFactor = async (params: TwoFactorVerifyParams) => {
  return await fetchClient(API_ROUTES.AUTH.TWO_FACTOR_VERIFY, {
    method: 'POST',
    body: JSON.stringify(params),
  });
};

export const disableTwoFactor = async () => {
  return await fetchClient(API_ROUTES.AUTH.TWO_FACTOR_DISABLE, {
    method: 'POST',
  });
};

export const regenerateTwoFactorRecoveryCodes = async () => {
  return await fetchClient<TwoFactorRecoveryCodesResponse>(API_ROUTES.AUTH.TWO_FACTOR_RECOVERY_CODES, {
    method: 'POST',
  });
};
