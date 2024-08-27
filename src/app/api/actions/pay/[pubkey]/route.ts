import {
  ActionPostResponse,
  createPostResponse,
  ActionGetResponse,
  ACTIONS_CORS_HEADERS,
  ActionPostRequest,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { OrgBlink } from "../../../../(mongo)/OrgSchema"; // Import your OrgBlink model
import { UserBlink } from "../../../../(mongo)/userSchema"; // Import your UserBlink model

// Initialize Solana connection once to avoid repeated creation
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Simple in-memory cache for organization details
const orgCache = new Map<string, any>();

export const GET = async (req: Request) => {
  try {
    const { pathname } = new URL(req.url);
    const pubkey = pathname.split("/")[4]; // Extract the pubkey from the URL

    // Try to fetch organization details from cache
    let orgDetails = orgCache.get(pubkey);

    // If not in cache, fetch from database and store in cache
    if (!orgDetails) {
      orgDetails = await OrgBlink.findOne({ orgPubKey: pubkey })
        .select("name month year")
        .lean()
        .exec();

      if (!orgDetails) {
        return new Response("Organization not found", { status: 404 });
      }

      orgCache.set(pubkey, orgDetails);
    }

    // Create the response payload
    const payload: ActionGetResponse = {
      icon: new URL("/logo.png", new URL(req.url).origin).toString(),
      title: `Subscribe to ${orgDetails.name}`,
      description: `Subscribe to ${orgDetails.name} on Solana.`,
      label: "Subscribe Now",
      links: {
        actions: [
          {
            label: "Subscribe Now",
            href: `/api/actions/pay/${pubkey}?name={name}&email={email}&amount={amount}`,
            parameters: [
              {
                type: "text",
                name: "name",
                label: "Enter your Name",
                required: true,
              },
              {
                type: "email",
                name: "email",
                label: "Enter your Email",
                required: true,
              },
              {
                type: "select",
                name: "amount",
                label: "Subscription Amount in SOL",
                required: true,
                options: [
                  {
                    label: `${orgDetails.month} SOL - 1 MONTH`,
                    value: orgDetails.month.toString(),
                  },
                  {
                    label: `${orgDetails.year} SOL - 1 YEAR`,
                    value: orgDetails.year.toString(),
                  },
                ],
              },
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
    const body = await req.json();
    const userPubkey = new PublicKey(body.account);
    const url = new URL(req.url);
    const pubkey = url.pathname.split("/")[4]; // Extract the pubkey from the URL
    const name = url.searchParams.get("name") ?? "";
    const email = url.searchParams.get("email") ?? "";
    const amount = url.searchParams.get("amount") ?? "0";

    // Convert the amount to lamports
    const amountInLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
    const amountNumber = parseFloat(amount);

    // Fetch organization details from cache or database
    let orgDetails = orgCache.get(pubkey);
    if (!orgDetails) {
      orgDetails = await OrgBlink.findOne({ orgPubKey: pubkey })
        .select("name month year")
        .lean()
        .exec();

      if (!orgDetails) {
        return new Response("Organization not found", { status: 404 });
      }

      orgCache.set(pubkey, orgDetails);
    }

    // Determine subscription type
    let subscriptionType: "month" | "year";
    if (amountNumber === orgDetails.month) {
      subscriptionType = "month";
    } else if (amountNumber === orgDetails.year) {
      subscriptionType = "year";
    } else {
      return new Response("Invalid subscription amount", { status: 400 });
    }

    // Save user subscription details
    const newUser = new UserBlink({
      name,
      orgname: orgDetails.name,
      email,
      UserPubKey: userPubkey.toString(),
      duration: subscriptionType,
      amount: amountNumber,
    });

    await newUser.save();

    // Create the transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: userPubkey,
        lamports: amountInLamports,
        toPubkey: new PublicKey(pubkey),
      })
    );

    transaction.feePayer = userPubkey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    // Create response payload
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: `Thanks ${name} (${email}) for subscribing to ${
          subscriptionType === "year" ? "1 Year" : "1 Month"
        }`,
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
