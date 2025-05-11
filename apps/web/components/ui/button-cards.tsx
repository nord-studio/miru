import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function ButtonCards(props: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			{...props}
			className={cn('grid grid-cols-2 gap-4', props.className)}
		>
			{props.children}
		</div>
	);
}

export type ButtonCardProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
	icon?: ReactNode;
	title: ReactNode;
	description?: ReactNode;
	href: string;
};

export function ButtonCard({ icon, title, description, ...props }: ButtonCardProps) {
	return (
		<Link
			{...props}
			data-card
			className={cn(
				'rounded-lg border bg-card p-4 text-card-foreground shadow-md transition-colors hover:bg-accent/80',
				props.className,
			)}
		>
			{icon ? (
				<div className="not-prose mb-2 w-fit rounded-md border bg-muted p-1.5 text-muted-foreground [&_svg]:size-4">
					{icon}
				</div>
			) : null}
			<h3 className="not-prose mb-1 text-sm font-medium">{title}</h3>
			{description ? (
				<p className="!my-0 text-sm text-muted-foreground">{description}</p>
			) : null}
			{props.children ? (
				<div className="text-sm text-muted-foreground prose-no-margin">
					{props.children}
				</div>
			) : null}
		</Link>
	);
}