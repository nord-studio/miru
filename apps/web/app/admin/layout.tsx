export default function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<>
			<main className="max-w-[1200px] mx-auto w-full">
				{children}
			</main>
		</>
	)
}