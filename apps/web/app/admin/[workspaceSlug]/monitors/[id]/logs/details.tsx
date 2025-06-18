import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ping } from "@miru/types";

export default function PingDetails({ ping }: { ping: Ping }) {
	return (
		<>
			<div className="flex flex-col w-full items-center justify-center">
				<Tabs
					defaultValue={ping.type === "http" ? "headers" : "body"}
					className="w-full gap-0"
				>
					<TabsList className="w-full justify-start rounded-none bg-neutral-100 dark:bg-neutral-900 border-b">
						<TabsTrigger
							value="headers"
							disabled={ping.type === "tcp"}
							className="px-4"
						>
							Headers
						</TabsTrigger>
						<TabsTrigger value="body" className="px-4">
							Response
						</TabsTrigger>
					</TabsList>
					<TabsContent value="headers" className="max-w-[877px]">
						<table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
							<thead className="bg-neutral-100 dark:bg-neutral-900">
								<tr>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
									>
										Header
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
									>
										Value
									</th>
								</tr>
							</thead>
							<tbody className="bg-neutral-100 dark:bg-neutral-950 divide-y divide-neutral-200 dark:divide-neutral-700">
								{Object.entries(
									ping.headers as { [key: string]: string }
								).map(([key, value]) => (
									<tr key={key}>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
											{key}
										</td>
										<td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
											{value}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</TabsContent>
					<TabsContent value="body" className="w-full max-w-[877px]">
						<pre className="text-sm text-neutral-500 dark:text-neutral-400 p-4 whitespace-pre-wrap">
							{ping.body ?? "No response body."}
						</pre>
					</TabsContent>
				</Tabs>
			</div>
		</>
	);
}
