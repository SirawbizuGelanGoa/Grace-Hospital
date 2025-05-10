
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';


export default function TermsOfServicePage() {
  const [lastUpdatedDate, setLastUpdatedDate] = useState<string | null>(null);

  useEffect(() => {
    // Set date on client-side to prevent hydration mismatch
    setLastUpdatedDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
     <div className="flex flex-col min-h-screen">
       <Header />
       <main className="flex-grow container mx-auto px-4 py-12">
         <Card>
           <CardHeader>
             <CardTitle className="text-3xl font-bold text-primary">Terms of Service</CardTitle>
           </CardHeader>
           <CardContent className="prose max-w-none">
            <p><em>Last Updated: {lastUpdatedDate === null ? <Skeleton className="inline-block h-4 w-32" /> : lastUpdatedDate}</em></p>

             <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">1. Acceptance of Terms</h2>
             <p>By accessing or using the Grace Hospital website or its services, you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the service.</p>

             <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">2. Use of Website</h2>
             <p>This website is intended to provide information about Grace Hospital and its services. The information provided is for general informational purposes only and does not constitute medical advice. You should always consult with a qualified healthcare provider for any health concerns or before making any decisions related to your health or treatment.</p>
             <p>You agree not to use the website:</p>
              <ul className="list-disc list-inside">
                <li>In any way that violates any applicable local, national, or international law or regulation.</li>
                <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent.</li>
                <li>To impersonate or attempt to impersonate the Hospital, a Hospital employee, another user, or any other person or entity.</li>
                <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the website, or which, as determined by us, may harm the Hospital or users of the website or expose them to liability.</li>
              </ul>

             <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">3. Intellectual Property</h2>
             <p>The website and its original content, features, and functionality are and will remain the exclusive property of Grace Hospital and its licensors. The content is protected by copyright, trademark, and other laws.</p>

             <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">4. Links to Other Websites</h2>
             <p>Our Service may contain links to third-party web sites or services that are not owned or controlled by Grace Hospital. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party web sites or services. You further acknowledge and agree that Grace Hospital shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.</p>

             <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">5. Disclaimer of Warranties; Limitation of Liability</h2>
             <p>The website is provided on an "AS IS" and "AS AVAILABLE" basis. Grace Hospital makes no representations or warranties of any kind, express or implied, as to the operation of the website or the information, content, or materials included on the website. You expressly agree that your use of the website is at your sole risk.</p>
             <p>In no event shall Grace Hospital, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>

             <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">6. Governing Law</h2>
             <p>These Terms shall be governed and construed in accordance with the laws of Your State/Country, without regard to its conflict of law provisions.</p>

             <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">7. Changes</h2>
             <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

             <h2 className="text-xl font-semibold mt-6 mb-2 text-primary">8. Contact Us</h2>
             <p>If you have any questions about these Terms, please contact us using the information provided in the Contact section of our website.</p>
           </CardContent>
         </Card>
       </main>
       <Footer />
     </div>
  );
}

    