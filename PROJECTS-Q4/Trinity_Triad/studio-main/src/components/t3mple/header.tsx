import React from 'react';
import { ThemeSwitcher } from '@/components/theme-switcher';

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b border-b-primary/20 shrink-0">
      <h1 className="text-3xl font-headline tracking-widest text-primary">
        T3MPLE
      </h1>
      <ThemeSwitcher />
    </header>
  );
}
