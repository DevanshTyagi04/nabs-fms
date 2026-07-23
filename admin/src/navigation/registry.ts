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
    const findItem = (items: NavItem[]): NavItem | null => {
      for (const item of items) {
        if (item.href === pathname) return item;
        if (item.children) {
          const match = findItem(item.children);
          if (match) return match;
        }
      }
      return null;
    };
    return findItem(this.navItems);
  }

  static getBreadcrumbs(pathname: string): Array<{ title: string; href: string }> {
    const crumbs: Array<{ title: string; href: string }> = [{ title: 'Home', href: '/' }];
    const match = this.getItemByPath(pathname);
    if (match && match.href !== '/') {
      crumbs.push({
        title: match.breadcrumb || match.title,
        href: match.href,
      });
    }
    return crumbs;
  }
}
