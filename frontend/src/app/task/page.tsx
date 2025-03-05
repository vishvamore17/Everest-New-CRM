'use client'
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ModeToggle"
import { z } from "zod"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Edit, Trash2, Loader2, PlusCircle, SearchIcon, ChevronDownIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import axios from "axios";
import { Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, User } from "@heroui/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SearchBar from '@/components/globalSearch'
import { Selection } from "@nextui-org/react";

interface Task {
    _id: string;
    subject: string;
    name: string;
    relatedTo: string;
    dueDate: string;
    status: string;
    priority: string;
    assigned: string;
    lastReminderDate: string;
    lastReminder: string;
}


const generateUniqueId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
};

const columns = [
    { name: "TASK", uid: "subject", sortable: true, width: "120px" },
    { name: "NAME", uid: "name", sortable: true, width: "120px" },
    { name: "ASSIGNED TO", uid: "assigned", sortable: true, width: "150px" },
    { name: "RELATED TO", uid: "relatedTo", sortable: true, width: "120px" },
    { name: "DUE DATE", uid: "dueDate", sortable: true, width: "150px" },
    { name: "STATUS", uid: "status", sortable: true, width: "100px" },
    { name: "PRIORITY", uid: "priority", sortable: true, width: "100px" },
    { name: "LAST REMINDER", uid: "lastReminder", sortable: true, width: "150px" },
    { name: "ACTION", uid: "actions", sortable: true, width: "100px" },
];

const INITIAL_VISIBLE_COLUMNS = ["subject", "name", "assigned", "relatedTo", "dueDate", "status", "priority", "lastReminder", "actions"];

const taskSchema = z.object({
    subject: z.string().min(2, { message: "Subject is required." }),
    assigned: z.string().min(2, { message: "Assigned person is required." }),
    relatedTo: z.string().min(2, { message: "Related to is required." }),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date",
    }).transform((val) => new Date(val)), // ✅ Convert string to Date
    status: z.enum(["New", "In Progress", "Completed", "Pending"]),
    priority: z.enum(["Low", "Medium", "High"]),
    lastReminder: z.string().optional(),
})

export default function TaskPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set());

    const fetchTasks = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/v1/task/getAllTasks"
            );

            // Log the response structure
            console.log('Full API Response:', {
                status: response.status,
                data: response.data,
                type: typeof response.data,
                hasData: 'data' in response.data
            });

            // Handle the response based on its structure
            let TaskData;
            if (typeof response.data === 'object' && 'data' in response.data) {

                TaskData = response.data.data;
            } else if (Array.isArray(response.data)) {

                TaskData = response.data;
            } else {
                console.error('Unexpected response format:', response.data);
                throw new Error('Invalid response format');
            }

            // Ensure leadsData is an array
            if (!Array.isArray(TaskData)) {
                TaskData = [];
            }

            // Map the data with safe key generation
            const TaskWithKeys = TaskData.map((task: Task) => ({
                ...task,
                key: task._id || generateUniqueId()
            }));

            setTasks(TaskWithKeys);
            setError(null); // Clear any previous errors
        } catch (error) {
            console.error("Error fetching tasks:", error);
            if (axios.isAxiosError(error)) {
                setError(`Failed to fetch tasks: ${error.response?.data?.message || error.message}`);
            } else {
                setError("Failed to fetch tasks.");
            }
            setTasks([]); // Set empty array on error
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const [isAddNewOpen, setIsAddNewOpen] = useState(false);
    const [filterValue, setFilterValue] = useState("");
    const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
    const [statusFilter, setStatusFilter] = useState("all");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [sortDescriptor, setSortDescriptor] = useState({
        column: "subject",
        direction: "ascending",
    });
    const [page, setPage] = useState(1);

    const handleSortChange = (column: string) => {
        setSortDescriptor((prevState) => {
            if (prevState.column === column) {
                return {
                    column,
                    direction: prevState.direction === "ascending" ? "descending" : "ascending",
                };
            } else {
                return {
                    column,
                    direction: "ascending",
                };
            }
        });
    };

    // Form setup
    const form = useForm<z.infer<typeof taskSchema>>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            subject: "",
            assigned: "",
            relatedTo: "",
            dueDate: "",
            status: "New",
            priority: "Medium",
            lastReminder: "",
        },
    });

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = React.useMemo(() => {
        if (visibleColumns.size === columns.length) return columns;
        return columns.filter((column) => visibleColumns.has(column.uid));
    }, [visibleColumns]);

    const filteredItems = React.useMemo(() => {
        let filteredTasks = [...tasks];

        if (hasSearchFilter) {
            filteredTasks = filteredTasks.filter((task) => {
                const searchableFields = {
                    subject: task.subject,
                    assigned: task.assigned,
                    relatedTo: task.relatedTo,
                    status: task.status,
                    priority: task.priority,
                };

                return Object.values(searchableFields).some(value =>
                    String(value || '').toLowerCase().includes(filterValue.toLowerCase())
                );
            });
        }

        if (statusFilter !== "all") {
            filteredTasks = filteredTasks.filter((task) =>
                statusFilter === task.status
            );
        }

        return filteredTasks;
    }, [tasks, filterValue, statusFilter]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const sortedItems = React.useMemo(() => {
        return [...items].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof Task];
            const second = b[sortDescriptor.column as keyof Task];
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const handleEditClick = (task: Task) => {
        setSelectedTask(task);
        form.reset({
            id: task._id,
            name: task.name,
            subject: task.subject,
            assigned: task.assigned,
            relatedTo: task.relatedTo,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            status: task.status,
            priority: task.priority,
            lastReminder: task.lastReminder || "",
        });
        setIsEditOpen(true);
    };

    const handleDeleteClick = async (task: Task) => {
        if (!window.confirm("Are you sure you want to delete this task?")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/v1/task/deleteTask/${task._id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete task");
            }

            toast({
                title: "Task Deleted",
                description: "The task has been successfully deleted.",
            });

            fetchTasks();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete task",
                variant: "destructive",
            });
        }
    };


    const onSearchChange = React.useCallback((value: string) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue("");
        }
    }, []);



    const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);  // Reset to page 1 when rows per page changes
    }, []);


    const onPreviousPage = React.useCallback(() => {
        if (page > 1) {
            setPage(page - 1);
        }
    }, [page]);

    const onNextPage = React.useCallback(() => {
        if (page < pages) {
            setPage(page + 1);
        }
    }, [page, pages]);

    const renderCell = React.useCallback((task: Task, columnKey: string) => {
        const cellValue = task[columnKey as keyof Task];

        if ((columnKey === "dueDate") && cellValue) {
            return formatDate(cellValue);
        }

        if (columnKey === "actions") {
            return (
                <div className="relative flex items-center gap-2">
                    <Tooltip content="Edit task">
                        <span
                            className="text-lg text-default-400 cursor-pointer active:opacity-50"
                            onClick={() => handleEditClick(task)}
                        >
                            <Edit className="h-4 w-4" />
                        </span>
                    </Tooltip>
                    <Tooltip color="danger" content="Delete task">
                        <span
                            className="text-lg text-danger cursor-pointer active:opacity-50"
                            onClick={() => handleDeleteClick(task)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </span>
                    </Tooltip>
                </div>
            );
        }

        return cellValue;
    }, [])

    const topContent = React.useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[80%]" // Full width on small screens, 44% on larger screens
                        placeholder="Search by name..."
                        startContent={<SearchIcon className="h-4 w-10 text-muted-foreground" />}
                        value={filterValue}
                        onChange={(e) => setFilterValue(e.target.value)}
                        onClear={() => setFilterValue("")}
                    />

                    <div className="flex gap-3">
                        <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button endContent={<ChevronDownIcon className="text-small" />} variant="default">
                                    Columns
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Table Columns"
                                closeOnSelect={false}
                                selectedKeys={visibleColumns}
                                selectionMode="multiple"
                                onSelectionChange={(keys) => {
                                    const newKeys = new Set<string>(Array.from(keys as Iterable<string>));
                                    setVisibleColumns(newKeys);
                                }}
                                style={{ backgroundColor: "#f0f0f0", color: "#000000" }}  // Set background and font color
                            >
                                {columns.map((column) => (
                                    <DropdownItem key={column.uid} className="capitalize" style={{ color: "#000000" }}>
                                        {column.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>


                        <Button
                            className="addButton"
                            style={{ backgroundColor: 'hsl(339.92deg 91.04% 52.35%)' }}
                            variant="default"
                            size="default"
                            endContent={<PlusCircle />} // Add an icon at the end
                            onClick={() => setIsAddNewOpen(true)}
                        >
                            Add New
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {tasks.length} leads</span>
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent dark:bg-gray-800 outline-none text-default-400 text-small"
                            onChange={onRowsPerPageChange}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [
        filterValue,
        statusFilter,
        visibleColumns,
        onRowsPerPageChange,
        tasks.length,
        onSearchChange,
    ]);



    const bottomContent = React.useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-400">
                    {selectedKeys === "all"
                        ? "All items selected"
                        : `${selectedKeys.size} of ${filteredItems.length} selected`}
                </span>
                <Pagination
                    isCompact
                    // showControls
                    showShadow
                    color="success"
                    page={page}
                    total={pages}
                    onChange={setPage}
                    classNames={{
                        // base: "gap-2 rounded-2xl shadow-lg p-2 dark:bg-default-100",
                        cursor: "bg-[hsl(339.92deg_91.04%_52.35%)] shadow-md",
                        item: "data-[active=true]:bg-[hsl(339.92deg_91.04%_52.35%)] data-[active=true]:text-white rounded-lg",
                    }}
                />

                <div className="rounded-lg bg-default-100 hover:bg-default-200 hidden sm:flex w-[30%] justify-end gap-2">
                    <Button
                        className="bg-[hsl(339.92deg_91.04%_52.35%)]"
                        variant="default"
                        size="sm"
                        disabled={pages === 1} // Use the `disabled` prop
                        onClick={onPreviousPage}
                    >
                        Previous
                    </Button>
                    <Button
                        className="bg-[hsl(339.92deg_91.04%_52.35%)]"
                        variant="default"
                        size="sm"
                        onClick={onNextPage} // Use `onClick` instead of `onPress`
                    >
                        Next
                    </Button>

                </div>
            </div>
        );
    }, [selectedKeys, items.length, page, pages, hasSearchFilter]);



    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function onSubmit(values: z.infer<typeof taskSchema>) {
        setIsSubmitting(true)
        try {
            const response = await fetch("http://localhost:8000/api/v1/task/createTask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || "Failed to submit the task")
            }

            toast({
                title: "Task Submitted",
                description: `Your task has been successfully submitted.`,
            })

            setIsAddNewOpen(false);
            form.reset();

            fetchTasks();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "There was an error submitting the task.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    async function onEdit(values: z.infer<typeof taskSchema>) {
        if (!selectedTask?._id) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`http://localhost:8000/api/v1/task/updateTask/${selectedTask._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update lead");
            }

            toast({
                title: "Lead Updated",
                description: "The lead has been successfully updated.",
            });

            // Close dialog and reset form
            setIsEditOpen(false);
            setSelectedTask(null);
            form.reset();

            // Refresh the leads list
            fetchTasks();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update lead",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }











    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 items-center px-4 w-full border-b shadow-sm">
                    <SidebarTrigger className="mr-2" />
                    <ModeToggle />
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <Breadcrumb>
                        <BreadcrumbList className="flex items-center space-x-2">
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard">
                                    Dashboard
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Tasks</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="flex-1 flex justify-end space-x-4 mr-10">
                        <div className="w-52">
                            <SearchBar />
                        </div>
                    </div>
                </header>

                <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-15 max-w-screen-xl">
                    <Table
                        isHeaderSticky
                        aria-label="Tasks table with custom cells, pagination and sorting"
                        bottomContent={bottomContent}
                        bottomContentPlacement="outside"
                        classNames={{
                            wrapper: "max-h-[382px] text-sm", // Reduced font size (text-sm)
                        }}
                        selectedKeys={selectedKeys}
                        selectionMode="multiple"
                        sortDescriptor={sortDescriptor}
                        topContent={topContent}
                        topContentPlacement="outside"
                        onSelectionChange={setSelectedKeys}
                        onSortChange={(descriptor) => {
                            setSortDescriptor({
                                column: descriptor.column as string,
                                direction: descriptor.direction as "ascending" | "descending",
                            });
                        }}
                    >
                        <TableHeader columns={headerColumns}>
                            {(column) => (
                                <TableColumn
                                    key={column.uid}
                                    align={column.uid === "actions" ? "center" : "start"}
                                    allowsSorting={column.sortable}
                                    style={{ width: column.width }}
                                    onClick={() => handleSortChange(column.uid)} // Trigger sort change on click
                                >
                                    {column.name}
                                    {sortDescriptor?.column === column.uid && (
                                        <span>
                                            {sortDescriptor.direction === "ascending" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody emptyContent="No tasks found" items={sortedItems}>
                            {(item) => (
                                <TableRow key={item._id}>
                                    {(columnKey) => (
                                        <TableCell style={{ fontSize: "12px", padding: "8px" }}> {/* Reduced font size and padding */}
                                            {renderCell(item, columnKey as string)}
                                        </TableCell>
                                    )}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <Dialog open={isAddNewOpen} onOpenChange={setIsAddNewOpen}>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Add New Lead</DialogTitle>
                                <DialogDescription>
                                    Fill in the details to create a new lead.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="subject"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Subject</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter task subject" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="relatedTo"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Related To</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter what the task is related to" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter task name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="assigned"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Assigned To</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter assignee's name"
                                                            {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="taskDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                                >
                                                                    {field.value ? format(field.value, "dd-MM-yyyy") : <span>Pick a date</span>}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => date > new Date()}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="dueDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Due Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                                >
                                                                    {field.value ? format(field.value, "dd-MM-yyyy") : <span>Pick a date</span>}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => date < new Date()}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Status</FormLabel>
                                                    <FormControl>
                                                        <select {...field} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                            <option value="Pending">Pending</option>
                                                            <option value="Resolved">Resolved</option>
                                                            <option value="In Progress">In Progress</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="priority"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Priority</FormLabel>
                                                    <FormControl>
                                                        <select {...field} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                            <option value="High">High</option>
                                                            <option value="Medium">Medium</option>
                                                            <option value="Low">Low</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Task Notes</FormLabel>
                                                <FormControl>
                                                    <textarea
                                                        {...field}
                                                        placeholder="Enter task notes"
                                                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating Task...
                                            </>
                                        ) : (
                                            "Create Task"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Edit Task</DialogTitle>
                                <DialogDescription>
                                    Update the task details.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit((values) => handleEditClick(values))} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="subject"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Subject</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter task subject" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="relatedTo"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Related To</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter what the task is related to" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter task name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="assigned"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Assigned To</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter assignee's name"
                                                            {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="taskDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                                >
                                                                    {field.value ? format(field.value, "dd-MM-yyyy") : <span>Pick a date</span>}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => date > new Date()}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="dueDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Due Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                                >
                                                                    {field.value ? format(field.value, "dd-MM-yyyy") : <span>Pick a date</span>}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => date < new Date()}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Status</FormLabel>
                                                    <FormControl>
                                                        <select {...field} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                            <option value="Pending">Pending</option>
                                                            <option value="Resolved">Resolved</option>
                                                            <option value="In Progress">In Progress</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="priority"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Priority</FormLabel>
                                                    <FormControl>
                                                        <select {...field} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                            <option value="High">High</option>
                                                            <option value="Medium">Medium</option>
                                                            <option value="Low">Low</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Task Notes</FormLabel>
                                                <FormControl>
                                                    <textarea
                                                        {...field}
                                                        placeholder="Enter task notes"
                                                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        value={field.value ? field.value.toString() : ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />


                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating Task...
                                            </>
                                        ) : (
                                            "Update Task"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

function fetchTasks() {
    throw new Error("Function not implemented.")
}
