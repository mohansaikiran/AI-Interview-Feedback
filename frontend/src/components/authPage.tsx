import React from 'react';
import { ProtectedRoute } from '../auth/protectedRoute';
import { AppShell } from './appShell';

export function AuthedPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}