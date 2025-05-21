import type { PageTree } from 'fumadocs-core/server';
import { type ReactNode, type HTMLAttributes, useMemo } from 'react';
import { Languages, SidebarIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { buttonVariants } from '../ui/button';
import {
  CollapsibleSidebar,
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarCollapseTrigger,
  SidebarViewport,
  SidebarPageTree,
} from '../layout/sidebar';
import { slot, slots } from './shared';
import {
  type LinkItemType,
  BaseLinkItem,
  type IconItemType,
} from './links';
import { RootToggle } from '../layout/root-toggle';
import { type BaseLayoutProps, getLinks } from './shared';
import {
  LanguageToggle,
  LanguageToggleText,
} from '../layout/language-toggle';
import {
  CollapsibleControl,
  Navbar,
  NavbarSidebarTrigger,
} from './docs-client';
import { TreeContextProvider } from 'fumadocs-ui/contexts/tree';
import { ThemeToggle } from '../layout/theme-toggle';
import {
  LargeSearchToggle,
  SearchToggle,
} from '../layout/search-toggle';
import {
  getSidebarTabsFromOptions,
  layoutVariables,
  SidebarLinkItem,
  type SidebarOptions,
} from './docs/shared';
import {
  type PageStyles,
  StylesProvider,
  NavProvider,
} from 'fumadocs-ui/contexts/layout';
import Link from 'fumadocs-core/link';
import { SidebarProvider } from 'fumadocs-core/sidebar';

export interface DocsLayoutProps extends BaseLayoutProps {
  tree: PageTree.Root;

  sidebar?: Partial<SidebarOptions> & {
    enabled?: boolean;
    component?: ReactNode;
  };

  /**
   * Props for the `div` container
   */
  containerProps?: HTMLAttributes<HTMLDivElement>;
}

export function DocsLayout({
  nav: { transparentMode, ...nav } = {},
  searchToggle,
  disableThemeSwitch = false,
  themeSwitch = { enabled: !disableThemeSwitch },
  sidebar: { tabs: tabOptions, ...sidebar } = {},
  i18n = false,
  children,
  ...props
}: DocsLayoutProps): ReactNode {
  const tabs = useMemo(
    () => getSidebarTabsFromOptions(tabOptions, props.tree) ?? [],
    [tabOptions, props.tree],
  );
  const links = getLinks(props.links ?? [], props.githubUrl);

  const variables = cn(
    '[--fd-tocnav-height:36px] md:[--fd-sidebar-width:268px] lg:[--fd-sidebar-width:286px] xl:[--fd-toc-width:286px] xl:[--fd-tocnav-height:0px]',
    !nav.component && nav.enabled !== false
      ? '[--fd-nav-height:calc(var(--spacing)*14)] md:[--fd-nav-height:0px]'
      : undefined,
  );

  const pageStyles: PageStyles = {
    tocNav: cn('xl:hidden'),
    toc: cn('max-xl:hidden'),
  };

  return (
    <TreeContextProvider tree={props.tree}>
      <SidebarProvider>
        <NavProvider transparentMode={transparentMode}>
          {slot(
            nav,
            <Navbar className="md:hidden">
              <Link
                href={nav.url ?? '/'}
                className="inline-flex items-center gap-2.5 font-semibold"
              >
                {nav.title}
              </Link>
              <div className="flex flex-1 flex-row items-center gap-1">
                {nav.children}
              </div>
              {slots('sm', searchToggle, <SearchToggle hideIfDisabled />)}
              <NavbarSidebarTrigger className="-me-2 md:hidden" />
            </Navbar>,
          )}
          <main
            id="nd-docs-layout"
            {...props.containerProps}
            className={cn(
              'flex flex-1 flex-row pe-(--fd-layout-offset)',
              variables,
              props.containerProps?.className,
            )}
            style={{
              ...layoutVariables,
              ...props.containerProps?.style,
            }}
          >
            {slot(
              sidebar,
              <DocsLayoutSidebar
                {...sidebar}
                links={links}
                nav={
                  <>
                    <Link
                      href={nav.url ?? '/'}
                      className="inline-flex text-[15px] items-center gap-2.5 font-medium"
                    >
                      {nav.title}
                    </Link>
                    {nav.children}
                  </>
                }
                banner={
                  <>
                    {tabs.length > 0 ? (
                      <RootToggle options={tabs} className="-mx-2" />
                    ) : null}
                    {slots(
                      'lg',
                      searchToggle,
                      <LargeSearchToggle
                        hideIfDisabled
                        className="rounded-lg max-md:hidden"
                      />,
                    )}
                    {sidebar.banner}
                  </>
                }
                footer={
                  <>
                    <DocsLayoutSidebarFooter
                      links={links.filter((item) => item.type === 'icon')}
                      i18n={i18n}
                      themeSwitch={themeSwitch}
                    />
                    {sidebar.footer}
                  </>
                }
              />,
            )}
            <StylesProvider {...pageStyles}>{children}</StylesProvider>
          </main>
        </NavProvider>
      </SidebarProvider>
    </TreeContextProvider>
  );
}

export function DocsLayoutSidebar({
  collapsible = true,
  components,
  nav,
  links = [],
  footer,
  banner,
  ...props
}: Omit<SidebarOptions, 'tabs'> & {
  links?: LinkItemType[];
  nav?: ReactNode;
}) {
  const Aside = collapsible ? CollapsibleSidebar : Sidebar;

  return (
    <>
      {collapsible ? <CollapsibleControl /> : null}
      <Aside
        {...props}
        className={cn('md:ps-(--fd-layout-offset)', props.className)}
      >
        <SidebarHeader>
          <div className="flex flex-row py-1 gap-2 items-center max-md:hidden w-full justify-between">
            {nav}
            {collapsible && (
              <SidebarCollapseTrigger
                className={cn(
                  buttonVariants({
                    color: 'ghost',
                    size: 'icon-sm',
                  }),
                  'text-fd-muted-foreground max-md:hidden',
                )}
              >
                <SidebarIcon />
              </SidebarCollapseTrigger>
            )}
          </div>
          {banner}
        </SidebarHeader>
        <SidebarViewport>
          <div className="mb-4 empty:hidden">
            {links
              .filter((v) => v.type !== 'icon')
              .map((item, i) => (
                <SidebarLinkItem key={i} item={item} />
              ))}
          </div>
          <SidebarPageTree components={components} />
        </SidebarViewport>
        <SidebarFooter>{footer}</SidebarFooter>
      </Aside>
    </>
  );
}

export function DocsLayoutSidebarFooter({
  i18n,
  themeSwitch,
  links = [],
}: {
  i18n?: DocsLayoutProps['i18n'];
  links?: IconItemType[];
  themeSwitch?: DocsLayoutProps['themeSwitch'];
}) {
  // empty footer items
  if (links.length === 0 && !i18n && themeSwitch?.enabled === false)
    return null;

  return (
    <div className="flex flex-row items-center">
      {links.map((item, i) => (
        <BaseLinkItem
          key={i}
          item={item}
          className={cn(
            buttonVariants({ size: 'icon', color: 'ghost' }),
            'text-fd-muted-foreground md:[&_svg]:size-4.5',
          )}
          aria-label={item.label}
        >
          {item.icon}
        </BaseLinkItem>
      ))}
      <div role="separator" className="flex-1" />
      {i18n ? (
        <LanguageToggle className="me-1.5">
          <Languages className="size-4.5" />
          <LanguageToggleText className="md:hidden" />
        </LanguageToggle>
      ) : null}
      {slot(
        themeSwitch,
        <ThemeToggle className="p-0" mode={themeSwitch?.mode} />,
      )}
    </div>
  );
}

export { CollapsibleControl, Navbar, NavbarSidebarTrigger, type LinkItemType };
export { getSidebarTabsFromOptions } from './docs/shared';
