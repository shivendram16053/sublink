import { connectToDatabase } from "@/app/(mongo)/db";
import userBlink from "@/app/(mongo)/userSchema";

export const POST = async (req: Request) => {
  try {
    // Parse the incoming JSON body
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ message: "User ID is required" }), { status: 400 });
    }

    await connectToDatabase();  // Connect to MongoDB

    // Use find() to retrieve multiple matching users
    const users = await userBlink.find({ orgPrivateId: userId });

    if (users.length === 0) {
      return new Response(JSON.stringify({ message: "No subscribers found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ users }), { status: 200 });
  } catch (err) {
    console.error('Error processing request:', err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
};
