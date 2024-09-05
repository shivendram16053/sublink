import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/(mongo)/db';
import OrgData from '@/app/(mongo)/OrgSchema';

// Named export for POST request
export const POST = async (req: Request) => {
  try {
    const { uniqueId } = await req.json();

    if (!uniqueId) {
      return new NextResponse(JSON.stringify({ message: 'uniqueId is required' }), { status: 400 });
    }

    await connectToDatabase();
    const org = await OrgData.findOne({ orgPrivateId: uniqueId });

    if (!org) {
      return new NextResponse(JSON.stringify({ exists: false }), { status: 200 });
    }

    // Return the organization data along with the `exists` status
    return new NextResponse(
      JSON.stringify({
        exists: true,
        org, // Send the full organization details
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};
