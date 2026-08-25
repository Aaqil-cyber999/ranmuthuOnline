export type AdminRole = "OWNER" | "STAFF";

export const ADMIN_ROLES: AdminRole[] = ["OWNER", "STAFF"];

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && (ADMIN_ROLES as string[]).includes(value);
}

export type AdminPermission =
  | "dashboard:view"
  | "products:view"
  | "products:manage"
  | "categories:view"
  | "categories:manage"
  | "orders:view"
  | "orders:manage"
  | "orders:delete"
  | "inventory:manage"
  | "store-settings:manage"
  | "upload";

const OWNER_PERMISSIONS: AdminPermission[] = [
  "dashboard:view",
  "products:view",
  "products:manage",
  "categories:view",
  "categories:manage",
  "orders:view",
  "orders:manage",
  "orders:delete",
  "inventory:manage",
  "store-settings:manage",
  "upload",
];

const STAFF_PERMISSIONS: AdminPermission[] = [
  "dashboard:view",
  "products:view",
  "categories:view",
  "orders:view",
  "orders:manage",
  "inventory:manage",
  "upload",
];

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  OWNER: OWNER_PERMISSIONS,
  STAFF: STAFF_PERMISSIONS,
};

export function hasPermission(role: string, permission: AdminPermission): boolean {
  if (!isAdminRole(role)) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function getPermissions(role: string): AdminPermission[] {
  if (!isAdminRole(role)) return [];
  return ROLE_PERMISSIONS[role];
}

export function isStoreManager(role: string): boolean {
  return isAdminRole(role);
}
