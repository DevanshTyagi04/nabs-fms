import { IconName, UserRole } from '@packages/shared-types';

export interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: IconName;
  roles?: UserRole[];
  children?: NavItem[];
  badge?: string | number;
  hidden?: boolean;
  disabled?: boolean;
  featureFlag?: string;
  requiresAuth?: boolean;
  order?: number;
  description?: string;
  breadcrumb?: string;
}

export class NavigationRegistry {
  private static navItems: NavItem[] = [];

  static registerItems(items: NavItem[]) {
    this.navItems = [...items].sort((a, b) => (a.order || 99) - (b.order || 99));
  }

  static getItems(userRole?: UserRole | null): NavItem[] {
    return this.navItems.filter((item) => {
      if (item.hidden) return false;
      if (item.roles && userRole && !item.roles.includes(userRole)) return false;
      return true;
    });
  }

  static getItemByPath(pathname: string): NavItem | null {
    for (const item of this.navItems) {
      if (item.href === pathname) return item;
    }
    return null;
  }
}
