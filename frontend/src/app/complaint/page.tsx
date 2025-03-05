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
import { date, z } from "zod"
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



interface Complaint {
    _id: string;
    companyName: string;
    complainerName: string;
    contactNumber: string;
    emailAddress: string;
    subject: string;
    date: string;
    casaStatus: string;
    priority: string;
    caseOrigin: string;

}

const generateUniqueId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Returns "YYYY-MM-DD"
};

const columns = [
    { name: "COMPANY NAME", uid: "companyName", sortable: true, width: "120px" },
    { name: "COMPLAINER NAME", uid: "complainerName", sortable: true, width: "120px" },
    { name: "CONTACT NUMBER", uid: "contactNumber", sortable: true, width: "100px" },
    { name: "EMAIL", uid: "emailAddress", sortable: true, width: "150px" },
    { name: "SUBJECT", uid: "subject", sortable: true, width: "180px" },


    {
        name: "DATE",
        uid: "date",
        sortable: true,
        width: "150px",
        render: (row: any) => formatDate(row.date),
    }
    ,
    { name: "CASESTATUS", uid: "casaStatus  ", sortable: true, width: "100px" },
    { name: "PRIORITY", uid: "priority", sortable: true, width: "100px" },
    { name: "CASEORIGIN", uid: "caseOrigin", sortable: true, width: "100px" },

    { name: "ACTION", uid: "actions", sortable: true, width: "100px" },
];
const INITIAL_VISIBLE_COLUMNS = ["companyName", "complainerName", "contactNumber", "emailAddress", "subject", "date", "casaStatus", "priority", "caseOrigin", "actions"];

const complaintSchema = z.object({
    companyName: z.string().min(2, { message: "Company name is required." }),

    complainerName: z.string().min(2, { message: "Complainer name is required." }),

    contactNumber: z.string().optional(),

    emailAddress: z.string().email({ message: "Invalid email address." }),

    subject: z.string().min(2, { message: "Subject is required." }),

    date: z.date().optional(),

    caseStatus: z.enum(["Pending", "Resolved", "In Progress"]),

    priority: z.enum(["High", "Medium", "Low"]),

    caseOrigin: z.string().optional(),
})

export default function ComplaintPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set());


// Fetch all complaints
const fetchComplaints = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/complaint/getAllComplaints"
      );
      setComplaints(response.data.complaints || []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      
 toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete invoice",
                variant: "destructive",
            });    }
  };
    

    useEffect(() => {
        fetchComplaints();
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
            // Check if the column being clicked is the current sorted column
            if (prevState.column === column) {
                // Toggle direction if the same column is clicked again
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
    const form = useForm<z.infer<typeof complaintSchema>>({
        resolver: zodResolver(complaintSchema),
        defaultValues: {
            companyName: "",
            complainerName: "",
            contactNumber: "",
            emailAddress: "",
            subject: "",
            date: new Date(),
            caseStatus: "Pending",
            priority: "Medium",
            caseOrigin: "",
        },
    })

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = React.useMemo(() => {
        if (visibleColumns.size === columns.length) return columns; // Check if all columns are selected
        return columns.filter((column) => visibleColumns.has(column.uid));
    }, [visibleColumns]);

    const filteredItems = React.useMemo(() => {
        let filteredComplaints = [...complaints];

        if (hasSearchFilter) {
            filteredComplaints = filteredComplaints.filter((complaint) => {
                const searchableFields = {
                    companyName: complaint.companyName,
                    complainerName: complaint.complainerName,
                    emailAddress: complaint.emailAddress,
                    contactNumber: complaint.contactNumber,
                    date: complaint.date,
                    caseStatus: complaint.casaStatus,
                    priority: complaint.priority,
                    caseOrigin: complaint.caseOrigin,

                };

                return Object.values(searchableFields).some(value =>
                    String(value || '').toLowerCase().includes(filterValue.toLowerCase())
                );
            });
        }

        

        return filteredComplaints;
    }, [complaints, filterValue, statusFilter]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const sortedItems = React.useMemo(() => {
        return [...items].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof Complaint];
            const second = b[sortDescriptor.column as keyof Complaint];
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedcomplaint, setSelectedcomplaint] = useState<Complaint | null>(null);

    // Function to handle edit button click
    const handleEditClick = (complaint: Complaint) => {
        setSelectedcomplaint(complaint);

        form.reset({
            companyName: complaint.companyName,
            complainerName: complaint.complainerName,
            emailAddress: complaint.emailAddress,
            contactNumber: complaint.contactNumber,
            subject: complaint.subject,
            date: new Date(complaint.date),
            caseStatus: complaint.casaStatus,
            priority: complaint.priority as "High" | "Medium" | "Low",
            caseOrigin: complaint.caseOrigin,
        });
        setIsEditOpen(true);
    };

    // Function to handle delete button click
    const handleDeleteClick = async (complaint: Complaint) => {
        if (!window.confirm("Are you sure you want to delete this deal?")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/v1/complaint/deleteComplaint/${complaint._id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete deal");
            }

            toast({
                title: "deal Deleted",
                description: "The deal has been successfully deleted.",
            });

            // Refresh the leads list
            fetchComplaints();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete complaint",
                variant: "destructive",
            });
        }
    };

    // Function to handle edit form submission
    async function onEdit(values: z.infer<typeof complaintSchema>) {
        if (!selectedcomplaint?._id) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`http://localhost:8000/api/v1/complaint/updateComplaint/${selectedcomplaint._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update deal");
            }

            toast({
                title: "deal Updated",
                description: "The deal has been successfully updated.",
            });

            // Close dialog and reset form
            setIsEditOpen(false);
            setSelectedcomplaint(null);
            form.reset();

            // Refresh the leads list
            fetchComplaints();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update deal",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }


    const renderCell = React.useCallback((complaint: Complaint, columnKey: string) => {
        const cellValue = complaint[columnKey as keyof Complaint];

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
                    <Tooltip content="Edit deal">
                        <span
                            className="text-lg text-default-400 cursor-pointer active:opacity-50"
                            onClick={() => handleEditClick(complaint)}
                        >
                            <Edit className="h-4 w-4" />
                        </span>
                    </Tooltip>
                    <Tooltip color="danger" content="Delete deal">
                        <span
                            className="text-lg text-danger cursor-pointer active:opacity-50"
                            onClick={() => handleDeleteClick(complaint)}
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
                    <span className="text-default-400 text-small">Total {complaints.length} complaints</span>
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
        complaints.length,
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

    async function onSubmit(values: z.infer<typeof complaintSchema>) {
        setIsSubmitting(true)
        try {
            const response = await fetch("http://localhost:8000/api/v1/complaint/createComplaint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || "Failed to submit the complaint.")
            }

            toast({
                title: "complaint Submitted",
                description: `Your deal has been successfully submitted.`,
            })

            // Close dialog and reset form
            setIsAddNewOpen(false);
            form.reset();

            // Refresh the leads list
            fetchComplaints();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "There was an error submitting the deal.",
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
                                <BreadcrumbPage>deal</BreadcrumbPage>
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
                        aria-label="deal table with custom cells, pagination and sorting"
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
                        <TableBody emptyContent="No deal found" items={sortedItems}>
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
                                <DialogTitle>Add New Complaint</DialogTitle>
                                <DialogDescription>
                                    Fill in the details to create a new Complaint.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="companyName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Company Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter company name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="complainerName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Complainer Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter complainer name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="contactNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Contact Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter contact number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="emailAddress"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter email address" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

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
                                            name="date"
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
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="caseStatus"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Case Status</FormLabel>
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
                                        name="caseOrigin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Case Origin</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter case origin" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating Complaint...
                                            </>
                                        ) : (
                                            "Create Complaint"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Edit Complaint</DialogTitle>
                                <DialogDescription>
                                    Update the complaint details.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onEdit)} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="companyName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Company Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter company name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="complainerName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Complainer Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter complainer name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="contactNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Contact Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter contact number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="emailAddress"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter email address" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

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
                                            name="date"
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
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="caseStatus"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Case Status</FormLabel>
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


                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            "Update Deal"
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