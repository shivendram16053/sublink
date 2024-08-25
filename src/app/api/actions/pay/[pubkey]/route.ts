import {
  ActionPostResponse,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
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

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const GET = async (req: Request) => {
  try {
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split("/");
    const orgPublicKey = decodeURIComponent(pathSegments[4]); // Extract the organization public key from the URL

    // Fetch organization details from the database using the OrgBlink schema
    const orgDetails = await OrgBlink.findOne({ orgPubKey: orgPublicKey });

    if (!orgDetails) {
      return new Response("Organization not found", {
        status: 404,
      });
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
            href: `/api/actions/pay?name={name}&email={email}&amount={amount}`,
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
    const orgPublicKey = url.searchParams.get("orgPubKey") ?? "";
    const name = url.searchParams.get("name") ?? "";
    const email = url.searchParams.get("email") ?? "";
    const amount = url.searchParams.get("amount") ?? "0";

    // Convert the amount to lamports
    const amountInLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
    const amountNumber = parseFloat(amount);

    // Fetch organization details
    const orgDetails = await OrgBlink.findOne({ orgPubKey: orgPublicKey });

    if (!orgDetails) {
      return new Response("Organization not found", { status: 404 });
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
      orgname:orgDetails.name,
      email,
      publicKey: userPubkey.toString(),
      subscriptionType,
      amount: parseFloat(amount),
    });

    await newUser.save();

    // Create the transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: userPubkey,
        lamports: amountInLamports,
        toPubkey: new PublicKey(orgPublicKey),
      })
    );

    transaction.feePayer = userPubkey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    // Create response payload
    const payload = {
      transaction,
      message: `Thanks ${name} (${email}) for subscribing to ${
        subscriptionType === "year" ? "1 Year" : "1 Month"
      }`,
    };

    return new Response(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (error) {
    console.error("Error processing POST request:");
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        status: 500,
        headers: ACTIONS_CORS_HEADERS,
      }
    );
  }
};
