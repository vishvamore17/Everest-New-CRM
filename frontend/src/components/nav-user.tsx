"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Link from "next/link";
import { MdCancel } from "react-icons/md";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

interface Owner {
  _id: string;
  logo?: string;
  companyName: string;
  ownerName: string;
  contactNumber: string;
  emailAddress: string;
  website?: string;
  businessRegistration?: string;
  companyType?: string;
  employeeSize?: string;
  panNumber?: string;
  documentType?: string;
  documentNumber?: string;
  gstNumber?: string;
  udhayamAadhar?: string;
  stateCertificate?: string;
  incorporationCertificate?: string;
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const [open, setOpen] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [editOwner, setEditOwner] = useState<Owner | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false); // State for delete modal
  const [isDeleting, setIsDeleting] = useState(false); // State to handle deleting state

  const form = useForm<Owner>({
    defaultValues: {
      companyName: '',
      ownerName: '',
      contactNumber: '',
      emailAddress: '',
      website: '',
      businessRegistration: '',
      companyType: '',
      employeeSize: '',
      panNumber: '',
      documentType: '',
      documentNumber: '',
      gstNumber: '',
      udhayamAadhar: '',
      stateCertificate: '',
      incorporationCertificate: '',
    },
  });

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8000/api/v1/owner/getAllOwners");
        setOwners(response.data.data);

        const emailFromStorage = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
        if (emailFromStorage) {
          const filtered = response.data.data.filter((owner: Owner) => owner.emailAddress === emailFromStorage);
          setFilteredOwners(filtered);
        }
      } catch (err) {
        setError("Failed to fetch owners.");
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);

  const handleEditClick = (owner: Owner) => {
    setEditOwner(owner);
    setIsEditing(true);
    setOpen(false); // Close the dialog when editing starts
    form.reset(owner); // Reset form with owner data
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone!")) {
      return;
    }

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const ownerId = currentOwner?._id;

    try {
      setIsDeleting(true);
      let ownerDeleted = false;
      let userDeleted = false;

      // Delete Owner if ownerId exists
      if (ownerId) {
        const ownerResponse = await axios.delete(`http://localhost:8000/api/v1/owner/deleteOwner/${ownerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (ownerResponse.status === 200) {
          ownerDeleted = true;
        } else {
          alert(ownerResponse.message || "Error deleting owner account.");
          return;
        }
      }

      // Delete User if userId exists
      if (userId) {
        const userResponse = await fetch("http://localhost:8000/api/v1/user/delete-account", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        });

        const userResult = await userResponse.json();

        if (userResponse.ok && userResult.success) {
          userDeleted = true;
        } else {
          alert(userResult.message || "Error deleting user account.");
          return;
        }
      }

      // If either owner or user was deleted, log out and redirect
      if (ownerDeleted || userDeleted) {
        localStorage.clear();
        router.push("/");
      } else {
        alert("Failed to delete the account.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred while deleting your account.");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const onSubmit = async (data: Owner) => {
    setIsSubmitting(true);
    try {
      await axios.put(`http://localhost:8000/api/v1/owner/updateOwner/${editOwner?._id}`, data);
      setIsEditing(false);
      setEditOwner(null);
      const response = await axios.get("http://localhost:8000/api/v1/owner/getAllOwners");
      setOwners(response.data.data);
      setFilteredOwners(response.data.data.filter((owner: { emailAddress: string | null; }) => owner.emailAddress === localStorage.getItem("userEmail")));
    } catch (error) {
      console.error("Failed to update owner:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  const currentOwner = filteredOwners[0];

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={currentOwner?.logo} alt={currentOwner?.ownerName || "User"} />
                  <AvatarFallback className="rounded-lg">
                    {currentOwner?.ownerName?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{currentOwner?.ownerName || "User"}</span>
                  <span className="truncate text-xs">{currentOwner?.emailAddress || "No Email"}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
              <DropdownMenuItem>
                <LogOut />
                <Link href="/login">Log out</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteAccount()}>
                <span className="text-red-500">Delete Account</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <button onClick={() => setOpen(true)} className="w-full text-left">
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={currentOwner?.logo} alt={currentOwner?.ownerName || "User"} />
                      <AvatarFallback className="rounded-lg">
                        {currentOwner?.ownerName?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{currentOwner?.ownerName || "User"}</span>
                      <span className="truncate text-xs">{currentOwner?.emailAddress || "No Email"}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="w-full max-w-3xl h-auto min-h-[500px] p-6 rounded-lg shadow-lg bg-white">
    <DialogHeader>
      <DialogTitle className="text-xl md:text-2xl font-bold text-center text-gray-800">
        Profile Details
      </DialogTitle>
      <hr className="my-3 border-gray-300" /> {/* Horizontal Line */}
      <DialogDescription>
        {loading ? (
          <div className="text-center text-gray-600 text-lg">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600 text-lg">{error}</div>
        ) : currentOwner ? (
          <div className="relative h-full">
            <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
              
              {/* Left Column: Logo + Owner Info */}
              <div className="w-full md:w-1/3 flex flex-col items-center mt-4 md:mt-6">
                <div className="w-32 h-32 md:w-44 md:h-44 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 mb-6 md:mb-8">
                  {currentOwner.logo ? (
                    <img
                      src={`http://localhost:8000/uploads/${currentOwner.logo}`}
                      alt="Company Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 text-base md:text-lg">No Logo</span>
                  )}
                </div>

                {/* Owner Name & Email Below Logo */}
                <div className="mt-2 text-center">
                  <div className="text-lg md:text-xl font-bold font-serif text-gray-800">
                    {currentOwner.ownerName}
                  </div>
                  <div className="text-sm md:text-lg font-medium text-gray-600">
                    {currentOwner.emailAddress}
                  </div>
                </div>
              </div>

              {/* Right Column: Owner Details */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 text-gray-700 py-4 md:py-6 text-base md:text-lg">
                <div>
                  <span className="font-bold">Owner Name:</span>
                  <span className="block">{currentOwner.ownerName}</span>
                </div>

                <div>
                  <span className="font-bold">Email:</span>
                  <span className="block">{currentOwner.emailAddress}</span>
                </div>

                <div>
                  <span className="font-bold">Company Name:</span>
                  <span className="block">{currentOwner.companyName}</span>
                </div>

                <div>
                  <span className="font-bold">Contact:</span>
                  <span className="block">{currentOwner.contactNumber}</span>
                </div>

                <div>
                  <span className="font-bold">Document Type:</span>
                  <span className="block">{currentOwner.documentType}</span>
                </div>

                <div>
                  <span className="font-bold">Document Number:</span>
                  <span className="block">{currentOwner.documentNumber || "N/A"}</span>
                </div>

                <div>
                  <span className="font-bold">PAN Number:</span>
                  <span className="block">{currentOwner.panNumber}</span>
                </div>

                <div>
                  <span className="font-bold">Business Registration:</span>
                  <span className="block">{currentOwner.businessRegistration}</span>
                </div>

                <div>
                  <span className="font-bold">Company Type:</span>
                  <span className="block">{currentOwner.companyType}</span>
                </div>

                <div>
                  <span className="font-bold">Employee Size:</span>
                  <span className="block">{currentOwner.employeeSize}</span>
                </div>

                {/* Website moved to last row */}
                {currentOwner.website && (
                  <div className="col-span-1 md:col-span-2">
                    <span className="font-bold">Website:</span>
                    <a
                      href={currentOwner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {currentOwner.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex justify-center md:justify-end mt-6">
              <button
                className="bg-blue-500 text-white px-5 py-2 text-base md:text-lg rounded-lg hover:bg-blue-600"
                onClick={() => handleEditClick(currentOwner)}
              >
                Edit
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600 text-lg">No owners found.</div>
        )}
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>


      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div>
                    <label htmlFor="logo">
                      Logo
                      <br />
                      <img
                        src={logoPreview || 'https://via.placeholder.com/80'}
                        style={{ width: '80px', height: '80px', borderRadius: '50%', border: '1px solid #ccc' }}
                        alt="Logo Preview"
                      />
                    </label>
                    <input
                      type="file"
                      id="logo"
                      accept="image/*"
                      onChange={handleLogoChange}
                      required
                      style={{ display: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>

                    {/* Company Name */}
                    <div style={{ flex: '1 1 45%' }}>
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Owner Name */}
                    <div style={{ flex: '1 1 45%' }}>
                      <FormField
                        control={form.control}
                        name="ownerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Owner Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Contact Number */}
                    <div style={{ flex: '1 1 45%' }}>
                      <FormField
                        control={form.control}
                        name="contactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Email Address */}
                    <div style={{ flex: '1 1 45%' }}>
                      <FormField
                        control={form.control}
                        name="emailAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} className="cursor-not-allowed" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Website */}
                    <div style={{ flex: '1 1 45%' }}>
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Business Registration */}
                    <div style={{ flex: '1 1 45%' }}>
                      <FormField
                        control={form.control}
                        name="businessRegistration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Registration</FormLabel>
                            <FormControl>
                              <select {...field} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                <option value="">Select Business Registration</option>
                                <option value="Sole proprietorship">Sole proprietorship</option>
                                <option value="One person Company">One person Company</option>
                                <option value="Partnership">Partnership</option>
                                <option value="Private Limited">Private Limited</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Company Type */}
                    <div style={{ flex: '1 1 45%' }}>
                      <FormField
                        control={form.control}
                        name="companyType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Type</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Employee Size */}
                    <div style={{ flex: '1 1 45%' }}>
                      <FormField
                        control={form.control}
                        name="employeeSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employee Size</FormLabel>
                            <FormControl>
                              <select {...field} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                                <option value="">Select Employee Size</option>
                                <option value="1-10">1-10</option>
                                <option value="11-50">11-50</option>
                                <option value="51-100">51-100</option>
                                <option value=">100">&gt;100</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* PAN Number */}
                    <div style={{ flex: '1 1 45%' }}>
                      <FormField
                        control={form.control}
                        name="panNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PAN Number</FormLabel>
                            <FormControl>
                              <Input {...field} className="cursor-not-allowed" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Document Type */}
                    <div style={{ flex: '1 1 45%' }}>
                      <FormField
                        control={form.control}
                        name="documentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document Type</FormLabel>
                            <FormControl>
                              <Input {...field} className="cursor-not-allowed" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Document Number */}
                    <div style={{ flex: '1 1 45%' }}>
                      <FormField
                        control={form.control}
                        name="documentNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document Number</FormLabel>
                            <FormControl>
                              <Input {...field} className="cursor-not-allowed" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '24px' }}>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin" /> : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}