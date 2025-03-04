"use client"
import React, { useState } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/ModeToggle";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { IoIosSend, IoMdAttach, IoMdImage } from "react-icons/io";
import { IoLink } from "react-icons/io5";

const EmailInput: React.FC = () => {
    const [to, setTo] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="flex flex-col w-full">
                <SidebarInset>
                    <header className="flex h-16 items-center px-4 w-full border-b shadow-sm">
                        <SidebarTrigger className="mr-2" />
                        <ModeToggle />
                        <Separator orientation="vertical" className="h-6 mx-2" />
                        <Breadcrumb>
                            <BreadcrumbList className="flex items-center space-x-2">
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/reminder">Reminder</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Email</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </header>
                </SidebarInset>
                {/* Add button in the header */}
                <div className="flex justify-end pr-6">
                    <Button className="px-6 py-2 rounded-md">View List</Button>
                </div>

                <div className="p-6 w-full max-w-lg mx-auto">

                    <Card className="border border-gray-300 shadow-md rounded-lg">
                        <CardContent className="p-6 space-y-4">
                            <h2 className="text-lg font-semibold">New Message</h2>
                            <Separator className="my-2 border-gray-300" /> {/* Separator line */}

                            <div className="flex items-center space-x-4">
                                <label className="text-sm font-medium w-20">To:</label>
                                <Input
                                    type="email"
                                    placeholder="Recipient's email"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="input input-bordered input-secondary w-full max-w-xs" 
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <label className="text-sm font-medium w-20">Subject:</label>
                                <Input
                                    type="text"
                                    placeholder="Subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="input input-bordered input-secondary w-full max-w-xs" 
                                    />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Message:</label>
                                <Textarea
                                    placeholder="Write your message here..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="border border-gray-300 rounded-md h-40   textarea-secondary" // Increased height
                                />
                            </div>

                            <div className="flex items-center space-x-3"> {/* Flex container for button & icons */}
                                {/* Send Button */}
                                <Button
                                    className="w-24 border border-gray-300 rounded-full py-2 px-4 text-sm flex items-center justify-center space-x-2"
                                    onClick={() => alert("Message Sent!")}
                                >
                                    <IoIosSend className="text-lg" /> {/* Send icon */}
                                    <span>Send</span>
                                </Button>

                                {/* Icons aligned beside the button */}
                                <IoMdAttach className="text-xl cursor-pointer hover:text-gray-500" />
                                <IoMdImage className="text-xl cursor-pointer hover:text-gray-500" />
                                <IoLink className="text-xl cursor-pointer hover:text-gray-500" />
                            </div>


                        </CardContent>
                    </Card>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default EmailInput;
