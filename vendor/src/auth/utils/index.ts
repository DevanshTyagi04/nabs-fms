import { AuthStatus, UserRole } from '@packages/shared-types';

export interface JwtPayload {
  sub?: string;
  email?: string;
  role?: UserRole;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

export function isAuthenticated(status: AuthStatus): boolean {
  return status === 'authenticated' || status === 'refreshing';
}

export function hasRole(userRole?: UserRole, requiredRoles?: UserRole[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  if (!requiredPermission) return true;
  return userPermissions.includes(requiredPermission) || userPermissions.includes('*');
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, thresholdSeconds = 0): boolean {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp - thresholdSeconds <= now;
}

export function shouldRefresh(token: string, thresholdSeconds = 60): boolean {
  return isTokenExpired(token, thresholdSeconds);
}
