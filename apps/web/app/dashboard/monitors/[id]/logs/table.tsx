"use client";

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import React from "react";
import { getMonitorPings } from "@/app/dashboard/monitors/[id]/logs/actions";
import { Ping } from "@/types/ping";
import { Chip } from "@/components/ui/chip";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import PingDetails from "@/app/dashboard/monitors/[id]/logs/details";
import { RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableSkeleton } from "@/components/data-table/skeleton";

const columns: ColumnDef<Ping>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && "indeterminate")
				}
				onCheckedChange={(value) =>
					table.toggleAllPageRowsSelected(!!value)
				}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: "success",
		cell: ({ row }) => {
			return (
				<Tooltip>
					<TooltipContent>
						{row.original.success ? "Success" : "Failed"}
					</TooltipContent>
					<TooltipTrigger>
						<div
							className={`rounded-full w-3 h-3 ${
								row.original.success
									? "bg-green-500"
									: "bg-red-500"
							}`}
						/>
					</TooltipTrigger>
				</Tooltip>
			);
		},
	},
	{
		id: "id",
		header: "ID",
		cell: ({ row }) => {
			return <p>{row.original.id}</p>;
		},
	},
	{
		accessorKey: "createdAt",
		header: "Date",
		cell: ({ row }) => {
			return <p>{new Date(row.original.createdAt).toLocaleString()}</p>;
		},
	},
	{
		id: "status",
		accessorKey: "status",
		header: "Status",
		filterFn: (row, id, value) => {
			// get the first digit of the status code
			return value.includes(Number(String(row.getValue(id)).charAt(0)));
		},
		cell: ({ row }) => {
			return (
				<Chip variant={row.original.status === 200 ? "green" : "red"}>
					{row.original.status}
				</Chip>
			);
		},
	},
	{
		accessorKey: "latency",
		header: "Latency (ms)",
		cell: ({ row }) => <p>{row.original.latency}</p>,
	},
];

export function PingDataTable({ id }: { id: string }) {
	const [loading, setLoading] = React.useState(true);
	const [timeframe, setTimeframe] = React.useState("1");
	const [pagination, setPagination] = React.useState({
		pageIndex: 0, //initial page index
		pageSize: 50, //default page size
	});
	const [data, setData] = React.useState<Ping[]>([]);
	const [count, setCount] = React.useState(0);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({
			status: true,
		});

	async function getData() {
		getMonitorPings({
			id,
			offset: pagination.pageIndex,
			timeframe: parseInt(timeframe),
		}).then((res) => {
			console.log(res);
			setData(res.data);
			setCount(res.total);
			// reset page index if it exceeds the total number of pages
			if (pagination.pageIndex >= Math.ceil(res.total / 50)) {
				setPagination({
					...pagination,
					pageIndex: Math.max(Math.ceil(res.total / 50) - 1, 0),
				});
			}
			// reset page index if there are no results
			if (res.total === 0) {
				setPagination({
					...pagination,
					pageIndex: 0,
				});
			}
			// reset row expand state
			table.resetExpanded();
			setLoading(false);
		});
	}

	React.useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pagination.pageIndex, timeframe]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: true,
		onPaginationChange: setPagination,
		rowCount: count,
		state: {
			pagination,
			columnVisibility,
		},
		getRowCanExpand: (row) =>
			row.original.success === true && row.original.type === "http",
		onColumnVisibilityChange: setColumnVisibility,
	});

	return (
		<div className="flex flex-col gap-4 w-full">
			<div className="flex flex-row gap-2 items-center">
				{loading ? (
					<>
						<Skeleton className="w-[180px] h-[36px] rounded-lg" />
						<Skeleton className="size-[36px] rounded-lg" />
					</>
				) : (
					<>
						<Select
							value={timeframe}
							onValueChange={(v) => setTimeframe(v)}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Last Day" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1">Last Day</SelectItem>
								<SelectItem value="7">Last Week</SelectItem>
								<SelectItem value="14">Last 2 Weeks</SelectItem>
								<SelectItem value="30">Last Month</SelectItem>
								<SelectItem value="90">
									Last 3 Months
								</SelectItem>
								<SelectItem value="365">Last Year</SelectItem>
							</SelectContent>
						</Select>
						<Button
							variant="outline"
							size="icon"
							onClick={async () => {
								setLoading(true);
								await getData();
							}}
						>
							<RefreshCcw />
						</Button>
					</>
				)}
			</div>
			<div className="rounded-md border">
				{loading ? (
					<DataTableSkeleton />
				) : (
					<>
						<Table>
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											return (
												<TableHead key={header.id}>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column
																	.columnDef
																	.header,
																header.getContext()
														  )}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<React.Fragment key={row.id}>
											<TableRow
												key={row.id}
												data-state={
													row.getIsSelected() &&
													"selected"
												}
												onClick={() => {
													if (!row.getCanExpand())
														return;
													// Only allow one row to be expanded at a time
													if (!row.getIsExpanded())
														table.resetExpanded();
													row.toggleExpanded();
												}}
												className="hover:bg-muted/10 data-[state=selected]:bg-primary/10"
											>
												{row
													.getVisibleCells()
													.map((cell) => (
														<TableCell
															key={cell.id}
														>
															{flexRender(
																cell.column
																	.columnDef
																	.cell,
																cell.getContext()
															)}
														</TableCell>
													))}
											</TableRow>
											{row.getIsExpanded() && (
												<TableRow
													data-state="expanded"
													className="hover:bg-muted/10 data-[state=expanded]:bg-muted/10"
												>
													<TableCell
														colSpan={
															row.getVisibleCells()
																.length
														}
														className="p-0"
													>
														<PingDetails
															ping={row.original}
														/>
													</TableCell>
												</TableRow>
											)}
										</React.Fragment>
									))
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-24 text-center"
										>
											No Results.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</>
				)}
			</div>
			<div className="flex flex-row gap-2 items-center py-4 justify-between">
				<div className="flex-1 text-sm text-muted-foreground">
					25 of {count} row(s) displayed.
				</div>
				<div className="flex items-center justify-end space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
