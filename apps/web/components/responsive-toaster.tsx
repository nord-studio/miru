"use client";

import { Toaster, ToasterProps } from "sonner";
import { useMediaQuery } from "usehooks-ts";

export default function ResponsiveToaster(props: ToasterProps) {
	const isDesktop = useMediaQuery("(min-width: 768px)");

	if (isDesktop) {
		return <Toaster {...props} />;
	} else {
		return <Toaster {...props} position="top-center" />;
	}
}
