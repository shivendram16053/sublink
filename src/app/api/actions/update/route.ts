import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/(mongo)/db';
import OrgData from '@/app/(mongo)/OrgSchema';

export const POST = async (req: Request) => {
  try {
    const {
      uniqueId,
      name,
      email,
      website,
      twitter,
      discord,
      month,
      year,
      feesType,
    } = await req.json();

    if (!uniqueId) {
      return new NextResponse(JSON.stringify({ message: 'uniqueId is required' }), { status: 400 });
    }
    if (!name || !email) {
      return new NextResponse(JSON.stringify({ message: 'Name and email are required' }), { status: 400 });
    }

    await connectToDatabase();
    const org = await OrgData.findOne({ orgPrivateId: uniqueId });

    if (!org) {
      return new NextResponse(JSON.stringify({ message: 'Project not found' }), { status: 404 });
    }

    // Update the organization details
    await OrgData.updateOne(
      { orgPrivateId: uniqueId },
      { $set: { name, email, website, twitter, discord, month, year, feesType } }
    );

    return new NextResponse(
      JSON.stringify({
        message: 'Project updated successfully',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
};
