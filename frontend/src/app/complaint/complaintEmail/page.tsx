"use client";
import React, { useState, useRef } from "react";
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/ModeToggle";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { IoIosSend, IoMdAttach } from "react-icons/io";
import {
    MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight,
    MdFormatListBulleted, MdFormatListNumbered, MdFormatIndentIncrease, MdFormatIndentDecrease,
    MdSubscript, MdSuperscript, MdTableChart, MdHorizontalRule
} from "react-icons/md";

const EmailInput: React.FC = () => {
    const [to, setTo] = useState("");
    const [subject, setSubject] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messageRef = useRef<HTMLDivElement>(null);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [showTablePicker, setShowTablePicker] = useState(false);
    const [selectedRows, setSelectedRows] = useState(0);
    const [selectedCols, setSelectedCols] = useState(0);
    const handleFileClick = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setAttachments([...attachments, ...Array.from(files)]);
        }
    };
// Remove an attachment from the list
const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
};
    const handleSendEmail = async () => {
        const message = messageRef.current?.innerHTML || "";
        const formData = new FormData();
        formData.append("to", to);
        formData.append("subject", subject);
        formData.append("message", message);
        attachments.forEach((file) => formData.append("attachments[]", file));
        try {
            const response = await fetch('http://localhost:8000/api/v1/complaint/sendEmailComplaint', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Failed to send email. Please try again.");
        }
    };

    

    const applyFormatting = (command: string, value?: string) => {
        document.execCommand(command, false, value || "");
    };

     {/* Insert Table Function */ }
     const insertTable = () => {
        const messageDiv = messageRef.current;
        if (!messageDiv) return;

        let tableHTML = `<table style="width: 100%; border-collapse: collapse; border: 1px solid black;">`;

        for (let i = 0; i < selectedRows; i++) {
            tableHTML += "<tr>";
            for (let j = 0; j < selectedCols; j++) {
                tableHTML += `<td style="border: 1px solid black; padding: 8px;"></td>`;
            }
            tableHTML += "</tr>";
        }

        tableHTML += "</table><br/>";
        messageDiv.innerHTML += tableHTML;

        // Close Table Picker
        setShowTablePicker(false);
    };


    const insertHorizontalLine = () => {
        const messageDiv = messageRef.current;
        if (messageDiv) {
            const hr = document.createElement("hr");
            hr.style.margin = "10px 0"; // Add spacing
            messageDiv.appendChild(hr);
        }
    };
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
                            <BreadcrumbList>
                                <BreadcrumbItem><BreadcrumbLink href="/complaint">Complaint</BreadcrumbLink></BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem><BreadcrumbPage>Email</BreadcrumbPage></BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </header>
                </SidebarInset>

                {showTablePicker && (
                    <div
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                        onClick={() => setShowTablePicker(false)} // Click outside to close
                    >
                        <div
                            className="bg-white shadow-md p-4 border rounded-md"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                        >
                            <div className="grid grid-cols-6 gap-1">
                                {[...Array(6)].map((_, row) =>
                                    [...Array(6)].map((_, col) => (
                                        <div
                                            key={`${row}-${col}`}
                                            className={`w-8 h-8 border ${row < selectedRows && col < selectedCols ? "bg-blue-300" : "bg-gray-100"}`}
                                            onMouseEnter={() => {
                                                setSelectedRows(row + 1);
                                                setSelectedCols(col + 1);
                                            }}
                                            onClick={insertTable}
                                        />
                                    ))
                                )}
                            </div>
                            <p className="text-center mt-2 text-sm">Size: {selectedRows} × {selectedCols}</p>
                        </div>
                    </div>
                )}
                <div className="p-6 w-full max-w-lg mx-auto">
                    <Card className="border border-gray-300 shadow-md rounded-lg">
                        <CardContent className="p-6 space-y-4">
                            <h2 className="text-lg font-semibold">New Message</h2>
                            <Separator className="my-2 border-gray-300" />
                            <div className="flex items-center space-x-4">
                                <label className="text-sm font-medium w-20">To:</label>
                                <Input type="email" placeholder="Recipient's email" value={to} onChange={(e) => setTo(e.target.value)} />
                            </div>
                            <div className="flex items-center space-x-4">
                                <label className="text-sm font-medium w-20">Subject:</label>
                                <Input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                            </div>
                            <div className="border border-gray-300 rounded-md h-40 p-2 overflow-y-auto" contentEditable ref={messageRef} />  {attachments.length > 0 && (
    <div className="mt-2 border border-gray-300 rounded-md p-2">
        <h4 className="text-sm font-medium">Attachments:</h4>
        <ul className="space-y-1">
            {attachments.map((file, index) => (
                <li key={index} className="flex justify-between items-center text-sm p-1 bg-gray-100 rounded">
                    <span className="truncate">{file.name}</span>
                    <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveAttachment(index)}
                    >
                        ❌
                    </button>
                </li>
            ))}
        </ul>
    </div>
)}
                            <div className="flex flex-wrap items-center gap-2 border border-gray-300 p-2 rounded-md">
                              
                            <IoMdAttach className="text-xl cursor-pointer hover:text-gray-500" onClick={handleFileClick} />
                            {/* Display selected files with remove option */}

                                <Button variant="outline" onClick={() => applyFormatting("bold")}><MdFormatBold /></Button>
                                <Button variant="outline" onClick={() => applyFormatting("italic")}><MdFormatItalic /></Button>
                                <Button variant="outline" onClick={() => applyFormatting("underline")}><MdFormatUnderlined /></Button>
                                <a className="flex items-center space-x-1 cursor-pointer">
                                    <span className="font-bold text-lg">A</span>
                                    <input
                                        type="color"
                                        className="w-8 h-8 border-none cursor-pointer"
                                        onChange={(e) => applyFormatting("foreColor", e.target.value)}
                                    />
                                </a>                                
                                <select onChange={(e) => applyFormatting("fontName", e.target.value)} className="border p-1 rounded">
                                    <option value="Arial">Arial</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Verdana">Verdana</option>
                                </select>
                                <select onChange={(e) => applyFormatting("fontSize", e.target.value)} className="border p-1 rounded">
<option value="1">Small</option>
<option value="3">Medium</option>
<option value="5">Large</option>
<option value="7">Extra Large</option>
</select>
                                <Button variant="outline" onClick={() => applyFormatting("justifyLeft")}><MdFormatAlignLeft /></Button>
                                <Button variant="outline" onClick={() => applyFormatting("justifyCenter")}><MdFormatAlignCenter /></Button>
                                <Button variant="outline" onClick={() => applyFormatting("justifyRight")}><MdFormatAlignRight /></Button>
                                <Button variant="outline" onClick={() => applyFormatting("indent")}><MdFormatIndentIncrease /></Button>
                                <Button variant="outline" onClick={() => applyFormatting("outdent")}><MdFormatIndentDecrease /></Button>
                                <Button variant="outline" onClick={() => applyFormatting("subscript")}><MdSubscript /></Button>
                                <Button variant="outline" onClick={() => applyFormatting("superscript")}><MdSuperscript /></Button>
                                <Button variant="outline" onClick={() => setShowTablePicker(true)} ><MdTableChart /></Button>
                                <Button variant="outline" onClick={insertHorizontalLine}>
                                    <MdHorizontalRule />
                                </Button>

                            </div>
                            <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} />
                            <Button className="flex items-center space-x-2" onClick={handleSendEmail}><IoIosSend /><span>Send</span></Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SidebarProvider>
    );
};
export default EmailInput;
