"use client";

import MonitorSelection from "@/components/monitors/monitor-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sortable, SortableDragHandle, SortableItem } from "@/components/ui/sortable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import { Monitor } from "@/types/monitor";
import { GripVertical } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { createStatusPage } from "@/components/status-pages/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Workspace } from "@/types/workspace";

export default function NewStatusPageForm({ monitors, workspace }: { monitors: Monitor[], workspace: Workspace }) {
	const [loading, setLoading] = React.useState(false);
	const [name, setName] = React.useState("");
	const [root, setRoot] = React.useState(false);
	const [domain, setDomain] = React.useState("");
	const [monitorList, setMonitorList] = React.useState<Monitor[]>([]);
	const router = useRouter();

	async function onSubmit() {
		setLoading(true);

		const t = toast.loading("Creating status page...");

		await createStatusPage({
			workspaceId: workspace.id,
			name: name,
			enabled: true,
			root: root,
			domain: domain,
			monitorIds: monitorList.map((m) => m.id)
		}).then((res) => {
			if (res?.validationErrors) {
				toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
					description: res.validationErrors[Object.keys(res.validationErrors)[0] as keyof typeof res.validationErrors]?.[0],
					id: t
				});
			}

			if (res?.data?.error) {
				return toast.error("Something went wrong!", {
					description: res.data.message,
					id: t
				});
			}

			if (res?.serverError) {
				return toast.error("Something went wrong!", {
					description: res.serverError,
					id: t
				});
			}

			toast.success("Success!", {
				description: res?.data?.message,
				id: t
			});

			router.push(`/admin/${workspace.slug}/status-pages`);
		})
		setLoading(false)
	}

	return (
		<>
			<div className="flex flex-col items-start justify-center w-full gap-8">
				<div className="flex flex-col gap-6 items-start w-full">
					<div className="flex flex-col gap-2 items-start w-full">
						<Label>Name</Label>
						<Input
							value={name}
							onChange={(e) =>
								setName(e.target.value)
							}
							placeholder="Nord Studio"
							disabled={loading}
						/>
					</div>
					<div className="flex flex-col gap-4 items-start w-full">
						<Label>Root Domain</Label>
						<div className="items-top flex space-x-2">
							<Checkbox
								checked={root}
								onCheckedChange={(v) => setRoot(v === true ? true : false)}
								disabled={loading}
							/>
							<div className="grid gap-1.5 leading-none">
								<label
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Use Root Domain?
								</label>
								<p className="text-sm text-muted-foreground">
									Host this page on the same domain as your Miru instance.
								</p>
							</div>
						</div>
					</div>
					{!root && (
						<div className="flex flex-col gap-2 items-start w-full">
							<Label>Domain / URL</Label>
							<Input
								placeholder="status.tygr.dev"
								disabled={loading}
								value={domain}
								onChange={(e) =>
									setDomain(e.target.value)
								}
							/>
						</div>
					)}
				</div>
				<Tabs
					defaultValue="monitors"
					className="w-full"
				>
					<TabsList>
						<TabsTrigger value="monitors">
							Monitors
						</TabsTrigger>
						<TabsTrigger value="advanced">Advanced</TabsTrigger>
					</TabsList>
					<TabsContent value="monitors">
						<div className="flex flex-col gap-4 items-start w-full">
							<div className="flex flex-col gap-1 items-start w-full">
								<h2 className="text-xl font-semibold">Connected Monitors</h2>
								<p className="text-neutral-500 dark:text-neutral-400 text-sm">Select the monitors you want to display on your status page. Change the order by using the right-side handle. Inactive monitors will not be shown on the page.</p>
							</div>
							<div className="flex flex-col gap-2 items-start w-full">
								<div className="flex flex-col gap-2 items-start w-full">
									<Label>Monitors</Label>
									<div className="min-w-[250px]">
										<MonitorSelection
											monitors={monitors}
											value={monitorList}
											setValue={setMonitorList}
											min={1}
											disabled={loading}
										/>
									</div>
									<div className="h-full w-full">
										<Sortable
											value={monitorList}
											onMove={({ activeIndex, overIndex }) => {
												if (loading) return;
												const newItems = [...monitorList];
												const movedItem = newItems.splice(activeIndex, 1)[0];
												newItems.splice(overIndex, 0, movedItem);
												setMonitorList(newItems);
											}}
										>
											<div className="w-full space-y-2 py-4">
												{monitorList.map((field) => (
													<SortableItem key={field.id} value={field.id} asChild>
														<div className="flex flex-row gap-2 items-center w-full py-2 pl-4 pr-2 border border-neutral-100 dark:border-neutral-800 rounded-md">
															<div className="flex flex-row gap-3 items-center w-full">
																<div className="flex items-center gap-2 truncate">
																	<span className="truncate">{field.name}</span>
																</div>
																<div className="truncate text-muted-foreground">
																	{field?.url}
																</div>
															</div>
															<SortableDragHandle
																variant="outline"
																size="icon"
																className="size-8 shrink-0"
																type="button"
																disabled={loading}
															>
																<GripVertical className="size-4" aria-hidden="true" />
															</SortableDragHandle>
														</div>
													</SortableItem>
												))}
											</div>
										</Sortable>
									</div>
								</div>
							</div>
						</div>
					</TabsContent>
					<TabsContent value="advanced">
						<div className="flex flex-col gap-4 items-start w-full">
							<div className="flex flex-col gap-1 items-start w-full">
								<h2 className="text-xl font-semibold">Advanced Settings</h2>
								<p className="text-neutral-500 dark:text-neutral-400 text-sm">
									Provide information about what your status page is for.
								</p>
							</div>
						</div>
					</TabsContent>
				</Tabs>
				<div className="flex flex-row gap-2 items-end justify-end w-full">
					<Button disabled={loading} onClick={async () => await onSubmit()}>
						{loading && <Spinner />}
						{loading ? "Creating..." : "Create"}
					</Button>
				</div>
			</div>
		</>
	)
}