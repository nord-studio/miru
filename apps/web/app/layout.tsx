import { Inter, Manrope } from "next/font/google";
import { ThemeProvider } from "@/components/theme/provider";
import { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

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
	title: "Iris",
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
				className={`${inter.variable} ${manrope.variable} antialiased bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans flex flex-col items-center`}
			>
				<div className="w-full max-w-[1200px] p-4">
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<TooltipProvider>
							<NuqsAdapter>{children}</NuqsAdapter>
							<Toaster />
						</TooltipProvider>
					</ThemeProvider>
				</div>
			</body>
		</html>
	);
}
