import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Contact Form Validation Schema
 */
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

/**
 * POST - Handle contact form submission
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = contactSchema.parse(body);

    // Here you would typically:
    // 1. Send an email notification
    // 2. Store the message in database
    // 3. Integrate with a CRM or ticketing system

    // For now, we'll log the message and return success
    console.log("Contact form submission:", {
      name: validated.name,
      email: validated.email,
      subject: validated.subject,
      message: validated.message,
      timestamp: new Date().toISOString(),
    });

    // In production, you would integrate with:
    // - Nodemailer/SendGrid for email
    // - Supabase to store messages
    // - Slack/Discord webhooks for notifications

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for your message. We'll get back to you soon!",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send message. Please try again later.",
      },
      { status: 500 }
    );
  }
}
