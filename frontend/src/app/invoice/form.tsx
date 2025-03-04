"use client";
import { useState, useEffect} from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

// Invoice schema validation with zod
const formSchema = z.object({
  companyName: z.string().min(2, { message: "Company name is required." }),
  customerName: z.string().min(2, { message: "Customer name is required." }),
  contactNumber: z.string().min(10, { message: "Contact number is required." }),
  emailAddress: z.string().email({ message: "Invalid email address" }),
  address: z.string().min(2, { message: "Address is required." }),
  gstNumber: z.string().min(1, { message: "GST number is required." }),
  productName: z.string().min(2, { message: "Product name is required." }),
  amount: z.number().positive({ message: "Amount must be positive." }),
  discount: z.number().optional(),
  gstRate: z.number().optional(),
  status: z.enum(["Unpaid", "Paid", "Pending"]),
  date: z.date().optional(),
  totalWithoutGst: z.number().optional(),
  totalWithGst: z.number().optional(),
  paidAmount: z.number().optional(),
  remainingAmount: z.number().optional(),
});

export default function InvoiceForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      customerName: "",
      contactNumber: "",
      emailAddress: "",
      address: "",
      gstNumber: "",
      productName: "",
      amount: 0,
      discount: 0,
      gstRate: 0,
      status: "Unpaid",
      date: new Date(),
      totalWithoutGst: 0,
      totalWithGst: 0,
      paidAmount: 0,
      remainingAmount: 0,
    },
  });


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
      router.push(`/invoice/${data.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error submitting the invoice.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
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
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount</FormLabel>
                <FormControl>
                  <Input 
                  placeholder="Enter discount" 
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
          <FormField
            control={form.control}
            name="gstRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GST Rate (%)</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    value={field.value} // Ensure the value is controlled
                    onChange={(e) => field.onChange(Number(e.target.value))} // Convert to number
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select GST Rate</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 justify-items-stretch">
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
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
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
                <FormLabel>Invoice Date</FormLabel>
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
            name="paidAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paid Amount</FormLabel>
                <FormControl>
                  <Input placeholder="Enter paid amount" type="number" {...field}                     onChange={(e) => {
                      // Convert the string value to a number
                      const value = e.target.valueAsNumber || 0; // Use `valueAsNumber` to get a number
                      field.onChange(value); // Pass the number to the form
                    }}/>
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
                  <Input placeholder="Remaining Amount" type="number" {...field} />
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
      </form>
    </Form>
  );
}