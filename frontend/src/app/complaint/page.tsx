"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import  ComplaintForm from "../complaint/form"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button" // Import Button component
import SearchBar from '@/components/globalSearch'
import { ModeToggle } from "@/components/ModeToggle"


export default function CertificatePage() {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4 w-full">
                        <SidebarTrigger className="-ml-1"/>
                          <ModeToggle/>
                        <Separator orientation="vertical" className="mr-2 h-4"/>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/complaint">
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block"/>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Complaint</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <div className="flex-1 flex justify-end space-x-4 mr-10">
                            <div  className="w-52">
                                <SearchBar/>
                            </div>
                        </div>
                       
                    </div>
                </header> 
                {/* Add button in the header */}
                        <div className="ml-auto">
                            <Button>Complaint List</Button>
                        </div>
                <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 pt-15">
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-3xl font-bold text-center">Complaint</CardTitle>
                            <CardDescription className="text-center">
                                Manage and track your Complaint effectively.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ComplaintForm />
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
