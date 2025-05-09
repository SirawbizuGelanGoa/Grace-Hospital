'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';

export default function PrivacyPolicyPage() {
  const [lastUpdatedDate, setLastUpdatedDate] = useState<string | null>(null);

  useEffect(() => {
    setLastUpdatedDate(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
       <Header />
       <main className="flex-grow container mx-auto px-4 py-12">
         <Card>
           <CardHeader>
             <CardTitle className="text-3xl font-bold text-primary">Privacy Policy</CardTitle>
           </CardHeader>
           <CardContent className="prose max-w-none">
             <p><em>Last Updated: {lastUpdatedDate ? lastUpdatedDate : <Skeleton className="inline-block h-4 w-24" />}</em></p>

             <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">Introduction</h2>
             <p>Grace Hospital ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website [Your Website URL] or use our services.</p>

             <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">Information We Collect</h2>
             <p>We may collect personal information such as:</p>
             <ul className="list-disc list-inside">
               <li>Contact details (name, email address, phone number) when you use our contact forms or book appointments.</li>
               <li>Usage data (IP address, browser type, pages visited) collected automatically through cookies and similar technologies.</li>
               <li>Health information if you choose to provide it through secure patient portals or forms (handled with utmost confidentiality and compliance with health regulations like HIPAA, where applicable).</li>
             </ul>

             <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">How We Use Your Information</h2>
             <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside">
                <li>Provide, operate, and maintain our website and services.</li>
                <li>Respond to your inquiries and appointment requests.</li>
                <li>Improve our website and services.</li>
                <li>Send you relevant information or updates (with your consent).</li>
                <li>Comply with legal obligations.</li>
              </ul>

             <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">Information Sharing</h2>
             <p>We do not sell your personal information. We may share information with third-party service providers who assist us in operating our website or conducting our business, provided they agree to keep this information confidential. We may also disclose information if required by law.</p>

              <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">Security</h2>
              <p>We implement appropriate security measures to protect your personal information. However, no electronic transmission or storage is 100% secure.</p>

              <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">Your Choices</h2>
              <p>You can typically manage cookie preferences through your browser settings. You may opt-out of promotional communications by following the unsubscribe instructions.</p>

             <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">Changes to This Policy</h2>
             <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>

             <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">Contact Us</h2>
             <p>If you have any questions about this Privacy Policy, please contact us using the information provided in the Contact section of our website.</p>
           </CardContent>
         </Card>
       </main>
       <Footer />
    </div>
  );
}
