import {
  ActionPostResponse,
  createPostResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
  ActionGetResponse,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { connectToDatabase } from "../../../(mongo)/db"; // Adjust the path as necessary
import { OrgBlink } from "../../../(mongo)/OrgSchema";

// Initialize Solana connection once
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const MY_PUB_KEY = "6rSrLGuhPEpxGqmbZzV1ZttwtLXzGx8V2WEACXd4qnVH";

// In-memory cache for frequently accessed data
const orgCache = new Map<string, any>();

export const GET = async (req: Request) => {
  try {
    const payload: ActionGetResponse = {
      icon: new URL("/logo.png", new URL(req.url).origin).toString(),
      title: "Create your own subscription Blink",
      description:
        "Enter the details of your organization/business/project to create a blink",
      label: "Create One",
      links: {
        actions: [
          {
            label: "Create One",
            href: "/api/actions/create?name={name}&email={email}&month={month}&year={year}",
            parameters: [
              { type: "text", name: "name", label: "Enter Name", required: true },
              { type: "email", name: "email", label: "Enter Email", required: true },
              { type: "number", name: "month", label: "Enter Monthly Price", required: true },
              { type: "number", name: "year", label: "Enter Yearly Price", required: true },
            ],
          },
        ],
      },
      type: "action",
    };

    return new Response(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (error) {
    console.error("Error processing GET request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        status: 500,
        headers: ACTIONS_CORS_HEADERS,
      }
    );
  }
};

export const OPTIONS = GET;

export const POST = async (req: Request) => {
  try {
    await connectToDatabase(); // Connect to MongoDB

    const body: ActionPostRequest = await req.json();
    const orgPubKey = body.account;
    const url = new URL(req.url);
    const name = url.searchParams.get("name") ?? "";
    const email = url.searchParams.get("email") ?? "";
    const month = parseFloat(url.searchParams.get("month") ?? "0");
    const year = parseFloat(url.searchParams.get("year") ?? "0");

    // Check if the organization already exists in the cache
    if (!orgCache.has(orgPubKey)) {
      // Create a new Blink document and save it to the database
      const newBlink = new OrgBlink({
        name,
        email,
        month,
        year,
        orgPubKey,
      });

      await newBlink.save();

      // Cache the organization details to avoid redundant database queries
      orgCache.set(orgPubKey, { name, email, month, year });
    }

    // Prepare the transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(orgPubKey),
        lamports: 10000000,
        toPubkey: new PublicKey(MY_PUB_KEY),
      })
    );

    transaction.feePayer = new PublicKey(orgPubKey);
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: `Your Blink is: /pay/${orgPubKey}`,
      },
    });

    return new Response(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (error) {
    console.error("Error processing POST request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        status: 500,
        headers: ACTIONS_CORS_HEADERS,
      }
    );
  }
};
