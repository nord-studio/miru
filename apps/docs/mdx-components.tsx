import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import { Step, Steps } from "fumadocs-ui/components/steps"
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { TypeTable } from "fumadocs-ui/components/type-table";
import { Docker } from '@/components/icons';

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Steps,
    Step,
    Tabs,
    Tab,
    TypeTable,
    Docker,
    img: (props) => <ImageZoom {...(props as any)} className='border rounded-lg' />,
    ...components,
  };
}
