"use client";

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react"
import { NotificationWithMonitors } from "@miru/types";
import DeleteNotifications from "@/components/notifications/delete-channel";

interface DataTableProps<T> {
	columns: ColumnDef<T>[];
	data: T[];
	emptyComponent?: React.ReactNode;
}

export function NotificationDataTable({
	columns,
	data,
	emptyComponent,
}: DataTableProps<NotificationWithMonitors>) {
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [rowSelection, setRowSelection] = React.useState({})

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onRowSelectionChange: setRowSelection,
		state: {
			rowSelection
		}
	});

	// When data changes, reset the row selection
	React.useEffect(() => {
		table.resetRowSelection();
	}, [data.length, table]);

	return (
		<div>
			<div className="rounded-md border">
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
													header.column.columnDef
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
								<TableRow
									key={row.id}
									data-state={
										row.getIsSelected() && "selected"
									}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-full py-8 text-center"
								>
									{emptyComponent}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<AnimatePresence>
				{table.getFilteredSelectedRowModel().rows.length >= 1 && (
					<>
						<DeleteNotifications
							open={deleteOpen}
							setOpen={setDeleteOpen}
							notifications={table.getFilteredSelectedRowModel().rows.map((page) => page.original)}
						/>
						<motion.div
							initial={{ opacity: 0, y: 20, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 20, scale: 0.95 }}
							transition={{ type: "spring", stiffness: 350, damping: 24 }}
							className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-row w-fit gap-3 bg-card text-popover-foreground border shadow-lg rounded-md px-3 py-3"
						>
							<Button variant="destructive" onClick={() => setDeleteOpen(!deleteOpen)}>
								<Trash /> <span>Delete</span>
							</Button>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			<div className="flex flex-row gap-2 items-center w-full justify-between">
				<div className="text-neutral-500 dark:text-neutral-400 flex-1 text-sm hidden sm:inline">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} row(s) selected.
				</div>

				{/* TODO: Add pagination */}
				<div className="flex items-center sm:justify-end space-x-2 py-4 w-full sm:w-fit justify-between">
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
