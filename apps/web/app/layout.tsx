import { Inter, Manrope } from "next/font/google";
import { ThemeProvider } from "@/components/theme/provider";
import { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ResponsiveToaster from "@/components/responsive-toaster";

import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
});

const manrope = Manrope({
	variable: "--font-manrope",
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Miru",
	description:
		"A free, open-source and self hostable status and monitoring service.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${inter.variable} ${manrope.variable} antialiased bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans flex flex-col items-center min-h-screen`}
			>
				<div className="flex flex-col min-h-screen w-full max-w-[1200px]" data-vaul-drawer-wrapper="">
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<TooltipProvider>
							<NuqsAdapter>{children}</NuqsAdapter>
							<ResponsiveToaster />
						</TooltipProvider>
					</ThemeProvider>
				</div>
			</body>
		</html>
	);
}
