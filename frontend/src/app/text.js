'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from "@/hooks/use-toast";
import { useRouter,useSearchParams  } from "next/navigation";

interface Owner {
  _id:string;
  logo: File | string;
  companyName: string;
  ownerName: string;
  contactNumber: string;
  emailAddress: string;
  website: string;
  businessRegistration: string;
  companyType: string;
  employeeSize: string;
  panNumber: string;
  documentType: string;
  gstNumber: string;
  udhayamAadhar: string;
  stateCertificate: string;
  incorporationCertificate: string;
}

const NewOwnerForm: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [newOwner, setNewOwner] = useState<Owner>({
    _id:'',
    logo: '',
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
    gstNumber: '',
    udhayamAadhar: '',
    stateCertificate: '',
    incorporationCertificate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // to get query parameters from the URL

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/owner/getAllOwners");
      } catch (err) {
        setError("Failed to fetch owners");
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);
  useEffect(() => {
    // Fetch the current number of owners from the backend
    const fetchOwnerCount = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/owner/count');
      } catch (error) {
        console.error('Error fetching owner count:', error);
      }
    };

    fetchOwnerCount();
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewOwner((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update selected document type
    if (name === 'documentType') {
      setSelectedDocument(value);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setLogoPreview(imageUrl);
      setNewOwner((prev) => ({ ...prev, logo: imageUrl }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Assuming you have this state set up
  
    try {
      
      const response = await axios.post('http://localhost:8000/api/v1/owner/addOwner', newOwner);
      console.log('New Owner added:', response.data);
  toast({
                      title: "Success",
                      description: "Owner Added  successfully!",
                  });  
      // Reset the form
      setNewOwner({
        _id:'',
        logo: '',
        companyName: '',
        ownerName: '',
        contactNumber: '',
        emailAddress: localStorage.getItem('userEmail') || '', // Keep the email after submission
        website: '',
        businessRegistration: '', // Corrected spelling
        companyType: '',
        employeeSize: '',
        panNumber: '',
        documentType: '',
        gstNumber: '',
        udhayamAadhar: '',
        stateCertificate: '',
        incorporationCertificate: '',
      });
  
      router.push("/Dashboard");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error adding owner:', error.response?.data); // Log detailed error
      } else {
        console.error('Unexpected error:', error);
      }
  toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to process request",
        variant: "destructive",
    });     } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    
    <div className="flex items-center justify-center bg-white py-4">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Create Profile
        </h2>

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm">
          <div className="form-container">
           

            <form onSubmit={handleSubmit} className="form-box space-y-6 p-6 w-full">
             <div className="header-container">
                 <h3 className="text-xl font-semibold text-gray-800">New Owner</h3>
            </div>  
            <div className="logo-container flex flex-col items-center">
                {/* Logo Upload */}
                <label htmlFor="logo" className="cursor-pointer">
                  <img
                    src={logoPreview || 'https://via.placeholder.com/150'}
                    alt=""
                    className="w-32 h-32 rounded-full border-4 border-gray-300 object-cover"
                  />
                </label>
                <input
                  type="file"
                  id="logo"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  required
                />
                <label
                  htmlFor="logo"
                  className="mt-3 px-4 py-2 bg-gray-500 text-white rounded-md cursor-pointer"
                >
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Company Name */}
                <div className="form-group">
                  <label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    id="companyName"
                    placeholder="Enter Company Name"
                    value={newOwner.companyName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md text-black"
                    required
                  />
                </div>

                {/* Owner Name */}
                <div className="form-group">
                  <label htmlFor="ownerName" className="text-sm font-medium text-gray-700">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    id="ownerName"
                    placeholder="Enter Owner Name"
                    value={newOwner.ownerName}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md text-black"
                    required
                  />
                </div>

                {/* Contact Number */}
                <div className="form-group">
                  <label htmlFor="contactNumber" className="text-sm font-medium text-gray-700">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    id="contactNumber"
                    placeholder="Enter Contact Number"
                    value={newOwner.contactNumber}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md text-black"
                    required
                  />
                </div>

                  {/* Email Address */}
                  <div className="form-group">
                    <label htmlFor="emailAddress" className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="emailAddress"
                      id="emailAddress"
                      placeholder="Enter Email Address"
                       value={newOwner.emailAddress}
                      onChange={handleChange}                
                      className="w-full p-3 border border-gray-300 rounded-md text-black"
                      required
                    />
                  </div>

                {/* website */}
                <div className="form-group">
                  <label htmlFor="website" className="text-sm font-medium text-gray-700">
                    website
                  </label>
                  <input
                    type="text"
                    name="website"
                    id="website"
                    placeholder="Enter website URL"
                    value={newOwner.website}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md text-black"
                  />
                </div>

                {/* Document Type */}
                <div className="form-group">
                  <label htmlFor="documentType" className="text-sm font-medium text-gray-700">
                    Document Type
                  </label>
                  <select
                 
                </div>

                {/* Conditionally Render Input Fields Based on Document Type */}
                {selectedDocument === 'GST Number' && (
                  <div className="form-group">
                    <label htmlFor="gstNumber" className="text-sm font-medium text-gray-700">
                      GST Number   name="documentType"
                    id="documentType"
                    value={newOwner.documentType}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md text-black"
                    required
                  >
                    <option value="">Select Document Type</option>
                    <option value="GST Number">GST Number</option>
                    <option value="UdhayamAadhar Number">UdhayamAadhar Number</option>
                    <option value="State Certificate">State Certificate</option>
                    <option value="Certificate of Incorporation">Certificate of Incorporation</option>
                  </select>
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      id="gstNumber"
                      placeholder="Enter GST Number"
                      value={newOwner.gstNumber}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md text-black"
                      required
                    />
                  </div>
                )}

                {selectedDocument === 'UdhayamAadhar Number' && (
                  <div className="form-group">
                    <label htmlFor="udhayamAadhar" className="text-sm font-medium text-gray-700">
                      udhayamAadhar Number
                    </label>
                    <input
                      type="text"
                      name="udhayamAadhar"
                      id="udhayamAadhar"
                      placeholder="Enter udhayamAadhar Number"
                      value={newOwner.udhayamAadhar}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md text-black"
                      required
                    />
                  </div>
                )}

                {selectedDocument === 'State Certificate' && (
                  <div className="form-group">
                    <label htmlFor="stateCertificate" className="text-sm font-medium text-gray-700">
                      State Certificate
                    </label>
                    <input
                      type="text"
                      name="stateCertificate"
                      id="stateCertificate"
                      placeholder="Enter State Certificate Details"
                      value={newOwner.stateCertificate}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md text-black"
                      required
                    />
                  </div>
                )}

                {selectedDocument === 'Certificate of Incorporation' && (
                  <div className="form-group">
                    <label htmlFor="incorporationCertificate" className="text-sm font-medium text-gray-700">
                      Certificate of Incorporation
                    </label>
                    <input
                      type="text"
                      name="incorporationCertificate"
                      id="incorporationCertificate"
                      placeholder="Enter Incorporation Certificate Details"
                      value={newOwner.incorporationCertificate}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-md text-black"
                      required
                    />
                  </div>
                )}

                {/* PAN Number */}
                <div className="form-group">
                  <label htmlFor="panNumber" className="text-sm font-medium text-gray-700">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    name="panNumber"
                    id="panNumber"
                    placeholder="Enter PAN Number"
                    value={newOwner.panNumber}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md text-black"
                    required
                  />
                </div>

                {/* Company Type */}
                <div className="form-group">
                  <label htmlFor="companyType" className="text-sm font-medium text-gray-700">
                    Company Type
                  </label>
                  <input
                    type="text"
                    name="companyType"
                    id="companyType"
                    placeholder="Enter Company Type"
                    value={newOwner.companyType}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md text-black"
                    required
                  />
                </div>

                {/* Employee Size */}
                <div className="form-group">
                  <label htmlFor="employeeSize" className="text-sm font-medium text-gray-700">
                    Employee Size
                  </label>
                  <select
                    name="employeeSize"
                    id="employeeSize"
                    value={newOwner.employeeSize}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md text-black"
                    required
                  >
                    <option value="">Select Employee Size</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-100">51-100</option>
                    <option value=">100">&gt;100</option>
                  </select>
                </div>

                {/* Business Registration */}
                <div className="form-group">
                <label htmlFor="businessRegistration" className="text-sm font-medium text-gray-700">
                    Bussiness Registration
                  </label>
                  <select
                    name="businessRegistration"
                    id="businessRegistration"
                    value={newOwner.businessRegistration}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md text-black"
                    required
                  >
                    <option value="">Select Business Registration</option>
                    <option value="Sole proprietorship">Sole proprietorship</option>
                    <option value="One person Company">One person Company</option>
                    <option value="Parternship">Parternship</option>
                    <option value="Private Limited">Private Limited</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className=" submit-btn flex justify-end mt-6">
                <button
                  type="submit"
                  className="submit-btn bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 "
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Save Owner'}
                </button>
              </div>

              
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOwnerForm;

function setError(arg0: string) {
  throw new Error('Function not implemented.');
}


function setLoading(arg0: boolean) {
  throw new Error('Function not implemented.');
}
