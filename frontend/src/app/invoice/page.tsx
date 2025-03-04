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
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Edit, Trash2, Loader2, PlusCircle, SearchIcon, ChevronDownIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import axios from "axios";
import { Chip, DatePicker, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Pagination, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, User } from "@heroui/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SearchBar from '@/components/globalSearch'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface Invoice {
    _id: string;
    companyName: string;
    customerName: string;
    contactNumber: string;
    emailAddress: string;
    address: string;
    gstNumber: string;
    productName: string;
    amount: number;
    discount: number;
    gstRate: number;
    status: string;
    date: string;
    endDate: string;
    totalWithoutGst: number;
    totalWithGst: number;
    paidAmount: number;
    remainingAmount: number;
}

export const invoiceSchema = z.object({
    companyName: z.string().min(2, { message: "Company name is required." }),
    customerName: z.string().min(2, { message: "Customer name must be at least 2 characters." }),
    contactNumber: z.string().min(10, { message: "Contact number is required." }),
    emailAddress: z.string().email({ message: "Invalid email address" }),
    address: z.string().min(2, { message: "Address is required." }),
    gstNumber: z.string().min(1, { message: "GST number is required." }),
    productName: z.string().min(2, { message: "Product name is required." }),
    amount: z.coerce.number().positive({ message: "Amount must be positive." }),
    discount: z.coerce.number().min(0).default(0),
    gstRate: z.coerce.number().min(0).default(0),
    status: z.enum(["New", "Paid", "Pending"]).default("New"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date",
      }).transform((val) => new Date(val)),  // ✅ Convert string to Date
    
      endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date",
      }).transform((val) => new Date(val)),  // ✅ Convert string to Date
    totalWithoutGst: z.coerce.number().min(0).default(0),
    totalWithGst: z.coerce.number().min(0).default(0),
    paidAmount: z.coerce.number().min(0).default(0),
    remainingAmount: z.coerce.number().min(0).default(0)
});
const formatDate = (date: any) => {
    if (!date) return "N/A"; // Handle undefined/null values gracefully
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "Invalid Date"; // Handle invalid dates
    return parsedDate.toLocaleDateString("en-GB"); // Format: DD/MM/YYYY
};
// Table columns definition
const columns = [
    { name: "COMPANY", uid: "companyName", sortable: true },
    { name: "CUSTOMER", uid: "customerName", sortable: true },
    { name: "CONTACT", uid: "contactNumber", sortable: true },
    { name: "EMAIL", uid: "emailAddress", sortable: true },
    { name: "ADDRESS", uid: "address", sortable: true },
    { name: "GST NUMBER", uid: "gstNumber", sortable: true },
    { name: "PRODUCT", uid: "productName", sortable: true },
    { name: "AMOUNT", uid: "amount", sortable: true },
    { name: "DISCOUNT", uid: "discount", sortable: true },
    { name: "GST RATE", uid: "gstRate", sortable: true },
    { name: "STATUS", uid: "status", sortable: true },
    {
        name: "DATE",
        uid: "date",
        sortable: true,
        render: (row: any) => formatDate(row.date) // Ensure only date is shown
    },
    {
        name: "END DATE",
        uid: "endDate",
        sortable: true,
        render: (row: any) => formatDate(row.endDate) // Ensure only date is shown
    },
    { name: "TOTAL (WITHOUT GST)", uid: "totalWithoutGst", sortable: true },
    { name: "TOTAL (WITH GST)", uid: "totalWithGst", sortable: true },
    { name: "PAID AMOUNT", uid: "paidAmount", sortable: true },
    { name: "REMAINING AMOUNT", uid: "remainingAmount", sortable: true },
    { name: "ACTION", uid: "actions", sortable: true }
];

const INITIAL_VISIBLE_COLUMNS = ["companyName", "customerName", "contactNumber", "emailAddress", "address", "gstNumber", "productName", "amount", "discount", "gstRate", "status", "date", "endDate", "totalWithoutGst", "totalWithGst", "paidAmount", "remainingAmount", "actions"];

const formSchema = invoiceSchema;

export default function InvoicePage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const fetchInvoices = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("http://localhost:8000/api/v1/invoice/getAllInvoices");
            const invoicesData = Array.isArray(response.data) ? response.data : response.data.data || [];
            setInvoices(invoicesData);
            setError(null);
        } catch (error) {
            console.error("Error fetching invoices:", error);
            setError(error instanceof Error ? error.message : "Failed to fetch invoices");
            setInvoices([]);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchInvoices();
    }, []);

    const [isAddNewOpen, setIsAddNewOpen] = useState(false);
    const [filterValue, setFilterValue] = useState("");
    const [selectedKeys, setSelectedKeys] = useState(new Set([]));
    const [visibleColumns, setVisibleColumns] = useState(new Set(INITIAL_VISIBLE_COLUMNS));
    const [statusFilter, setStatusFilter] = useState("all");
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortDescriptor, setSortDescriptor] = useState({
        column: "companyName",
        direction: "ascending",
    });
    const [page, setPage] = useState(1);

const onRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page to prevent out-of-range issues
};
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
            discount: 0,
            gstRate: 0,
            status: "New",
            date: new Date(),
            endDate: new Date(),
            totalWithoutGst: 0,
            totalWithGst: 0,
            paidAmount: 0,
            remainingAmount: 0,
        }
    })

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = React.useMemo(() => {
        if (visibleColumns === "all") return columns;
        return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
    }, [visibleColumns]);

    const filteredItems = React.useMemo(() => {
        let filteredInvoices = [...invoices];

        if (hasSearchFilter) {
            filteredInvoices = filteredInvoices.filter((invoice) => {
                const searchableFields = {
                    companyName: invoice.companyName,
                    customerName: invoice.customerName,
                    emailAddress: invoice.emailAddress,
                    productName: invoice.productName,
                    status: invoice.status,
                    gstNumber: invoice.gstNumber,
                    contactNumber: invoice.contactNumber,
                    address: invoice.address,
                    date: invoice.date,
                };

                return Object.values(searchableFields).some(value =>
                    String(value || '').toLowerCase().includes(filterValue.toLowerCase())
                );
            });
        }

        if (statusFilter !== "all") {
            filteredInvoices = filteredInvoices.filter((invoice) =>
                statusFilter === invoice.status
            );
        }

        return filteredInvoices;
    }, [invoices, filterValue, statusFilter]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const sortedItems = React.useMemo(() => {
        return [...items].sort((a, b) => {
            const first = a[sortDescriptor.column as keyof Invoice];
            const second = b[sortDescriptor.column as keyof Invoice];
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);

    // Function to handle edit button click
    const handleEditClick = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        // Pre-fill the form with invoice data
        form.reset({
            companyName: invoice.companyName,
            customerName: invoice.customerName,
            emailAddress: invoice.emailAddress,
            contactNumber: invoice.contactNumber || "",
            address: invoice.address,
            gstNumber: invoice.gstNumber,
            productName: invoice.productName,
            amount: invoice.amount,
            discount: invoice.discount || 0,
            gstRate: invoice.gstRate || 0,
            status: invoice.status as "New" | "Paid" | "Pending",
            date: invoice.date ? new Date(invoice.date) : undefined,
            endDate: invoice.endDate ? new Date(invoice.endDate) : undefined,
            totalWithoutGst: invoice.totalWithoutGst || 0,
            totalWithGst: invoice.totalWithGst || 0,
            paidAmount: invoice.paidAmount || 0,
            remainingAmount: invoice.remainingAmount || 0,
        });
        setIsEditDialogOpen(true);
    };

    // Function to handle delete button click
    const handleDeleteClick = async (invoice: Invoice) => {
        if (!window.confirm("Are you sure you want to delete this invoice?")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/v1/invoice/deleteInvoice/${invoice._id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete invoice");
            }

            toast({
                title: "Invoice Deleted",
                description: "The invoice has been successfully deleted.",
            });

            // Refresh the invoices list
            fetchInvoices();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete invoice",
                variant: "destructive",
            });
        }
    };

    // Function to handle edit form submission
    async function onEdit(values: z.infer<typeof formSchema>) {
        if (!selectedInvoice?._id) return;

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/v1/invoice/updateInvoice/${selectedInvoice._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update invoice");
            }

            toast({
                title: "Invoice Updated",
                description: "The invoice has been successfully updated.",
            });

            // Close dialog and reset form
            setIsEditDialogOpen(false);
            setSelectedInvoice(null);
            form.reset();

            // Refresh the invoices list
            fetchInvoices();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update invoice",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    const renderCell = React.useCallback((invoice: Invoice, columnKey: string) => {
        const cellValue = invoice[columnKey as keyof Invoice];

        switch (columnKey) {
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">
                        <Tooltip content="Edit invoice">
                            <span
                                className="text-lg text-default-400 cursor-pointer active:opacity-50"
                                onClick={() => handleEditClick(invoice)}
                            >
                                <Edit className="h-4 w-4" />
                            </span>
                        </Tooltip>
                        <Tooltip color="danger" content="Delete invoice">
                            <span
                                className="text-lg text-danger cursor-pointer active:opacity-50"
                                onClick={() => handleDeleteClick(invoice)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </span>
                        </Tooltip>
                    </div>
                );
                case "date":
                    return formatDate(cellValue); // Format the endDate
                case "endDate":
            return formatDate(cellValue); // Format the endDate
            default:
                return cellValue;
        }
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
    <span className="text-default-400 text-small">
        Total {invoices.length} invoices
    </span>
    <label className="flex items-center text-default-400 text-small">
        Rows per page:
        <select
            className="bg-transparent outline-none text-default-400 text-small"
            value={rowsPerPage}
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
        invoices.length,
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

    
  const { watch, setValue } = form;

  
    const amount = watch("amount") ?? 0; 
    const discount = watch("discount") ?? 0;  
    const gstRate = watch("gstRate") ?? 0; 
    const paidAmount = watch("paidAmount") ?? 0;  
    
  
    useEffect(() => {
      
      const { totalWithoutGst, totalWithGst, remainingAmount } = calculateGST(amount, discount, gstRate, paidAmount);
  
      
      setValue("totalWithoutGst", totalWithoutGst);
      setValue("totalWithGst", totalWithGst);
      setValue("remainingAmount", remainingAmount);
    }, [amount, discount, gstRate, paidAmount, setValue]);
  
  
  
    const calculateGST = (
      amount: number,
      discount: number,
      gstRate: number,
      paidAmount: number
    ) => {
      
      const discountedAmount = amount - amount * (discount / 100);
      const gstAmount = discountedAmount * (gstRate / 100); 
      const totalWithoutGst = discountedAmount;
      const totalWithGst = discountedAmount + gstAmount; 
      const remainingAmount = totalWithGst - paidAmount; 
  
      return {
        totalWithoutGst,
        totalWithGst,
        remainingAmount,
      };
    };
  
    async function onSubmit(values: z.infer<typeof formSchema>) {
      setIsSubmitting(true);
      try {
        const response = await fetch("http://localhost:8000/api/v1/invoice/invoiceAdd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || "Failed to submit the invoice");
        }
  
        toast({
          title: "Invoice Submitted",
          description: `Your invoice has been successfully submitted. ID: ${data.id}`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "There was an error submitting the invoice.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
        form.reset();
        fetchInvoices()
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
                                <BreadcrumbPage>Invoice</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="flex-1 flex justify-end space-x-4 mr-10">
                        <div className="w-52">
                            <SearchBar />
                        </div>
                    </div>
                </header>

                <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-15">
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
                        }}
                    >
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
                        <TableBody emptyContent={"No invoices found"} items={sortedItems}>
                            {(item) => (
                                <TableRow key={item._id}>
                                    {(columnKey) => <TableCell>{renderCell(item, columnKey as string)}</TableCell>}
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <Dialog open={isAddNewOpen} onOpenChange={setIsAddNewOpen}>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Add New Invoice</DialogTitle>
                                <DialogDescription>
                                    Fill in the invoice details.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <Form {...form}>
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
                                                        <Input placeholder="Enter amount" type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="discount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Discount</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter discount" type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gstRate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>GST Rate (%)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter GST rate" type="number" {...field} />
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
                                                            <option value="New">New</option>
                                                            <option value="Paid">Paid</option>
                                                            <option value="Pending">Pending</option>
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

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="totalWithoutGst"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Total Without GST</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter total without GST" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="totalWithGst"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Total With GST</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter total with GST" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>


                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="paidAmount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Paid Amount</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter paid amount" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="remainingAmount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Remaining Amount</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter remaining amount" {...field} />
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
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit Invoice"
                                        )}
                                    </Button>
                                </Form>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Edit Invoice</DialogTitle>
                                <DialogDescription>
                                    Update the invoice details.
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
                                                        <Input placeholder="Enter amount" type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="discount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Discount</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter discount" type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gstRate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>GST Rate (%)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter GST rate" type="number" {...field} />
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
                                                            <option value="New">New</option>
                                                            <option value="Paid">Paid</option>
                                                            <option value="Pending">Pending</option>
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
                                            name="date"
                                            render={({ field }) => {
                                                // Convert the Date object to a string in "YYYY-MM-DD" format
                                                const dateValue = field.value ? format(field.value, "yyyy-MM-dd") : "";
                                                return (
                                                    <FormItem>
                                                        <FormLabel>Start Date</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="date"
                                                                value={dateValue}
                                                                onChange={(e) => {
                                                                    // Convert the string back to a Date object
                                                                    const selectedDate = new Date(e.target.value);
                                                                    field.onChange(selectedDate);
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="endDate"
                                            render={({ field }) => {
                                                // Convert the Date object to a string in "YYYY-MM-DD" format
                                                const dateValue = field.value ? format(field.value, "yyyy-MM-dd") : "";
                                                return (
                                                    <FormItem>
                                                        <FormLabel>End Date</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="date"
                                                                value={dateValue}
                                                                onChange={(e) => {
                                                                    // Convert the string back to a Date object
                                                                    const selectedDate = new Date(e.target.value);
                                                                    field.onChange(selectedDate);
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />
                                    </div>


                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="totalWithoutGst"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Total Without GST</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter total without GST" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="totalWithGst"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Total With GST</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter total with GST" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>


                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="paidAmount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Paid Amount</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter paid amount" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="remainingAmount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Remaining Amount</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter remaining amount" {...field} />
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
                                            "Update Invoice"
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