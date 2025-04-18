import React from 'react';

import { cn } from '@/lib/cn';

export function Icon({
	icon,
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	icon?: React.ReactNode;
}): React.ReactElement {
	return (
		<div
			{...props}
			className={cn(
				'rounded-md border bg-gradient-to-b from-fd-secondary p-1 shadow-sm',
				props.className,
			)}
		>
			{icon}
		</div>
	);
}