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
import { SortDescriptor } from "@nextui-org/react"


interface Lead {
    _id: string;
    companyName: string;
    customerName: string;
    contactNumber: string;
    emailAddress: string;
    address: string;
    productName: string;
    amount: string;
    gstNumber: string;
    status: string;
    date: string;
    endDate: string;
    notes: string;
    isActive: string;
}

const generateUniqueId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Returns "YYYY-MM-DD"
};

// Table columns definition
const columns = [
    { name: "COMPANY", uid: "companyName", sortable: true },
    { name: "CUSTOMER", uid: "customerName", sortable: true },
    { name: "CONTACT", uid: "contactNumber", sortable: true },
    { name: "EMAIL", uid: "emailAddress", sortable: true },
    { name: "ADDRESS", uid: "address", sortable: true },
    { name: "PRODUCT", uid: "productName", sortable: true },
    { name: "AMOUNT", uid: "amount", sortable: true },
    { name: "GST", uid: "gstNumber", sortable: true },
    { name: "STATUS", uid: "status", sortable: true },
    {
        name: "DATE",
        uid: "date",
        sortable: true,
        render: (row: any) => formatDate(row.date) // Only date will be shown
    },
    {
        name: "END DATE",
        uid: "endDate",
        sortable: true,
        render: (row: any) => formatDate(row.endDate) // Only date will be shown
    },
    {
        name: "NOTES",
        uid: "notes",
        sortable: true
    },
    { name: "ACTION", uid: "actions", sortable: true },
    // { name: "NOTES", uid: "notes", sortable: true },
];

const INITIAL_VISIBLE_COLUMNS = ["companyName", "customerName", "contactNumber", "emailAddress", "address", "productName", "amount", "gstNumber", "status", "date", "endDate", "notes", "actions"];

const formSchema = z.object({
    companyName: z.string().min(2, { message: "Company name is required." }),
    customerName: z.string().min(2, { message: "Customer name must be at least 2 characters." }),
    contactNumber: z.string().optional(), // Optional field
    emailAddress: z.string().email({ message: "Invalid email address" }),
    address: z.string().min(2, { message: "Address is required." }),
    productName: z.string().min(2, { message: "Product name is required." }),
    amount: z.number().positive({ message: "Amount must be positive." }),
    gstNumber: z.string().min(1, { message: "GST Number is required." }),
    status: z.enum(["New", "Discussion", "Demo", "Proposal", "Decided"]),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date",
      }).transform((val) => new Date(val)),  // ✅ Convert string to Date
    
      endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date",
      }).transform((val) => new Date(val)),  // ✅ Convert string to Date
    notes: z.string().optional(),
    isActive: z.boolean(),
})

export default function LeadPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set());


    const fetchLeads = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/v1/lead/getAllLeads"
            );

            // Log the response structure
            console.log('Full API Response:', {
                status: response.status,
                data: response.data,
                type: typeof response.data,
                hasData: 'data' in response.data
            });

            // Handle the response based on its structure
            let leadsData;
            if (typeof response.data === 'object' && 'data' in response.data) {
                // Response format: { data: [...leads] }
                leadsData = response.data.data;
            } else if (Array.isArray(response.data)) {
                // Response format: [...leads]
                leadsData = response.data;
            } else {
                console.error('Unexpected response format:', response.data);
                throw new Error('Invalid response format');
            }

            // Ensure leadsData is an array
            if (!Array.isArray(leadsData)) {
                leadsData = [];
            }

            // Map the data with safe key generation
            const leadsWithKeys = leadsData.map((lead: Lead) => ({
                ...lead,
                key: lead._id || generateUniqueId()
            }));

            setLeads(leadsWithKeys);
            setError(null); // Clear any previous errors
        } catch (error) {
            console.error("Error fetching leads:", error);
            if (axios.isAxiosError(error)) {
                setError(`Failed to fetch leads: ${error.response?.data?.message || error.message}`);
            } else {
                setError("Failed to fetch leads.");
            }
            setLeads([]); // Set empty array on error
        }
    };

    useEffect(() => {
        fetchLeads();
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

    // Form setup
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            companyName: "",
            customerName: "",
            emailAddress: "",
            contactNumber: "",
            address: "",
            productName: "",
            amount: 0,
            gstNumber: "",
            status: "New",
            date: "",
            endDate: "",
            notes: "",
            isActive: true,
        },
    })

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = React.useMemo(() => {
        if (visibleColumns.size === columns.length) return columns; // Check if all columns are selected
        return columns.filter((column) => visibleColumns.has(column.uid));
      }, [visibleColumns]);

    const filteredItems = React.useMemo(() => {
        let filteredLeads = [...leads];

        if (hasSearchFilter) {
            filteredLeads = filteredLeads.filter((lead) => {
                const searchableFields = {
                    companyName: lead.companyName,
                    customerName: lead.customerName,
                    emailAddress: lead.emailAddress,
                    productName: lead.productName,
                    status: lead.status,
                    notes: lead.notes,
                };

                return Object.values(searchableFields).some(value =>
                    String(value || '').toLowerCase().includes(filterValue.toLowerCase())
                );
            });
        }

        if (statusFilter !== "all") {
            filteredLeads = filteredLeads.filter((lead) =>
                statusFilter === lead.status
            );
        }

        return filteredLeads;
    }, [leads, filterValue, statusFilter]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const sortedItems = React.useMemo(() => {
        return [...items].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof Lead];
            const second = b[sortDescriptor.column as keyof Lead];
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    // Function to handle edit button click
    const handleEditClick = (lead: Lead) => {
        setSelectedLead(lead);
        // Pre-fill the form with lead data
        form.reset({
            companyName: lead.companyName,
            customerName: lead.customerName,
            emailAddress: lead.emailAddress,
            contactNumber: lead.contactNumber || "",
            address: lead.address,
            productName: lead.productName,
            amount: parseFloat(lead.amount),
            gstNumber: lead.gstNumber,
            status: lead.status as "New" | "Discussion" | "Demo" | "Proposal" | "Decided",
            date: lead.date ? new Date(lead.date) : undefined,
            endDate: lead.endDate ? new Date(lead.endDate) : undefined,
            notes: lead.notes || "",
            isActive: lead.isActive === "true",
        });
        setIsEditOpen(true);
    };

    // Function to handle delete button click
    const handleDeleteClick = async (lead: Lead) => {
        if (!window.confirm("Are you sure you want to delete this lead?")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/v1/lead/deleteLead/${lead._id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete lead");
            }

            toast({
                title: "Lead Deleted",
                description: "The lead has been successfully deleted.",
            });

            // Refresh the leads list
            fetchLeads();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete lead",
                variant: "destructive",
            });
        }
    };

    // Function to handle edit form submission
    async function onEdit(values: z.infer<typeof formSchema>) {
        if (!selectedLead?._id) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`http://localhost:8000/api/v1/lead/updateLead/${selectedLead._id}`, {
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
            setSelectedLead(null);
            form.reset();

            // Refresh the leads list
            fetchLeads();
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


    const renderCell = React.useCallback((lead: Lead, columnKey: string) => {
        const cellValue = lead[columnKey as keyof Lead];

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
                            onClick={() => handleEditClick(lead)}
                        >
                            <Edit className="h-4 w-4" />
                        </span>
                    </Tooltip>
                    <Tooltip color="danger" content="Delete lead">
                        <span
                            className="text-lg text-danger cursor-pointer active:opacity-50"
                            onClick={() => handleDeleteClick(lead)}
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
                          className="w-full sm:max-w-[44%]"
                          placeholder="Search by name..."
                          startContent={<SearchIcon className="h-4 w-4 text-muted-foreground" />}
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
                                className="bg-gray-200 dark:bg-gray-800 backdrop-blur-sm transition-colors duration-300"
                            >
                                {columns.map((column) => (
                                    <DropdownItem key={column.uid} className="capitalize">
                                        {column.name}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>

                        </Dropdown>
                        <Button
                            className="addButton"
                            style={{ backgroundColor: 'hsl(339.92deg 91.04% 52.35%)' }}
                            color="primary"
                            endContent={<PlusCircle />}
                            onClick={() => setIsAddNewOpen(true)}
                        >
                            Add New
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {leads.length} leads</span>
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
        leads.length,
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

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            const response = await fetch("http://localhost:8000/api/v1/lead/createLead", {
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
            fetchLeads();
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
                            <div  className="w-52">
                                <SearchBar/>
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
                            wrapper: "max-h-[382px]",
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
                          }}                    >
                        <TableHeader columns={headerColumns}>
                            {(column) => (
                                <TableColumn
                                    key={column.uid}
                                    align={column.uid === "actions" ? "center" : "start"}
                                    allowsSorting={column.sortable}
                                >
                                    {column.name}
                                </TableColumn>
                            )}
                        </TableHeader>
                        <TableBody emptyContent={"No leads found"} items={sortedItems}>
                            {(item) => (
                                <TableRow key={item._id}>
                                    {(columnKey) => (
                                        <TableCell>
                                            {renderCell(item,  columnKey as string)}
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
                                            name="customerName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Customer Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter customer name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter address" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="productName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter product name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="amount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Amount</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter amount"
                                                            type="number"
                                                            {...field}
                                                            onChange={(e) => {
                                                                // Convert the string value to a number
                                                                const value = e.target.valueAsNumber || 0; // Use `valueAsNumber` to get a number
                                                                field.onChange(value); // Pass the number to the form
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="gstNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>GST Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter GST number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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
                                                            <option value="New">New</option>
                                                            <option value="Discussion">Discussion</option>
                                                            <option value="Demo">Demo</option>
                                                            <option value="Proposal">Proposal</option>
                                                            <option value="Decided">Decided</option>
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

                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Start Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="endDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>End Date</FormLabel>
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
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Notes</FormLabel>
                                                <FormControl>
                                                    <textarea
                                                        placeholder="Enter notes"
                                                        {...field}
                                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit Lead"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Edit Lead</DialogTitle>
                                <DialogDescription>
                                    Update the lead details.
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
                                            name="customerName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Customer Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter customer name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                                        <FormField
                                            control={form.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter address" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="productName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter product name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="amount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Amount</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Enter amount"
                                                            type="number"
                                                            {...field}
                                                            onChange={(e) => {
                                                                const value = e.target.valueAsNumber || 0;
                                                                field.onChange(value);
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="gstNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>GST Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter GST number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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
                                                            <option value="New">New</option>
                                                            <option value="Discussion">Discussion</option>
                                                            <option value="Demo">Demo</option>
                                                            <option value="Proposal">Proposal</option>
                                                            <option value="Decided">Decided</option>
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
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Start Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                                >
                                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                                            name="endDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>End Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                                >
                                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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

                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Notes</FormLabel>
                                                <FormControl>
                                                    <textarea
                                                        placeholder="Enter notes"
                                                        {...field}
                                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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