
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

// Define a schema for validating the request body
const contactFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  message: z.string().min(5, { message: "Message must be at least 5 characters long." }),
});

// The target email address
const TARGET_EMAIL = "sirawbizugelangelan@gmail.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = contactFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid form data.", errors: validation.error.format() }, { status: 400 });
    }

    const { name, email, message } = validation.data;

    // --- !!! IMPORTANT: Actual Email Sending Logic (Placeholder) !!! ---
    // In a real application, you would integrate an email sending service here.
    // Examples: Nodemailer, SendGrid, Resend, AWS SES, etc.
    // This requires server-side setup, API keys, and potentially environment variables.
    // DO NOT attempt to send email directly from the client-side.

    console.log("Received contact form submission:");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Message:", message);
    console.log("This message would be sent to:", TARGET_EMAIL);

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Placeholder for actual email sending success/failure
    const emailSentSuccessfully = true; // Assume success for now

    if (emailSentSuccessfully) {
      return NextResponse.json({ message: "Message sent successfully!" }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Failed to send message. Please try again later." }, { status: 500 });
    }
    // --- End of Placeholder Logic ---

  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json({ message: "An unexpected error occurred." }, { status: 500 });
  }
}
