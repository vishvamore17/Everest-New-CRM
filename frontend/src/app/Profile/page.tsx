'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Define the form schema using Zod
const formSchema = z.object({
  companyName: z.string().min(2, { message: 'Company name is required.' }),
  ownerName: z.string().min(2, { message: 'Owner name must be at least 2 characters.' }),
  contactNumber: z.string().min(10, { message: 'Contact number must be at least 10 digits.' }),
  emailAddress: z.string().email({ message: 'Invalid email address' }),
  website: z.string().url({ message: 'Invalid website URL' }),
  documentType: z.string().min(1, { message: 'Document type is required.' }),
  documentNumber: z.string().min(1, { message: 'Document number is required.' }),
  panNumber: z.string().min(10, { message: 'PAN number must be at least 10 characters.' }),
  companyType: z.string().min(1, { message: 'Company type is required.' }),
  employeeSize: z.string().min(1, { message: 'Employee size is required.' }),
  businessRegistration: z.string().min(1, { message: 'Business registration is required.' }),
  logo: z.instanceof(File).optional(),
});

const NewProfile: React.FC = () => {
  const router = useRouter();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      ownerName: '',
      contactNumber: '',
      emailAddress: '',
      website: '',
      documentType: '',
      documentNumber: '',
      panNumber: '',
      companyType: '',
      employeeSize: '',
      businessRegistration: '',
    },
  });



  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setLogoPreview(URL.createObjectURL(file));
      form.setValue('logo', file);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const formData = new FormData();
  
    // Append form values to FormData
    Object.keys(values).forEach((key) => {
      const value = values[key as keyof typeof values];
      if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'string') {
        formData.append(key, value);
      }
    });
  
    // Log FormData entries for debugging
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
  
    try {
      const response = await fetch('http://localhost:8000/api/v1/owner/addOwner', {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit the profile.');
      }
  
      toast({
        title: 'Profile Created',
        description: `Your profile has been created successfully.`,
      });
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'There was an error submitting the profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '50px', height: '100vh' }}>
      <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>Create Profile</h1>
      <Separator className="my-4 border-gray-500 border-1" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
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
                name='logo'
                id="logo"
                accept="image/*"
                onChange={handleLogoChange}
                required
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Submitting...' : 'Save Owner'}
              </Button>
            </div>
          </div>

          <h2>Profile Information</h2>
          <br />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', flexGrow: 1 }}>
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Company Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ownerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Owner Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Contact Number" {...field} />
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
                    <Input placeholder="Enter Email Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Website URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Document Type</option>
                      <option value="GST Number">GST Number</option>
                      <option value="UdhyamAadhar Number">UdhyamAadhar Number</option>
                      <option value="State Certificate">State Certificate</option>
                      <option value="Certificate of Incorporation">Certificate of Incorporation</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('documentType') && (
              <FormField
                control={form.control}
                name="documentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{form.watch('documentType')}</FormLabel>
                    <FormControl>
                      <Input placeholder={`Enter ${form.watch('documentType')}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="panNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pan Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Pan Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Company Type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Size</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
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

            <FormField
              control={form.control}
              name="businessRegistration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Registration</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
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
        </form>
      </Form>
    </div>
  );
};

export default NewProfile;