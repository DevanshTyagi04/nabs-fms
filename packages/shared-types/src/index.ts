export type ThemeMode = 'light' | 'dark' | 'system';

export type UserRole = 'ADMIN' | 'VENDOR' | 'CUSTOMER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export type AvatarSize = 'sm' | 'md' | 'lg';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type IconName =
  | 'user'
  | 'lock'
  | 'mail'
  | 'check'
  | 'x'
  | 'chevron-down'
  | 'chevron-right'
  | 'chevron-left'
  | 'search'
  | 'bell'
  | 'menu'
  | 'settings'
  | 'alert-circle'
  | 'info'
  | 'check-circle'
  | 'alert-triangle'
  | 'home'
  | 'grid'
  | 'briefcase'
  | 'file-text'
  | 'calendar'
  | 'refresh'
  | 'eye'
  | 'eye-off'
  | 'moon'
  | 'sun'
  | 'wifi-off';

export interface BaseComponentProps {
  testID?: string;
  accessibilityLabel?: string;
}

export type DomainStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DRAFT';

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated' | 'refreshing';
