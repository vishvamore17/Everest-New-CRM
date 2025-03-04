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

const formSchema = z.object({
  customer_name: z.string().min(2, {
    message: "Customer name must be at least 2 characters.",
  }),
  site_location: z.string().min(2, {
    message: "Site location must be at least 2 characters.",
  }),
  make_model: z.string().min(2, {
    message: "Make & Model must be at least 2 characters.",
  }),
  range: z.string().min(1, {
    message: "Range is required.",
  }),
  serial_no: z.string().min(1, {
    message: "Serial No. is required.",
  }),
  calibration_gas: z.string().min(1, {
    message: "Calibration Gas is required.",
  }),
  gas_canister_details: z.string().min(1, {
    message: "Gas Canister Details are required.",
  }),
  date_of_calibration: z.date({
    required_error: "Date of Calibration is required.",
  }),
  calibration_due_date: z.date({
    required_error: "Calibration Due Date is required.",
  }),
})

export default function CertificateNWForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: "data",
      site_location: "data",
      make_model: "data",
      range: "data",
      serial_no: "data",
      calibration_gas: "data",
      gas_canister_details: "data",
      date_of_calibration: new Date(),
      calibration_due_date: new Date(),
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/submit-certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit the form")
      }

      toast({ 
        title: "Certificate submitted",
        description: `Your Certificate NW has been successfully submitted. ID: ${data.id}`,
      })
      router.push(`/certificate/${data.id}`) // Redirect to the new PDF generation page
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem submitting your certificate.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="customer_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name of the Customer</FormLabel>
                <FormControl>
                  <Input placeholder="Enter customer name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="site_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter site location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="make_model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Make & Model</FormLabel>
                <FormControl>
                  <Input placeholder="Enter make and model" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Range</FormLabel>
                <FormControl>
                  <Input placeholder="Enter range" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="serial_no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial No.</FormLabel>
                <FormControl>
                  <Input placeholder="Enter serial number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="calibration_gas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calibration Gas</FormLabel>
                <FormControl>
                  <Input placeholder="Enter calibration gas" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="gas_canister_details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gas Canister Details</FormLabel>
              <FormControl>
                <Input placeholder="Enter gas canister details" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="date_of_calibration"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Calibration</FormLabel>
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
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
            name="calibration_due_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Calibration Due Date</FormLabel>
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
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Certificate"
          )}
        </Button>
      </form>
    </Form>
  )
}

