'use client';

import { Menu, SidebarIcon, X } from 'lucide-react';
import { type ButtonHTMLAttributes, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { buttonVariants } from '../ui/button';
import { useSidebar } from 'fumadocs-ui/contexts/sidebar';
import { useNav } from 'fumadocs-ui/contexts/layout';
import { SidebarTrigger } from 'fumadocs-core/sidebar';
import { SidebarCollapseTrigger } from '../layout/sidebar';
import { SearchToggle } from '../layout/search-toggle';

export function Navbar(props: HTMLAttributes<HTMLElement>) {
  const { open } = useSidebar();
  const { isTransparent } = useNav();

  return (
    <header
      id="nd-subnav"
      {...props}
      className={cn(
        'sticky top-(--fd-banner-height) z-30 flex h-14 items-center px-4 border-b border-fd-foreground/10 transition-colors backdrop-blur-sm md:px-6',
        (!isTransparent || open) && 'bg-fd-background/80',
        props.className,
      )}
    >
      {props.children}
    </header>
  );
}

export function NavbarSidebarTrigger(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  const { open } = useSidebar();

  return (
    <SidebarTrigger
      {...props}
      className={cn(
        buttonVariants({
          color: 'ghost',
          size: 'icon',
        }),
        props.className,
      )}
    >
      {open ? <X /> : <Menu />}
    </SidebarTrigger>
  );
}

export function CollapsibleControl() {
  const { collapsed } = useSidebar();
  if (!collapsed) return;

  return (
    <div
      className="fixed flex flex-row animate-fd-fade-in rounded-xl p-0.5 border bg-fd-muted text-fd-muted-foreground z-10 xl:start-4 max-xl:end-4"
      style={{
        top: 'calc(var(--fd-banner-height) + var(--fd-tocnav-height) + var(--spacing) * 4)',
      }}
    >
      <SidebarCollapseTrigger
        className={cn(
          buttonVariants({
            color: 'ghost',
            size: 'icon-sm',
          }),
          'rounded-lg',
        )}
      >
        <SidebarIcon />
      </SidebarCollapseTrigger>
      <SearchToggle size="icon-sm" className="rounded-lg" />
    </div>
  );
}
