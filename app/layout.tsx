import { Inter, Manrope } from "next/font/google";
import { ThemeProvider } from "@/components/theme/provider";
import { Metadata } from "next";
import Navbar from "@/components/navbar";
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
				className={`${inter.variable} ${manrope.variable} antialiased bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-sans`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
