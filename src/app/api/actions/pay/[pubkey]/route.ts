import {
  ActionPostResponse,
  createPostResponse,
  ActionGetResponse,
  ACTIONS_CORS_HEADERS,
  ActionPostRequest,
  ActionError,
} from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import OrgData from "../../../../(mongo)/OrgSchema"; 
import { connectToDatabase } from "../../../../(mongo)/db"; // Adjust the path as necessary
import { BlinksightsClient } from 'blinksights-sdk';
import { customAlphabet } from "nanoid";
import { AccountLayout, TOKEN_PROGRAM_ID, createTransferInstruction } from "@solana/spl-token";

// Initialize Blinksights client
const client = new BlinksightsClient('7b49ec4afba592ae347ee97a3d929532d2e0190be0eece48af9b40a857306e1c');

// Generate a random ID
const generateRandomId = customAlphabet("abcdefghijklmnopqrstuvwxyz", 8);

// Establish connection to Solana Devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const GET = async (req: Request) => {
  try {
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split("/");
    const OrgID = pathSegments[4]; 

    await connectToDatabase();

    const orgDetails = await OrgData.findOne({ org: OrgID });

    if (!orgDetails) {
      return new Response("Organization not found", { status: 404 });
    }

    const paytype = orgDetails.feesType === "sol"? "SOL":"USDC";

    // Create the response payload
    const payload = await client.createActionGetResponseV1(req.url, {
      icon: `${process.env.BASE_URL}/logo.png`,
      title: `Subscribe to ${orgDetails.name}`,
      description: `Subscribe to ${orgDetails.name} for Updates, Alphas, Newsletters and exclusive content.
      Website : ${orgDetails.website}
      Twitter : ${orgDetails.twitter}
      Discord : ${orgDetails.discord}`,
      label: "Subscribe Now",
      links: {
        actions: [
          {
            label: "Subscribe Now",
            href: `/api/actions/pay/${OrgID}?name={name}&email={email}&amount={amount}`,
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
                label: `Subscription Amount in ${paytype}`,
                required: true,
                options: [
                  {
                    label: `${orgDetails.month} ${paytype} - 1 MONTH`,
                    value: orgDetails.month.toString(),
                  },
                  {
                    label: `${orgDetails.year} ${paytype} - 1 YEAR`,
                    value: orgDetails.year.toString(),
                  },
                ],
              },
            ],
          },
        ],
      },
      type: "action",
    }) as ActionGetResponse;

    return new Response(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (error) {
    console.error("Error processing GET request:", error);
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};

export const OPTIONS = GET;

export const POST = async (req: Request) => {
  try {
    await connectToDatabase();

    const body = (await req.json()) as { account: string; signature: string };
    client.trackActionV2(body.account, req.url);

    const userPubkey = new PublicKey(body.account);
    const url = new URL(req.url);
    const OrgID = url.pathname.split("/")[4]; // Extract the OrgID from the URL
    const name = url.searchParams.get("name") ?? "";
    const email = url.searchParams.get("email") ?? "";
    const amount = url.searchParams.get("amount") ?? "0";
    const randomId = generateRandomId();

    // Convert the amount to lamports
    const amountInLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
    const amountNumber = parseFloat(amount);
    console.log(amountNumber);

    // Fetch organization details
    const orgDetails = await OrgData.findOne({ org: OrgID });

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

    const type = subscriptionType === "month" ? "Monthly Plan" : "Yearly Plan";

    let transaction;

    // Create the transaction based on organization type
    if (orgDetails.feesType === "sol") {
      transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: userPubkey,
          lamports: amountInLamports,
          toPubkey: new PublicKey(orgDetails.orgPubKey),
        })
      );
    } else {
      const tokenMintAddress = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
      
      // Fetch all token accounts for the user
      const tokenAccounts = await connection.getTokenAccountsByOwner(userPubkey, {
        programId: TOKEN_PROGRAM_ID,
      });

      let userTokenAccount: PublicKey | null = null;
      let userBalance = 0;

      // Find the associated token account for the specified mint
      for (const tokenAccountInfo of tokenAccounts.value) {
        const accountData = AccountLayout.decode(tokenAccountInfo.account.data);
        const mintPublicKey = new PublicKey(accountData.mint);

        if (mintPublicKey.equals(tokenMintAddress)) {
          userTokenAccount = tokenAccountInfo.pubkey;
          userBalance = Number(accountData.amount);
          break;
        }
      }

      if (!userTokenAccount) {
        return new Response(JSON.stringify({ message: "You don't have a enough USDC" }), {
          status: 400,
          headers: ACTIONS_CORS_HEADERS,
        });
      }

      // Check if the user has enough balance
      if (userBalance < amountNumber) {
        return new Response(JSON.stringify({ message: "You don't have enough USDC for fees" }), {
          status: 400,
          headers: ACTIONS_CORS_HEADERS,
        });
      }

      const organizerPubkey = new PublicKey(orgDetails.orgPubKey);
      const organizerTokenAccounts = await connection.getTokenAccountsByOwner(organizerPubkey, {
        programId: TOKEN_PROGRAM_ID,
      });

      let organizerTokenAccount: PublicKey | null = null;

      // Find the associated token account for the specified mint
      for (const tokenAccountInfo of organizerTokenAccounts.value) {
        const accountData = AccountLayout.decode(tokenAccountInfo.account.data);
        const mintPublicKey = new PublicKey(accountData.mint);

        if (mintPublicKey.equals(tokenMintAddress)) {
          organizerTokenAccount = tokenAccountInfo.pubkey;
          break;
        }
      }

      if (!organizerTokenAccount) {
        return new Response(JSON.stringify({ message: "Organizer does not have a token account for USDC" }), {
          status: 400,
          headers: ACTIONS_CORS_HEADERS,
        });
      }

      // Create the transaction for SEND
      transaction = new Transaction().add(
        createTransferInstruction(
          userTokenAccount, // Source account (user's token account)
          organizerTokenAccount, // Destination account (organizer's token account)
          userPubkey, // Owner of the source account
          amountNumber*1000000, // Number of tokens to transfer
          [],
          TOKEN_PROGRAM_ID
        )
      );
    }

    // Finalize and prepare the response payload
    transaction.feePayer = userPubkey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: "",
        links: {
          next: {
            type: 'post',
            href: `/api/actions/saveUserData?userId=${randomId}&name=${name}&email=${email}&orgId=${orgDetails.org}&type=${subscriptionType}&amount=${amount}&userPubKey=${userPubkey}&plantype=${type}`
          }
        }
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
