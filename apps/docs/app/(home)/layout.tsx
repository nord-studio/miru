import type { ReactNode } from 'react';
import { HomeLayout } from "@/components/layouts/home";
import { baseOptions } from '@/app/layout.config';

export default function Layout({ children }: { children: ReactNode }) {
  return <HomeLayout {...baseOptions}>
    <div className='max-w-fd-container w-full lg:px-0 px-6 lg:w-[calc(100%-2rem)]'>
      {children}
    </div>
  </HomeLayout>;
}
