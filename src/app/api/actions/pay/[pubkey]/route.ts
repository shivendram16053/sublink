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
import OrgData from "../../../../(mongo)/OrgSchema"; // Import your OrgData model
import userBlink from "../../../../(mongo)/userSchema"; // Import your UserBlink model
import { NextResponse } from "next/server";
import { getUserAction, saveUserData } from "../../helper";
import { connectToDatabase } from "../../../../(mongo)/db"; // adjust the path as necessary


const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const GET = async (req: Request) => {
  try {
    const { pathname } = new URL(req.url);
    const pathSegments = pathname.split("/");
    const OrgID = pathSegments[4]; 

    const orgDetails = await OrgData.findOne({ org: OrgID });

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

    await connectToDatabase();

    const body = (await req.json()) as { account: string; signature: string };
    const userPubkey = new PublicKey(body.account);
    const url = new URL(req.url);
    const OrgID = url.pathname.split("/")[4]; // Extract the pubkey from the URL
    const name = url.searchParams.get("name") ?? "";
    const email = url.searchParams.get("email") ?? "";
    const amount = url.searchParams.get("amount") ?? "0";
    const stage = url.searchParams.get("stage");

    // Convert the amount to lamports
    const amountInLamports = parseFloat(amount) * LAMPORTS_PER_SOL;
    const amountNumber = parseFloat(amount);

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

    const type = subscriptionType =="month"?"Monthly Plan" : "Yearly Plan"

    

    // Create the transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: userPubkey,
        lamports: amountInLamports/2,
        toPubkey: new PublicKey(orgDetails.orgPubKey),
      })
    );

    transaction.feePayer = userPubkey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    if(stage){
      const newUser = new userBlink({
        name,
        orgId: orgDetails.org,
        email,
        UserPubKey: userPubkey.toString(),
        duration: subscriptionType,
        amount: parseFloat(amount),
      });
  
      await newUser.save();

      return NextResponse.json(
        await createPostResponse({
          fields: {
            links: {
              next: getUserAction(name,email,type,orgDetails.name),
            },
            transaction,
            message: `Blink created`,
          },
        }),
        {
          headers: ACTIONS_CORS_HEADERS,
        }
      );
    }

    const nextActionLink = await saveUserData(name, email, type, body.account, amountNumber,OrgID);

    // Create response payload
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: "Please sign the transaction to complete the process.",
        links:{
          next:nextActionLink,
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
