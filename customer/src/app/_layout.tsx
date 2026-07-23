import React from 'react';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Slot />
      </ToastProvider>
    </ThemeProvider>
  );
}
