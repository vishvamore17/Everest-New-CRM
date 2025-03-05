"use client"

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



interface ScheduledEvents {
    id: string;
    subject: string;
    assignedUser: string;
    customer: string;
    location: string;
    status: string;
    eventType: string;
    priority: string;
    description: string;
    reminder: string;
    recurrence: string;
    date: string;


}

const generateUniqueId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Returns "YYYY-MM-DD"
};

const columns = [
    { name: "SUBJECT", uid: "subject", sortable: true, width: "120px" },
    { name: "ASSINGNED USER", uid: "assignedUser", sortable: true, width: "120px" },
    { name: "CUSTOMER NAME", uid: "customer", sortable: true, width: "100px" },
    { name: "LOCATION", uid: "location", sortable: true, width: "150px" },
    { name: "STATUS", uid: "status", sortable: true, width: "180px" },
    { name: "EVENT TYPE", uid: "eventType", sortable: true, width: "120px" },
    { name: "PRIORITY", uid: "priority", sortable: true, width: "100px" },
    { name: "DESCRIPTION", uid: "description", sortable: true, width: "100px" },
    { name: "REMINDER", uid: "reminder", sortable: true, width: "100px" },
    { name: "RECURRENCE", uid: "recurrence", sortable: true, width: "100px" },

    {
        name: "DATE",
        uid: "date",
        sortable: true,
        width: "150px",
        render: (row: any) => formatDate(row.date),
    }
    ,

    { name: "ACTION", uid: "actions", sortable: true, width: "100px" },
];
const INITIAL_VISIBLE_COLUMNS = ["subject", "assignedUser", "customer", "location", "status", "eventType", "priority", "description", "reminder", "recurrence", "date", "actions"];

const eventSchema = z.object({
    subject: z.string().min(2, { message: "Subject is required." }),
    assignedUser: z.string().min(2, { message: "Assigned user is required." }),
    customer: z.string().min(2, { message: "Customer is required." }),
    location: z.string().min(2, { message: "Location is required." }),
    status: z.enum(["Scheduled", "Completed", "Cancelled", "Postpone"], { message: "Status is required." }),
    eventType: z.enum(["call", "Call", "Meeting", "meeting", "Demo", "demo", "Follow-Up", "follow-up"], { message: "Event type is required." }),
    priority: z.enum(["Low", "low", "Medium", "medium", "High", "high"], { message: "Priority is required." }),
    description: z.string().optional(),
    reminder: z.number().optional(),
    recurrence: z.enum(["one-time", "Daily", "Weekly", "Monthly", "Yearly"], { message: "Recurrence is required." }),
    date: z.string().min(2, { message: "Date is required." }),
    isActive: z.boolean(),
})

export default function ScheduledEvents() {
    const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvents[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set());


    const fetchScheduledEvents = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/v1/secheduledevents/getAllScheduledEvents"
            );

            // Log the response structure
            console.log('Full API Response:', {
                status: response.status,
                data: response.data,
                type: typeof response.data,
                hasData: 'data' in response.data
            });

            // Handle the response based on its structure
            let scheduledEventsData;
            if (typeof response.data === 'object' && 'data' in response.data) {
                // Response format: { data: [...leads] }
                scheduledEventsData = response.data.data;
            } else if (Array.isArray(response.data)) {
                // Response format: [...leads]
                scheduledEventsData = response.data;
            } else {
                console.error('Unexpected response format:', response.data);
                throw new Error('Invalid response format');
            }

            // Ensure leadsData is an array
            if (!Array.isArray(scheduledEventsData)) {
                scheduledEventsData = [];
            }

            // Map the data with safe key generation
            const ScheduledEventsWithKeys = scheduledEventsData.map((scheduledEvents: ScheduledEvents) => ({
                ...scheduledEvents,
                key: scheduledEvents.id || generateUniqueId()
            }));

            setScheduledEvents(ScheduledEventsWithKeys);
            setError(null); // Clear any previous errors
        } catch (error) {
            console.error("Error fetching ScheduledEvents:", error);
            if (axios.isAxiosError(error)) {
                setError(`Failed to fetch ScheduledEvents: ${error.response?.data?.message || error.message}`);
            } else {
                setError("Failed to fetch ScheduledEvents.");
            }
            setScheduledEvents([]); // Set empty array on error
        }
    };

    useEffect(() => {
        fetchScheduledEvents();
    }, []);

    const [isAddNewOpen, setIsAddNewOpen] = useState(false);
    const [filterValue, setFilterValue] = useState("");
    const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
    const [statusFilter, setStatusFilter] = useState("all");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [sortDescriptor, setSortDescriptor] = useState({
        column: "companyName",
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
    const form = useForm<z.infer<typeof eventSchema>>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            subject: "",
            assignedUser: "",
            customer: "",
            location: "",
            status: "Scheduled",
            eventType: "call",
            priority: "Medium",
            description: "",
            reminder: undefined,
            recurrence: "one-time",
            date: "",
        },
    })

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = React.useMemo(() => {
        if (visibleColumns.size === columns.length) return columns;
        return columns.filter((column) => visibleColumns.has(column.uid));
    }, [visibleColumns]);

    const filteredItems = React.useMemo(() => {
        let filteredScheduledEvents = [...scheduledEvents];

        if (hasSearchFilter) {
            filteredScheduledEvents = filteredScheduledEvents.filter((scheduledEvents) => {
                const searchableFields = {
                    subject: scheduledEvents.subject,
                    assignedUser: scheduledEvents.assignedUser,
                    customer: scheduledEvents.customer,
                    location: scheduledEvents.location,
                    status: scheduledEvents.status,
                    eventType: scheduledEvents.eventType,
                    prioroty: scheduledEvents.priority,
                    description: scheduledEvents.description,
                    reminder: scheduledEvents.reminder,
                    recurrence: scheduledEvents.recurrence,
                    date: scheduledEvents.date

                };

                return Object.values(searchableFields).some(value =>
                    String(value || '').toLowerCase().includes(filterValue.toLowerCase())
                );
            });
        }

        if (statusFilter !== "all") {
            filteredScheduledEvents = filteredScheduledEvents.filter((scheduledEvents) =>
                statusFilter === scheduledEvents.status
            );
        }

        return filteredScheduledEvents;
    }, [scheduledEvents, filterValue, statusFilter]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const sortedItems = React.useMemo(() => {
        return [...items].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof ScheduledEvents];
            const second = b[sortDescriptor.column as keyof ScheduledEvents];
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedScheduledEvents, setSelectedScheduledEvents] = useState<ScheduledEvents | null>(null);

    // Function to handle edit button click
    const handleEditClick = (scheduledEvents: ScheduledEvents) => {
        setSelectedScheduledEvents(scheduledEvents);
        // Pre-fill the form with lead data
        form.reset({
            subject: scheduledEvents.subject,
            assignedUser: scheduledEvents.assignedUser,
            customer: scheduledEvents.customer,
            location: scheduledEvents.location,
            status: scheduledEvents.status,
            eventType: scheduledEvents.eventType,
            priority: scheduledEvents.priority,
            description: scheduledEvents.description,
            reminder: scheduledEvents.reminder,
            recurrence: scheduledEvents.recurrence,
            date: scheduledEvents.date ? new Date(scheduledEvents.date) : undefined,

        });
        setIsEditOpen(true);
    };

    // Function to handle delete button click
    const handleDeleteClick = async (scheduledEvents: ScheduledEvents) => {
        if (!window.confirm("Are you sure you want to delete this scheduled?")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/v1/scheduledevents/deleteScheduledEvent/${scheduledEvents.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete scheduled");
            }

            toast({
                title: "Scheduled Deleted",
                description: "The scheduled has been successfully deleted.",
            });

            // Refresh the leads list
            fetchScheduledEvents();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete lead",
                variant: "destructive",
            });
        }
    };

    // Function to handle edit form submission
    async function onEdit(values: z.infer<typeof eventSchema>) {
        if (!selectedScheduledEvents?.id) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`http://localhost:8000/api/v1/scheduledevents/updateScheduledEvent/${selectedScheduledEvents.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update scheduled");
            }

            toast({
                title: "Scheduled Updated",
                description: "The Scheduled has been successfully updated.",
            });

            // Close dialog and reset form
            setIsEditOpen(false);
            setSelectedScheduledEvents(null);
            form.reset();

            // Refresh the leads list
            fetchScheduledEvents();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update scheduled",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }


    const renderCell = React.useCallback((scheduledEvents: ScheduledEvents, columnKey: string) => {
        const cellValue = scheduledEvents[columnKey as keyof ScheduledEvents];

        // Format dates if the column is "date" or "endDate"
        if ((columnKey === "date" || columnKey === "endDate") && cellValue) {
            return formatDate(cellValue);
        }
        // Render note column with a fallback message if there's no note
        if (columnKey === "notes") {
            return cellValue || "No note available";
        }
        // Render actions column with edit and delete buttons
        if (columnKey === "actions") {
            return (
                <div className="relative flex items-center gap-2">
                    <Tooltip content="Edit lead">
                        <span
                            className="text-lg text-default-400 cursor-pointer active:opacity-50"
                            onClick={() => handleEditClick(scheduledEvents)}
                        >
                            <Edit className="h-4 w-4" />
                        </span>
                    </Tooltip>
                    <Tooltip color="danger" content="Delete lead">
                        <span
                            className="text-lg text-danger cursor-pointer active:opacity-50"
                            onClick={() => handleDeleteClick(scheduledEvents)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </span>
                    </Tooltip>
                </div>
            );
        }

        // For all other columns, return the raw cell value
        return cellValue;
    }, []);


    const onNextPage = React.useCallback(() => {
        if (page < pages) {
            setPage(page + 1);
        }
    }, [page, pages]);

    const onPreviousPage = React.useCallback(() => {
        if (page > 1) {
            setPage(page - 1);
        }
    }, [page]);

    const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);
    }, []);

    const onSearchChange = React.useCallback((value: string) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue("");
        }
    }, []);

    const onClear = React.useCallback(() => {
        setFilterValue("");
        setPage(1);
    }, []);

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
                    <span className="text-default-400 text-small">Total {scheduledEvents.length} Scheduled events</span>
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent dark:bg-gray-800 outline-none text-default-400 text-small"
                            onChange={onRowsPerPageChange}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
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
        scheduledEvents.length,
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

    async function onSubmit(values: z.infer<typeof eventSchema>) {
        setIsSubmitting(true)
        try {
            const response = await fetch("http://localhost:8000/api/v1/scheduledevents/createScheduledEvent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || "Failed to submit the lead")
            }

            toast({
                title: "Lead Submitted",
                description: `Your lead has been successfully submitted.`,
            })

            // Close dialog and reset form
            setIsAddNewOpen(false);
            form.reset();

            // Refresh the leads list
            fetchScheduledEvents();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "There was an error submitting the lead.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
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
                                <BreadcrumbPage>Lead</BreadcrumbPage>
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
                        aria-label="Leads table with custom cells, pagination and sorting"
                        bottomContent={bottomContent}
                        bottomContentPlacement="outside"
                        classNames={{
                            wrapper: "max-h-[382px] text-sm", // Reduced font size (text-sm)
                        }}
                        selectedKeys={selectedKeys}
                    
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
                        <TableBody emptyContent="No scheduled events found" items={sortedItems}>
                            {(item) => (
                                <TableRow key={item.id}>
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
                                                        <Input placeholder="Enter subject" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="assignedUser"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Assigned User</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter assigned user" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="customer"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Customer</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter customer" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Location</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter location" {...field} />
                                                    </FormControl>
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
                                                        <select
                                                            {...field}
                                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="Scheduled">Scheduled</option>
                                                            <option value="Completed">Completed</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                            <option value="Postpone">Postpone</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="eventType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Event Type</FormLabel>
                                                    <FormControl>
                                                        <select
                                                            {...field}
                                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="call">Call</option>
                                                            <option value="Meeting">Meeting</option>
                                                            <option value="Demo">Demo</option>
                                                            <option value="Follow-Up">Follow-Up</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="priority"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Priority</FormLabel>
                                                    <FormControl>
                                                        <select
                                                            {...field}
                                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="Low">Low</option>
                                                            <option value="Medium">Medium</option>
                                                            <option value="High">High</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="reminder"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Reminder</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="Enter reminder in minutes" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="recurrence"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Recurrence</FormLabel>
                                                    <FormControl>
                                                        <select
                                                            {...field}
                                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="one-time">One-Time</option>
                                                            <option value="Daily">Daily</option>
                                                            <option value="Weekly">Weekly</option>
                                                            <option value="Monthly">Monthly</option>
                                                            <option value="Yearly">Yearly</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter description" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating Event...
                                            </>
                                        ) : (
                                            "Create Event"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Edit Scheduled event</DialogTitle>
                                <DialogDescription>
                                    Update the scheduled details.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onEdit)} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="subject"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Subject</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter subject" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="assignedUser"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Assigned User</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter assigned user" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="customer"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Customer</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter customer" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Location</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter location" {...field} />
                                                    </FormControl>
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
                                                        <select
                                                            {...field}
                                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="Scheduled">Scheduled</option>
                                                            <option value="Completed">Completed</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                            <option value="Postpone">Postpone</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="eventType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Event Type</FormLabel>
                                                    <FormControl>
                                                        <select
                                                            {...field}
                                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="call">Call</option>
                                                            <option value="Meeting">Meeting</option>
                                                            <option value="Demo">Demo</option>
                                                            <option value="Follow-Up">Follow-Up</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="priority"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Priority</FormLabel>
                                                    <FormControl>
                                                        <select
                                                            {...field}
                                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="Low">Low</option>
                                                            <option value="Medium">Medium</option>
                                                            <option value="High">High</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="reminder"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Reminder</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="Enter reminder in minutes" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="recurrence"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Recurrence</FormLabel>
                                                    <FormControl>
                                                        <select
                                                            {...field}
                                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="one-time">One-Time</option>
                                                            <option value="Daily">Daily</option>
                                                            <option value="Weekly">Weekly</option>
                                                            <option value="Monthly">Monthly</option>
                                                            <option value="Yearly">Yearly</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter description" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />


                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            "Update Lead"
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