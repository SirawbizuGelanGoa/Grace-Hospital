"use client"; 

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Phone, Mail, MapPin, Loader2 } from 'lucide-react';
// Removed: import { getContactInfo, ContactInfo } from '@/lib/mock-data'; 
import { Skeleton } from '@/components/ui/skeleton'; 
import { useToast } from '@/hooks/use-toast';

// Define a type for the contact details fetched from the API
// Adjust this based on the actual structure returned by your API
interface ContactDetails {
  id: number; // Or string if your ID is different
  address: string;
  phone: string;
  email: string;
  mapPlaceholder: string | null;
  created_at?: string; // Optional, depending on API response
}

const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Use the new ContactDetails interface
  const [contactDetails, setContactDetails] = useState<ContactDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        setIsLoadingDetails(true);
        // --- MODIFICATION: Fetch from API endpoint --- 
        const response = await fetch('/api/contact-info'); 
        
        if (!response.ok) {
          // Handle API errors (e.g., 404 Not Found if no data exists yet)
          if (response.status === 404) {
            console.warn("Contact info not found in database.");
            setContactDetails(null); // Explicitly set to null if not found
          } else {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }
        } else {
          // Parse the JSON data from the response
          const data: ContactDetails = await response.json();
          setContactDetails(data);
        }
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
        toast({
          title: "Error Loading Contact Info",
          description: "Could not load contact details from the server.",
          variant: "destructive",
        });
        setContactDetails(null); // Ensure details are null on error
      } finally {
        setIsLoadingDetails(false);
      }
    };
    fetchContactData();
    // Removed toast from dependency array as it's stable from the hook
  }, []); // Run only once on component mount


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // This part submits the contact *message* form, seems okay
      const response = await fetch('/api/contact', { // Assuming /api/contact is for sending messages
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: "Thank you for your message. We will get back to you soon.",
          variant: "default" 
        });
        setFormData({ name: '', email: '', message: '' }); // Reset form
      } else {
        toast({
          title: "Submission Error",
          description: result.message || "Failed to send message. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Network Error",
        description: "Could not connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMapContent = () => {
    // This logic remains the same, using contactDetails state
    const mapValue = contactDetails?.mapPlaceholder;

    if (!mapValue) {
      return <p className="text-sm text-foreground">Map not available.</p>;
    }

    if (mapValue.startsWith('http://') || mapValue.startsWith('https://')) {
      return (
        <iframe
          src={mapValue}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Location Map"
          className="rounded-lg"
        ></iframe>
      );
    }

    const coordsRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const match = mapValue.match(coordsRegex);
    if (match) {
      const lat = match[1];
      const lng = match[3]; 
      const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed&hl=en`;
      return (
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Location Map"
          className="rounded-lg"
        ></iframe>
      );
    }
    return <p className="text-sm text-foreground">{mapValue}</p>;
  };


  return (
    <section id="contact" className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">Contact Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
             <Card className="shadow-lg h-full">
               <CardHeader>
                 <CardTitle className="text-2xl font-semibold text-primary">Get in Touch</CardTitle>
               </CardHeader>
               <CardContent className="space-y-6 text-muted-foreground">
                {isLoadingDetails ? (
                    // Skeleton loading state remains the same
                    <>
                     <div className="flex items-start gap-4">
                       <Skeleton className="h-6 w-6 rounded-full mt-1 shrink-0" />
                       <Skeleton className="h-5 w-3/4" />
                     </div>
                     <div className="flex items-center gap-4">
                       <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                       <Skeleton className="h-5 w-1/2" />
                     </div>
                     <div className="flex items-center gap-4">
                       <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                       <Skeleton className="h-5 w-2/3" />
                     </div>
                      <Skeleton className="mt-6 h-64 md:h-80 w-full rounded-lg" />
                    </>
                 ) : contactDetails ? (
                  // Display fetched data
                  <>
                    <div className="flex items-start gap-4">
                     <MapPin className="h-6 w-6 text-accent mt-1 shrink-0" />
                     <span>{contactDetails.address}</span>
                   </div>
                   <div className="flex items-center gap-4">
                     <Phone className="h-6 w-6 text-accent shrink-0" />
                     <a href={`tel:${contactDetails.phone}`} className="hover:text-primary">{contactDetails.phone}</a>
                   </div>
                   <div className="flex items-center gap-4">
                     <Mail className="h-6 w-6 text-accent shrink-0" />
                     <a href={`mailto:${contactDetails.email}`} className="hover:text-primary">{contactDetails.email}</a>
                   </div>
                   <div className="mt-6 h-64 md:h-80 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {renderMapContent()}
                   </div>
                  </>
                 ) : (
                   // Display message if no contact info is found or failed to load
                   <p>Contact information is currently unavailable.</p>
                 )}
               </CardContent>
             </Card>
          </div>

          <div>
            {/* Contact message form remains the same */}
            <Card className="shadow-lg h-full">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-primary">Send Us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Your Email Address"
                       value={formData.email}
                       onChange={handleChange}
                       required
                       aria-required="true"
                       disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Your Message Here..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button type="submit" variant="accent" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

