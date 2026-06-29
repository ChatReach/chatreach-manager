export interface AdminUser {
  id: string;
  firstname: string;
  lastname: string;
  name: string;
  email: string;
}

export interface AdminUsersResponse {
  data: AdminUser[];
}
