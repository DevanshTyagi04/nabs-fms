'use client';

import React from 'react';
import { IconName, IconSize } from '@packages/shared-types';
import { iconSizes } from '@packages/design-tokens';
import {
  User,
  Lock,
  Mail,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  Bell,
  Menu,
  Settings,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Home,
  LayoutGrid,
  Briefcase,
  FileText,
  Calendar,
  RefreshCw,
  Eye,
  EyeOff,
  Moon,
  Sun,
  WifiOff,
  LucideProps,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const LUCIDE_ICON_MAP: Record<IconName, React.ComponentType<LucideProps>> = {
  user: User,
  lock: Lock,
  mail: Mail,
  check: Check,
  x: X,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  search: Search,
  bell: Bell,
  menu: Menu,
  settings: Settings,
  'alert-circle': AlertCircle,
  info: Info,
  'check-circle': CheckCircle,
  'alert-triangle': AlertTriangle,
  home: Home,
  grid: LayoutGrid,
  briefcase: Briefcase,
  'file-text': FileText,
  calendar: Calendar,
  refresh: RefreshCw,
  eye: Eye,
  'eye-off': EyeOff,
  moon: Moon,
  sun: Sun,
  'wifi-off': WifiOff,
};

export interface IconProps extends Omit<LucideProps, 'size'> {
  name: IconName;
  size?: IconSize | number;
  className?: string;
}

export function Icon({ name, size = 'md', className, ...props }: IconProps) {
  const IconComponent = LUCIDE_ICON_MAP[name] || AlertCircle;
  const numericSize = typeof size === 'number' ? size : iconSizes[size] || 20;

  return <IconComponent size={numericSize} className={cn('inline-block shrink-0', className)} {...props} />;
}
