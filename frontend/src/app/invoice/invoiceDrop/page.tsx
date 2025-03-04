"use client";
import React, { useEffect, useState } from "react";
import { Card, CardBody, CardFooter } from "@heroui/react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { MdCancel } from "react-icons/md";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/ModeToggle"
import { Meteors } from "@/components/ui/meteors";
import SearchBar from '@/components/globalSearch'

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
  status: "Pending" | "Unpaid" | "Paid";
  date: string;
  totalWithoutGst: number;
  totalWithGst: number;
  paidAmount: 0 | number;
  remainingAmount: number;
  isActive: boolean;
}

const getAllInvoices = async (): Promise<Invoice[]> => {
  try {
    const response = await fetch("http://localhost:8000/api/v1/invoice/getAllInvoices");
    const data = await response.json();
    if (data.success) return data.data;
    throw new Error(data.message);
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw new Error("Failed to fetch leads");
  }
}
export default function App() {
  const [error, setError] = useState("");
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [groupedInvoices, setGroupedInvoices] = useState<Record<string, Invoice[]>>({});
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);


  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const fetchedLeads = await getAllInvoices();
        groupInvoicesByStatus(fetchedLeads);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message); // TypeScript now recognizes 'message'
        } else {
          setError("An unknown error occurred");
        }
      };
    }
    fetchLeads();
  }, []);

  const groupInvoicesByStatus = (invoices: Invoice[]) => {
    const grouped = invoices.reduce((acc, invoice) => {
      if (!acc[invoice.status]) acc[invoice.status] = [];
      acc[invoice.status].push(invoice);
      return acc;
    }, {} as Record<string, Invoice[]>);
    setGroupedInvoices(grouped);
  };

  const handleDragStart = (e: React.DragEvent, invoice: Invoice, fromStatus: string) => {
    e.dataTransfer.setData("invoice", JSON.stringify(invoice));
    e.dataTransfer.setData("fromStatus", fromStatus);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: React.DragEvent, toStatus: string) => {
    e.preventDefault();
    setDraggedOver(null);
    const invoiceData = e.dataTransfer.getData("invoice");
    const fromStatus = e.dataTransfer.getData("fromStatus");

    if (!invoiceData || !fromStatus || fromStatus === toStatus) return;

    const invoice: Invoice = JSON.parse(invoiceData);
    const updatedInvoice = { ...invoice, status: toStatus };

    setGroupedInvoices((prev) => ({
      ...prev,
      [fromStatus]: prev[fromStatus]?.filter((l) => l._id !== invoice._id) || [],
      [toStatus]: [...(prev[toStatus] || []), updatedInvoice as Invoice], // Explicitly cast updatedLead
    }));


    try {
      const response = await fetch("http://localhost:8000/api/v1/invoice/updateStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice._id, status: toStatus }),
      });
      const data = await response.json();
      if (!data.success) throw new Error("Failed to update lead status on server.");
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  const statusColors: Record<string, string> = {
    Pending: "bg-purple-300 text-gray-800 border-2 border-purple-900 shadow-lg shadow-purple-900/50",
    Unpaid: "bg-purple-300 text-gray-800 border-2 border-purple-900 shadow-lg shadow-purple-900/50",
    Paid: "bg-purple-300 text-gray-800 border-2 border-purple-900 shadow-lg shadow-purple-900/50",
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col w-full">
        <SidebarInset>
          <header className="flex h-14 md:h-12 items-center px-4 w-full border-b shadow-sm">
            <SidebarTrigger className="mr-2" />
            <ModeToggle />
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Breadcrumb>
              <BreadcrumbList className="flex items-center space-x-2">
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/invoice">Invoice</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Drag & Drop</BreadcrumbPage>
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

        <div className="p-6 ">
          {error && <p className="text-red-500 text-center">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl md:max-w-4xl mx-auto">
            {Object.keys(statusColors).map((status) => {
              const invoiceStatus = groupedInvoices[status] || [];
              const totalAmount = invoiceStatus.reduce((sum, invoice) => sum + invoice.amount, 0);

              return (
                <div
                  key={status}
                  className={`p-4  min-h-[300px] transition-all w-full border ${draggedOver === status ? "border-gray-500 border-dashed" : "border-transparent"
                    }`}
                  onDrop={(e) => handleDrop(e, status)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDraggedOver(status);
                  }}
                  onDragLeave={() => setDraggedOver(null)}
                >
                  <h2 className={`text-sm font-bold mb-4 px-5 py-2 rounded-lg ${statusColors[status]}`}>{status}</h2>
                  <div className="p-3 bg-[#FAF3DD] rounded-md shadow">
                    <p className="text-sm font-semibold text-black">Total Invoice: {invoiceStatus.length}</p>
                    <p className="text-sm font-semibold text-black">Total Amount: ₹{totalAmount}</p>
                  </div>

                  <div
                    className="scrollable"
                  >
                    {invoiceStatus.length === 0 ? (
                      <p className="text-gray-500 text-center">No invoices available</p>
                    ) : (
                      invoiceStatus.map((invoice) => (
                        <div
                          key={invoice._id}
                          className="border border-gray-300 rounded-lg shadow-md bg-white p-3 cursor-grab active:cursor-grabbing"
                        >
                          <div
                            className="card"
                            draggable
                            onDragStart={(e) => handleDragStart(e, invoice, status)}
                            onClick={() => handleInvoiceClick(invoice)}
                          >
                            <p className="text-sm font-semibold text-black">Company Name: {invoice.companyName}</p>
                            <p className="text-sm font-semibold text-black">Product: {invoice.productName}</p>
                            <p className="text-sm font-semibold text-black">Amount: ₹{invoice.amount}</p>
                            <p className="text-sm font-semibold text-black">Next Date: {formatDate(invoice.date)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {isModalOpen && selectedInvoice && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-full max-w-lg relative">
                {/* Meteor Effect Background */}
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-teal-500 transform scale-[0.80] rounded-full blur-3xl" />

                {/* Modal Content */}
                <div className="relative shadow-xl bg-gray-900 border border-gray-800 px-6 py-8 rounded-2xl">
                  {/* Close Button */}
                  <div
                    className="absolute top-3 right-3 h-8 w-8 rounded-full border border-gray-500 flex items-center justify-center cursor-pointer"
                    onClick={() => {
                      setIsModalOpen(false); // Close Modal
                    }}
                  >
                    <MdCancel className="text-white text-2xl" />

                  </div>

                  {/* Title */}
                  <h1 className="font-bold text-2xl text-white mb-6 text-center">Lead Details</h1>

                  {/* Lead Details in Two Columns */}
                  <div className="grid grid-cols-2 gap-4 text-white">
                    {Object.entries(selectedInvoice)
                      .filter(([key]) => !["_id", "isActive", "createdAt", "updatedAt", "customMessage", "_v"].includes(key))
                      .map(([key, value]) => (
                        <p key={key} className="text-sm">
                          <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
                          {["date", "endDate"].includes(key) && value
                            ? new Date(value).toLocaleDateString()
                            : value || "N/A"}
                        </p>
                      ))}
                  </div>

                  {/* Meteor Effect */}
                  <Meteors number={20} />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </SidebarProvider>
  );
} 