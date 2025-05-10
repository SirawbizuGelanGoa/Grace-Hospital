"use client"; // Required for form handling

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Phone, Mail, MapPin } from 'lucide-react';
import { getContactInfo, ContactInfo } from '@/lib/mock-data'; 
import { Skeleton } from '@/components/ui/skeleton'; 

const ContactSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [contactDetails, setContactDetails] = useState<ContactInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        setIsLoading(true);
        const data = await getContactInfo();
        setContactDetails(data);
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContactData();
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    try {
      console.log('Submitting form data:', formData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Form submitted successfully:', formData);
      setSubmitMessage('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' }); 
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitMessage('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMapContent = () => {
    const mapValue = contactDetails?.mapPlaceholder;

    if (!mapValue) {
      return <p className="text-sm text-foreground">Map not available.</p>;
    }

    if (mapValue.startsWith('http://') || mapValue.startsWith('https://')) {
      // Assume it's a full embed URL
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

    // Try to parse as coordinates "lat,lng"
    const coordsRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const match = mapValue.match(coordsRegex);
    if (match) {
      const lat = match[1];
      const lng = match[3]; // Corrected index for longitude
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

    // If not a URL and not coordinates, display as text
    return <p className="text-sm text-foreground">{mapValue}</p>;
  };


  return (
    <section id="contact" className="py-16 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">Contact Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
             <Card className="shadow-lg h-full">
               <CardHeader>
                 <CardTitle className="text-2xl font-semibold text-primary">Get in Touch</CardTitle>
               </CardHeader>
               <CardContent className="space-y-6 text-muted-foreground">
                {isLoading ? (
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
                   {/* Map container */}
                   <div className="mt-6 h-64 md:h-80 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                      {renderMapContent()}
                   </div>
                  </>
                 ) : (
                   <p>Failed to load contact information.</p>
                 )}
               </CardContent>
             </Card>
          </div>

          {/* Contact Form */}
          <div>
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
                    />
                  </div>
                  <Button type="submit" variant="accent" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                   {submitMessage && (
                     <p role="alert" className={`mt-4 text-sm ${submitMessage.includes('Failed') ? 'text-destructive' : 'text-green-600'}`}>
                       {submitMessage}
                     </p>
                   )}
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
