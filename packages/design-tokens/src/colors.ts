export interface ThemeColors {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  surface: string;
  surfaceForeground: string;
  background: string;
  backgroundForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  muted: string;
  mutedForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  error: string;
  errorForeground: string;
  info: string;
  infoForeground: string;
  disabled: string;
  disabledForeground: string;
  ring: string;
}

export const lightColors: ThemeColors = {
  primary: '#1E3A8A', // Indigo Navy
  primaryForeground: '#FFFFFF',
  secondary: '#475569', // Slate
  secondaryForeground: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceForeground: '#0F172A',
  background: '#F8FAFC', // Slate 50
  backgroundForeground: '#0F172A',
  card: '#FFFFFF',
  cardForeground: '#0F172A',
  border: '#E2E8F0', // Slate 200
  muted: '#F1F5F9', // Slate 100
  mutedForeground: '#64748B', // Slate 500
  success: '#059669', // Emerald 600
  successForeground: '#FFFFFF',
  warning: '#D97706', // Amber 600
  warningForeground: '#FFFFFF',
  error: '#DC2626', // Red 600
  errorForeground: '#FFFFFF',
  info: '#0284C7', // Sky 600
  infoForeground: '#FFFFFF',
  disabled: '#CBD5E1', // Slate 300
  disabledForeground: '#94A3B8', // Slate 400
  ring: '#2563EB', // Blue 600
};

export const darkColors: ThemeColors = {
  primary: '#3B82F6', // Blue 500
  primaryForeground: '#0F172A',
  secondary: '#94A3B8', // Slate 400
  secondaryForeground: '#0F172A',
  surface: '#1E293B', // Slate 800
  surfaceForeground: '#F8FAFC',
  background: '#0F172A', // Slate 900
  backgroundForeground: '#F8FAFC',
  card: '#1E293B', // Slate 800
  cardForeground: '#F8FAFC',
  border: '#334155', // Slate 700
  muted: '#1E293B',
  mutedForeground: '#94A3B8',
  success: '#10B981', // Emerald 500
  successForeground: '#0F172A',
  warning: '#F59E0B', // Amber 500
  warningForeground: '#0F172A',
  error: '#EF4444', // Red 500
  errorForeground: '#FFFFFF',
  info: '#38BDF8', // Sky 400
  infoForeground: '#0F172A',
  disabled: '#334155',
  disabledForeground: '#64748B',
  ring: '#60A5FA',
};
