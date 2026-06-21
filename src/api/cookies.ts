"use client";

import type { SnowflakeId } from "@/api/tenants/types";
import { COOKIES } from "@/constants/storage";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

export const getXsrfToken = () => {
  return getCookie(COOKIES.XSRF_TOKEN)?.toString() ?? "";
};

export const getXTenant = () => {
  return getCookie(COOKIES.X_Tenant)?.toString() ?? "";
};

export const updateXTenant = (tenantId: SnowflakeId) => {
  if (tenantId) setCookie(COOKIES.X_Tenant, tenantId);
};

export const deleteXTenant = () => {
  deleteCookie(COOKIES.X_Tenant);
};
