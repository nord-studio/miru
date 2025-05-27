"use client";

import MonitorSelection from "@/components/monitors/monitor-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sortable, SortableDragHandle, SortableItem } from "@/components/ui/sortable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import { Monitor, StatusDayBlock } from "@/types/monitor";
import { CircleCheck, Code, FileQuestion, GripVertical, HelpCircle, Moon, Sun } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { editStatusPage } from "@/components/status-pages/actions";
import { toast } from "sonner";
import { StatusPageWithMonitorsExtended } from "@/types/status-pages";
import { Workspace } from "@/types/workspace";
import { Skeleton } from "@/components/ui/skeleton";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";
import Image from "next/image"
import Link from "next/link";
import { ColorPicker } from "@/components/ui/color-picker";
import { MiruConfig } from "@/types/config";
import { deleteAsset, uploadAsset } from "@/lib/minio/actions";
import StormtrooperStatusPageShell from "@/designs/stormtrooper/shell";
import { MonoStatusBanner, StatusBanner } from "@/components/ui/status-banner";
import DummyMonitor from "@/components/status-pages/dummy-monitor";
import PandaStatusPageShell from "@/designs/panda/shell";
import SimpleStatusPageShell from "@/designs/simple/shell";

export default function EditStatusPageForm({ existing, monitors, workspace, config }: { existing: StatusPageWithMonitorsExtended, monitors: Monitor[], workspace: Workspace, config: MiruConfig }) {
	const [loading, setLoading] = React.useState(false);

	const [name, setName] = React.useState(existing.name);
	const [description, setDescription] = React.useState(existing.description ?? "");
	const [root, setRoot] = React.useState(existing.root);
	const [domain, setDomain] = React.useState(existing.domain ?? "");
	const [logo, setLogo] = React.useState(existing.logo ?? "");
	const [darkLogo, setDarkLogo] = React.useState(existing.darkLogo ?? "");
	const [favicon, setFavicon] = React.useState(existing.favicon ?? "");
	const [monitorList, setMonitorList] = React.useState<Monitor[]>(existing.statusPageMonitors.map((m) => m.monitor));
	const [design, setDesign] = React.useState(existing.design ?? "simple");
	const [forcedTheme, setForcedTheme] = React.useState(existing.forcedTheme ?? false);
	const [brandColor, setBrandColor] = React.useState<string>(existing.brandColor ?? "#5865F2");
	const [enabled, setEnabled] = React.useState(existing.enabled ?? true);

	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	async function onSubmit() {
		setLoading(true);

		const t = toast.loading("Updating status page...");

		await editStatusPage({
			id: existing.id,
			workspaceId: workspace.id,
			name: name,
			root: root,
			domain: domain,
			monitorIds: monitorList.map((m) => m.id),
			design: design,
			brandColor: brandColor,
			forcedTheme: forcedTheme,
			description: description,
			enabled: enabled,
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
		})
		setLoading(false)
	}

	const logoInputRef = React.useRef<HTMLInputElement>(null);
	const logoDarkInputRef = React.useRef<HTMLInputElement>(null);
	const faviconInputRef = React.useRef<HTMLInputElement>(null);

	const upload = async (file: FileList | null, type: "logo" | "favicon", dark?: boolean) => {
		if (!file || file.length === 0) {
			return;
		}

		if (file[0].size > config.storage.max_size) {
			return toast.error("Please upload a file smaller than 12MB");
		}

		setLoading(true);
		const t = toast.loading(`Uploading ${type}...`);

		const formData = new FormData();
		formData.append("file", file[0]);

		const res = await uploadAsset(formData);

		if (res?.validationErrors) {
			setLoading(false);
			return toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
				description: res.validationErrors[Object.keys(res.validationErrors)[0] as keyof typeof res.validationErrors]?.[0],
				id: t
			});
		}

		if (res?.data?.error) {
			setLoading(false);
			return toast.error("Something went wrong!", {
				description: res.data.message,
				id: t
			});
		}

		if (res?.serverError) {
			setLoading(false);
			return toast.error("Something went wrong!", {
				description: res.serverError,
				id: t
			});
		}

		setLoading(false);
		toast.success("Success!", {
			description: `Uploaded ${type} successfully!`,
			id: t
		});


		if (type === "favicon") {
			setFavicon(res?.data?.id ?? "");
		} else {
			if (dark) {
				setDarkLogo(res?.data?.id ?? "");
			} else {
				setLogo(res?.data?.id ?? "");
			}
		}
	};

	const remove = async (type: "logo" | "favicon", dark?: boolean) => {
		setLoading(true);

		const t = toast.loading(`Removing ${type}...`);

		const res = await deleteAsset({ id: type === "favicon" ? favicon : dark ? darkLogo : logo });

		if (res?.validationErrors) {
			setLoading(false);
			return toast.error(`Invalid ${Object.keys(res.validationErrors)[0]}`, {
				description: res.validationErrors[Object.keys(res.validationErrors)[0] as keyof typeof res.validationErrors]?.[0],
				id: t
			});
		}

		if (res?.data?.error) {
			setLoading(false);
			return toast.error("Something went wrong!", {
				description: res.data.message,
				id: t
			});
		}

		if (res?.serverError) {
			setLoading(false);
			return toast.error("Something went wrong!", {
				description: res.serverError,
				id: t
			});
		}

		setLoading(false);
		toast.success("Success!", {
			description: `Removed ${type} successfully!`,
			id: t
		});

		if (type === "favicon") {
			setFavicon("");
		} else {
			if (dark) {
				setDarkLogo("");
			} else {
				setLogo("");
			}
		}
	};

	const days: StatusDayBlock[] = Array.from({ length: 45 }, () => ({
		date: new Date(),
		totalPings: 300,
		downtime: 0,
		failedPings: 0,
		incidents: [],
		events: []
	}));

	return (
		<>
			<div className="w-full flex flex-col lg:flex-row gap-8 items-start justify-center">
				<div className="flex flex-col items-start justify-center w-full gap-8 pb-8">
					<Tabs
						defaultValue="general"
						className="w-full"
					>
						<TabsList className="">
							<TabsTrigger value="general">
								General
							</TabsTrigger>
							<TabsTrigger value="monitors">
								Monitors
							</TabsTrigger>
							<TabsTrigger value="branding">
								Branding
							</TabsTrigger>
						</TabsList>
						<TabsContent value="general">
							<div className="flex flex-col gap-6 items-start w-full">
								<div className="flex flex-col gap-0 items-start w-full">
									<h2 className="text-xl font-semibold">General Information</h2>
									<p className="text-neutral-500 dark:text-neutral-400 text-sm">Some general info about your status page.</p>
								</div>
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
										<p className="text-sm text-neutral-500 dark:text-neutral-400">The name of your status page. This is used at the top of the page when a logo hasn&apos;t been uploaded.</p>
									</div>
									<div className="gap-2 flex flex-col items-start w-full">
										<Label>Description</Label>
										<Input placeholder={existing.description ?? ""} value={description} onChange={(e) => setDescription(e.target.value)} />
										<p className="text-sm text-neutral-500 dark:text-neutral-400">Provide your users information about this status page.</p>
									</div>
									<div className="flex flex-col gap-4 items-start w-full">
										<Label>Enabled</Label>
										<div className="items-top flex space-x-2">
											<Checkbox
												checked={enabled}
												onCheckedChange={(v) => setEnabled(v === true ? true : false)}
												disabled={loading}
											/>
											<div className="grid gap-1.5 leading-none">
												<label
													className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
												>
													Enable Status Page?
												</label>
												<p className="text-sm text-muted-foreground">
													Enable or disable this status page. This will not delete the page, but it will hide it from the public.
												</p>
											</div>
										</div>
									</div>
									<div className="flex flex-col gap-4 items-start w-full">
										<Label>Domains</Label>
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
							</div>
						</TabsContent>
						<TabsContent value="monitors">
							<div className="flex flex-col gap-6 items-start w-full">
								<div className="flex flex-col gap-0 items-start w-full">
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
													{mounted ? (
														<>
															{monitorList.map((field) => (
																<SortableItem key={field.id} value={field.id} asChild>
																	<div className="flex flex-row gap-2 items-center w-full py-2 pl-4 pr-2 border rounded-md">
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
														</>
													) : (
														<>
															<div className="flex flex-row gap-2 items-center w-full h-[50px] py-2 pl-4 pr-2 border rounded-md">
																<div className="flex flex-row gap-3 items-center w-full">
																	<Skeleton className="w-32 h-4" />
																	<Skeleton className="w-24 h-4" />
																</div>
																<Button variant="outline" size="icon" className="size-8 shrink-0">
																	<GripVertical className="size-4" aria-hidden="true" />
																</Button>
															</div>
															<div className="flex flex-row gap-2 items-center w-full h-[50px] py-2 pl-4 pr-2 border rounded-md">
																<div className="flex flex-row gap-3 items-center w-full">
																	<Skeleton className="w-32 h-4" />
																	<Skeleton className="w-24 h-4" />
																</div>
																<Button variant="outline" size="icon" className="size-8 shrink-0">
																	<GripVertical className="size-4" aria-hidden="true" />
																</Button>
															</div>
															<div className="flex flex-row gap-2 items-center w-full h-[50px] py-2 pl-4 pr-2 border rounded-md">
																<div className="flex flex-row gap-3 items-center w-full">
																	<Skeleton className="w-32 h-4" />
																	<Skeleton className="w-24 h-4" />
																</div>
																<Button variant="outline" size="icon" className="size-8 shrink-0">
																	<GripVertical className="size-4" aria-hidden="true" />
																</Button>
															</div>
														</>
													)}
												</div >
											</Sortable>
										</div>
									</div>
								</div>
							</div>
						</TabsContent>
						<TabsContent value="branding">
							<div className="flex flex-col gap-8 items-start w-full">
								<div className="flex flex-col gap-0 items-start w-full">
									<h2 className="text-xl font-semibold">Branding</h2>
									<p className="text-neutral-500 dark:text-neutral-400 text-sm">The branding on your status page.</p>
								</div>
								<div className="flex flex-col gap-4 items-start w-full">
									<div className="flex flex-col gap-1">
										<Label>Design</Label>
										<p className="text-sm text-neutral-500 dark:text-neutral-400">The design your status page will use.</p>
									</div>
									<div className="flex flex-row gap-4 items-center w-full">
										<RadioGroup.Root
											className="max-w-md w-full flex flex-wrap gap-6"
										>
											<div className="flex flex-col gap-2 items-center">
												<RadioGroup.Item
													key="simple"
													value="simple"
													checked={design === "simple"}
													onClick={() => setDesign("simple")}
													className={cn(
														"relative group ring-[1px] ring-border rounded py-2 px-3 text-start w-32 h-16",
														"data-[state=checked]:ring-2 data-[state=checked]:ring-neutral-500 data-[state=checked]:bg-neutral-800 data-[state=checked]:dark:bg-neutral-200"
													)}
												>
													<CircleCheck className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-6 w-6 text-primary fill-neutral-500 stroke-white group-data-[state=unchecked]:hidden" />
												</RadioGroup.Item>
												<span className="text-sm data-[checked=true]:font-semibold" data-checked={design === "simple"}>Simple</span>
											</div>
											<div className="flex flex-col gap-2 items-center">
												<RadioGroup.Item
													key="panda"
													value="panda"
													checked={design === "panda"}
													onClick={() => setDesign("panda")}
													className={cn(
														"relative group ring-[1px] ring-border rounded text-start w-32 h-16",
														"data-[state=checked]:ring-2 data-[state=checked]:ring-neutral-500 data-[state=checked]:opacity-100 opacity-80"
													)}
												>
													<CircleCheck className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-6 w-6 text-primary fill-neutral-500 stroke-white group-data-[state=unchecked]:hidden" />
													<div className="flex flex-col w-full h-full">
														<div className="h-1/2 bg-neutral-800 dark:bg-neutral-200 border-b rounded-t" />
													</div>
												</RadioGroup.Item>
												<span className="text-sm data-[checked=true]:font-semibold" data-checked={design === "panda"}>Panda</span>
											</div>
											<div className="flex flex-col gap-2 items-center">
												<RadioGroup.Item
													key="stormtrooper"
													value="stormtrooper"
													checked={design === "stormtrooper"}
													onClick={() => setDesign("stormtrooper")}
													className={cn(
														"relative group ring-[1px] ring-border rounded text-start w-32 h-16",
														"data-[state=checked]:ring-2 data-[state=checked]:ring-neutral-500 bg-neutral-200/80 data-[state=checked]:opacity-100 opacity-80"
													)}
												>
													<CircleCheck className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-6 w-6 text-primary fill-neutral-500 stroke-white group-data-[state=unchecked]:hidden" />
													<div className="flex flex-col w-full h-full">
														<div className="h-1/2 bg-neutral-950/80 border-b rounded-t" />
														<div className="absolute w-18 h-12 bg-neutral-100 border-x border-t border-black/10 dark:border-white/10 drop-shadow-2xl top-4 left-1/5 rounded-t-md" data-checked={design === "stormtrooper"} />
													</div>
												</RadioGroup.Item>
												<span className="text-sm data-[checked=true]:font-semibold" data-checked={design === "stormtrooper"}>Stormtrooper</span>
											</div>
										</RadioGroup.Root>
									</div>
								</div>
								<div className="flex flex-col gap-4 items-start w-full">
									<div className="flex flex-col gap-1">
										<Label>Colors</Label>
										<p className="text-sm text-neutral-500 dark:text-neutral-400">The colors your status page will use.</p>
									</div>

									<div className="flex flex-wrap gap-4">
										<div className="flex flex-col gap-2 items-start">
											<span className="text-sm text-neutral-500 dark:text-neutral-400">Brand Color</span>
											<div className="flex flex-row gap-0">
												<ColorPicker value={brandColor} onChange={(v) => setBrandColor(v)} className="border-r-0 rounded-r-none" disableInput={true} />
												<Input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="border-l-0 rounded-l-none" />
											</div>
										</div>
									</div>
								</div>
								<div className="flex flex-col gap-4 items-start w-full pt-2">
									<div className="flex flex-col gap-1">
										<div className="flex flex-row gap-2 items-center">
											<Label>Force theme</Label>
											<Link href="https://miru.nordstud.io/docs/concepts/status-pages#force-theme" target="_blank" rel="noopener noreferrer">
												<HelpCircle size={16} className="text-neutral-500 dark:text-neutral-400" />
											</Link>
										</div>
										<p className="text-sm text-neutral-500 dark:text-neutral-400">
											Miru will try to determine if the brand color is light or dark. You can override this here.
										</p>
									</div>
									<RadioGroup.Root
										defaultValue="auto"
										className="max-w-md w-full grid grid-cols-3 gap-4"
									>
										<RadioGroup.Item
											key="auto"
											value="auto"
											checked={forcedTheme === "auto"}
											onClick={() => setForcedTheme("auto")}
											className={cn(
												"relative group ring-[1px] ring-border rounded py-2 px-3 text-start",
												"data-[state=checked]:ring-2 data-[state=checked]:ring-neutral-500"
											)}
										>
											<CircleCheck className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-6 w-6 text-primary fill-neutral-500 stroke-white group-data-[state=unchecked]:hidden" />
											<Code className="mb-2.5 text-muted-foreground" />
											<span className="font-semibold tracking-tight">Auto</span>
										</RadioGroup.Item>
										<RadioGroup.Item
											key="dark"
											value="dark"
											checked={forcedTheme === "dark"}
											onClick={() => setForcedTheme("dark")}
											className={cn(
												"relative group ring-[1px] ring-border rounded py-2 px-3 text-start",
												"data-[state=checked]:ring-2 data-[state=checked]:ring-neutral-500"
											)}
										>
											<CircleCheck className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-6 w-6 text-primary fill-neutral-500 stroke-white group-data-[state=unchecked]:hidden" />
											<Moon className="mb-2.5 text-muted-foreground" />
											<span className="font-semibold tracking-tight">Dark</span>
										</RadioGroup.Item>
										<RadioGroup.Item
											key="light"
											value="light"
											checked={forcedTheme === "light"}
											onClick={() => setForcedTheme("light")}
											className={cn(
												"relative group ring-[1px] ring-border rounded py-2 px-3 text-start",
												"data-[state=checked]:ring-2 data-[state=checked]:ring-neutral-500"
											)}
										>
											<CircleCheck className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-6 w-6 text-primary fill-neutral-500 stroke-white group-data-[state=unchecked]:hidden" />
											<Sun className="mb-2.5 text-muted-foreground" />
											<span className="font-semibold tracking-tight">Light</span>
										</RadioGroup.Item>
									</RadioGroup.Root>
								</div>
								<div className="flex flex-col gap-4 items-start w-full">
									<div className="flex flex-col gap-1">
										<Label>Logo</Label>
										<p className="text-sm text-neutral-500 dark:text-neutral-400">Upload a logo for your status page. This will be shown on the top left of the page.</p>
									</div>
									<div className="flex flex-row gap-4 items-center w-full">
										{logo ? (
											<Image src={`/api/v1/assets/${logo}`} alt="Logo" width={128} height={128} />
										) : (
											<div className="max-w-32 max-h-32 w-32 h-32 border rounded-md gap-2 text-center flex flex-col items-center justify-center">
												<FileQuestion className="text-neutral-500 dark:text-neutral-400" />
												<p className="text-sm text-neutral-500 dark:text-neutral-400">No logo <br />uploaded</p>
											</div>
										)}
										<div className="flex flex-col gap-2 items-start">
											<input
												type="file"
												accept="image/png, image/jpeg, image/webp"
												id="logo"
												className="hidden"
												ref={logoInputRef}
												onChange={async (e) => {
													await upload(e.target.files, "logo", false);
													if (logoInputRef.current) {
														logoInputRef.current.value = ""; // Reset input value
													}
												}}
											/>
											<Button disabled={loading} onClick={() => {
												if (logoInputRef.current) {
													logoInputRef.current.click();
												}
											}}>
												Upload
											</Button>
											<Button variant="outline" disabled={loading || !logo} onClick={async () => await remove("logo", false)}>
												Remove
											</Button>
										</div>
									</div>
								</div>
								<div className="flex flex-col gap-4 items-start w-full">
									<div className="flex flex-col gap-1">
										<Label>Logo (dark mode)</Label>
										<p className="text-sm text-neutral-500 dark:text-neutral-400">The logo to use when the page or brand color is dark.</p>
									</div>
									<div className="flex flex-row gap-4 items-center w-full">
										{darkLogo ? (
											<Image src={`/api/v1/assets/${darkLogo}`} alt="Logo" width={128} height={128} />
										) : (
											<div className="max-w-32 max-h-32 w-32 h-32 border rounded-md gap-2 text-center flex flex-col items-center justify-center">
												<FileQuestion className="text-neutral-500 dark:text-neutral-400" />
												<p className="text-sm text-neutral-500 dark:text-neutral-400">No logo <br />uploaded</p>
											</div>
										)}
										<div className="flex flex-col gap-2 items-start">
											<input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" ref={logoDarkInputRef} onChange={async (e) => {
												await upload(e.target.files, "logo", true);
												if (logoDarkInputRef.current) {
													logoDarkInputRef.current.value = ""; // Reset input value
												}
											}} />
											<Button disabled={loading} onClick={() => {
												if (logoDarkInputRef.current) {
													logoDarkInputRef.current.click();
												}
											}}>
												Upload
											</Button>
											<Button variant="outline" disabled={loading || !darkLogo} onClick={async () => await remove("logo", true)}>
												Remove
											</Button>
										</div>
									</div>
								</div>
								<div className="flex flex-col gap-4 items-start w-full">
									<div className="flex flex-col gap-1">
										<Label>Favicon</Label>
										<p className="text-sm text-neutral-500 dark:text-neutral-400">Upload a favicon for your status page to use (ico files only).</p>
									</div>
									<div className="flex flex-row gap-4 items-center w-full">
										{favicon ? (
											<div className="max-w-32 max-h-32 size-32 border rounded-md gap-2 text-center flex flex-col items-center justify-center">
												<Image src={`/api/v1/assets/${favicon}`} alt="Favicon" width={32} height={32} />
											</div>
										) : (
											<div className="max-w-32 max-h-32 w-32 h-32 border rounded-md gap-2 text-center flex flex-col items-center justify-center">
												<FileQuestion className="text-neutral-500 dark:text-neutral-400" />
												<p className="text-sm text-neutral-500 dark:text-neutral-400">No favicon <br />uploaded</p>
											</div>
										)}
										<div className="flex flex-col gap-2 items-start">
											<input type="file" accept=".ico" className="hidden" ref={faviconInputRef} onChange={async (e) => {
												await upload(e.target.files, "favicon");
												if (faviconInputRef.current) {
													faviconInputRef.current.value = ""; // Reset input value
												}
											}} />
											<Button disabled={loading} onClick={() => {
												if (faviconInputRef.current) {
													faviconInputRef.current.click();
												}
											}}>
												Upload
											</Button>
											<Button variant="outline" disabled={loading || !favicon} onClick={async () => await remove("favicon")}>
												Remove
											</Button>
										</div>
									</div>
								</div>
							</div>
						</TabsContent>
					</Tabs>
					<div className="flex flex-row gap-2 items-end justify-end w-full">
						<Button disabled={loading} onClick={async () => await onSubmit()}>
							{loading && <Spinner />}
							{loading ? "Updating..." : "Update"}
						</Button>
					</div>
				</div>
				<div className="hidden lg:flex w-full h-fit items-start rounded-lg border overflow-hidden">
					{design === "stormtrooper" && (
						<StormtrooperStatusPageShell
							page={{
								id: "",
								design: "stormtrooper",
								workspaceId: "",
								statusPageMonitors: [],
								name: name,
								enabled: true,
								root: true,
								forcedTheme: forcedTheme,
								brandColor: brandColor,
								description: description,
								domain: domain,
								favicon: favicon,
								logo: logo,
								darkLogo: darkLogo
							}}
							header={
								<StatusBanner variant="operational" />
							}
						>
							{monitorList.map((monitor) => (
								<DummyMonitor key={monitor.id} monitor={monitor} days={days} />
							))}
						</StormtrooperStatusPageShell>
					)}
					{design === "panda" && (
						<PandaStatusPageShell
							page={{
								id: "",
								design: "panda",
								workspaceId: "",
								statusPageMonitors: [],
								name: name,
								enabled: true,
								root: true,
								forcedTheme: forcedTheme,
								brandColor: brandColor,
								description: description,
								domain: domain,
								favicon: favicon,
								logo: logo,
								darkLogo: darkLogo
							}}
							header={
								<MonoStatusBanner variant="operational" />
							}
						>
							{monitorList.map((monitor) => (
								<DummyMonitor key={monitor.id} monitor={monitor} days={days} />
							))}
						</PandaStatusPageShell>
					)}
					{design === "simple" && (
						<SimpleStatusPageShell
							page={{
								id: "",
								design: "simple",
								workspaceId: "",
								statusPageMonitors: [],
								name: name,
								enabled: true,
								root: true,
								forcedTheme: forcedTheme,
								brandColor: brandColor,
								description: description,
								domain: domain,
								favicon: favicon,
								logo: logo,
								darkLogo: darkLogo
							}}
							header={
								<StatusBanner variant="operational" />
							}
						>
							{monitorList.map((monitor) => (
								<DummyMonitor key={monitor.id} monitor={monitor} days={days} />
							))}
						</SimpleStatusPageShell>
					)}
				</div>
			</div>
		</>
	)
}