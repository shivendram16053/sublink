import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connectToDatabase } from "@/app/(mongo)/db";
import userBlink from "@/app/(mongo)/userSchema";

// Create a Nodemailer transporter using your SMTP server details
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use the email service provider (e.g., Gmail, Outlook, etc.)
  auth: {
    user: process.env.EMAIL, // Your email address
    pass: process.env.PASSWORD, // Your email password
  },
});

export const POST = async (req: Request) => {
  try {
    const { title, content, projectDetails } = await req.json();

    // Validate input
    if (!title || !content || !projectDetails) {
      return new NextResponse(JSON.stringify({ message: 'Title, content, and orgId are required' }), { status: 400 });
    }

    await connectToDatabase();
    const orgId = projectDetails.org;

    // Retrieve all subscribed users for the given orgId
    const subscribers = await userBlink.find({ orgId });

    if (subscribers.length === 0) {
      return new NextResponse(JSON.stringify({ message: 'No subscribers found for this ID' }), { status: 404 });
    }

    // Send an email to each subscriber
    for (const subscriber of subscribers) {
      const { email, name } = subscriber;

      // Construct email content with project details
      const updatedContent = `
${content}

---
Name: ${projectDetails.name}
Email: ${projectDetails.email}
${projectDetails.website ? `Website: ${projectDetails.website}` : ''}
${projectDetails.twitter ? `Twitter: ${projectDetails.twitter}` : ''}
${projectDetails.discord ? `Discord: ${projectDetails.discord}` : ''}
`;


      // Email data
      const mailOptions = {
        from: `${projectDetails.name} <${projectDetails.email}>`, // Sender's email
        to: email, // Recipient's email
        subject: title, // Email subject
        text: updatedContent, // Email body in plain text
      };

      // Send email
      await transporter.sendMail(mailOptions);
    }

    return new NextResponse(JSON.stringify({ message: 'Emails sent successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};
