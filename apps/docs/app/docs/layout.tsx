import { DocsLayout, DocsLayoutProps } from '@/components/layouts/docs';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/source';
import { ArrowLeft } from 'lucide-react';
import { Icon } from '@/components/ui/icon';
import { Discord } from '@/components/icons';

const docsOptions: DocsLayoutProps = {
  ...baseOptions,
  tree: source.pageTree,
  links: [
    {
      text: "Back to Home",
      url: "/",
      active: "url",
      icon: <Icon icon={<ArrowLeft />} />
    },
    {
      text: "Need help?",
      url: "https://nordstud.io/discord",
      active: "url",
      icon: (
        <Icon icon={<Discord />} />
      )
    }
  ]
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout {...docsOptions}>
      {children}
    </DocsLayout>
  );
}
