"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { ModeToggle } from "@/components/ModeToggle"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
  } from "@/components/ui/sidebar"
  import SearchBar from '@/components/globalSearch'

  export const columns = [
    {name: "ID", uid: "id", sortable: true},
    {name: "NAME", uid: "name", sortable: true},
    {name: "AGE", uid: "age", sortable: true},
    {name: "ROLE", uid: "role", sortable: true},
    {name: "TEAM", uid: "team"},
    {name: "EMAIL", uid: "email"},
    {name: "STATUS", uid: "status", sortable: true},
    {name: "ACTIONS", uid: "actions"},
  ];
  
  export const statusOptions = [
    {name: "Active", uid: "active"},
    {name: "Paused", uid: "paused"},
    {name: "Vacation", uid: "vacation"},
  ];




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
    date: z.date().optional(),
    endDate: z.date().optional(),
    notes: z.string().optional(),
    isActive: z.boolean(),
})

export default function LeadForm() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            companyName: "",
            customerName: "",
            contactNumber: "",
            emailAddress: "",
            address: "",
            productName: "",
            amount: 0,
            gstNumber: "",
            status: "New",
            date: new Date(),
            endDate: undefined,
            notes: "",
            isActive: true,
        },
    })

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
                description: `Your lead has been successfully submitted. ID: ${data.id}`,
            })
            router.push(`/lead/${data.id}`) // Redirect to the lead details page
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
      <div className="flex flex-col w-full">
        <SidebarInset>
          <header className="flex h-16 items-center px-4 w-full border-b shadow-sm">
            <SidebarTrigger className="mr-2" />
             <ModeToggle/>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Breadcrumb>
              <BreadcrumbList className="flex items-center space-x-2">
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/lead">Lead</BreadcrumbLink>
                </BreadcrumbItem>              
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex-1 flex justify-end space-x-4 mr-10">
                            <div  className="w-52">
                                <SearchBar/>
                            </div>
                        </div>
          </header>
        </SidebarInset>

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

        </div>
        </SidebarProvider>
    )
}
