"use client"

import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function BaseData() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); // Prevent page reload

        try {
            const response = await fetch("/api/turso", {
                method: "POST",
                body: JSON.stringify(formData),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            console.log("Response Status:", response.status);
            console.log("Response Text:", await response.text());

            if (!response.ok) {
                throw new Error("Failed to submit form");
            }

            const result = await response.json();
            console.log("Form submitted successfully", result);
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/dashboard">Documentation</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>BASEData</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 shadow rounded-lg">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <Button type="submit">Submit</Button>
                    </form>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}