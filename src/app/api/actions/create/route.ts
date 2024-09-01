import { NextRequest, NextResponse } from "next/server";
import {
  Transaction,
  PublicKey,
  SystemProgram,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  ActionGetResponse,
} from "@solana/actions";
import { connectToDatabase } from "../../../(mongo)/db"; // adjust the path as necessary
import { customAlphabet } from "nanoid";
import OrgData from "@/app/(mongo)/OrgSchema";
import { BlinksightsClient } from 'blinksights-sdk';

const client = new BlinksightsClient('7b49ec4afba592ae347ee97a3d929532d2e0190be0eece48af9b40a857306e1c');
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const MY_PUB_KEY = "6rSrLGuhPEpxGqmbZzV1ZttwtLXzGx8V2WEACXd4qnVH";
const generateRandomId = customAlphabet("abcdefghijklmnopqrstuvwxyz", 8);

export const GET = async (req: NextRequest) => {
  const payload = await client.createActionGetResponseV1(req.url, {
    icon: "https://subslink.vercel.app/logo.png",
    title: "Create your own subscription Blink",
    description:
      "Enter the details of your organisation/business/project to create a blink",
    label: "Create One",
    links: {
      actions: [
        {
          label: "Create One",
          href: "/api/actions/create?name={name}&email={email}&month={month}&year={year}&type={choice}",
          parameters: [
            { type: "text", name: "name", label: "Enter Name", required: true },
            {
              type: "email",
              name: "email",
              label: "Enter Email",
              required: true,
            },
            {
              type: "radio",
              name: "choice",
              label: "Choose the coin for fees",
              options: [
                { label: "SOL", value: "sol" },
                { label: "USDC (Make sure you have USDC)", value: "usdc" },
              ],
            },
            {
              type: "number",
              name: "month",
              label: "Enter Monthly Price",
              required: true,
            },
            {
              type: "number",
              name: "year",
              label: "Enter Yearly Price",
              required: true,
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
};

// Add OPTIONS handler for CORS
export const OPTIONS = GET;

export const POST = async (req: NextRequest) => {
  try {
    await connectToDatabase();

    const body = (await req.json()) as { account: string; signature: string };
    client.trackActionV2(body.account, req.url);
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") ?? "";
    const email = searchParams.get("email") ?? "";
    const month = parseFloat(searchParams.get("month") ?? "0");
    const year = parseFloat(searchParams.get("year") ?? "0");
    const feestype = searchParams.get("type") ?? "sol";
    const randomId = generateRandomId();
    const orgKey = body.account;
    const orgPubKey = new PublicKey(orgKey);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: orgPubKey,
        toPubkey: new PublicKey(MY_PUB_KEY),
        lamports: 0, 
      })
    );

    transaction.feePayer = orgPubKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    const payload = await createPostResponse({
      fields: {
        transaction,
        message: "Your blink is created successfully",
        links: {
          next:{
            type:"post",
            href:`/api/actions/saveOrgData?orgId=${randomId}&name=${name}&email=${email}&month=${month}&year=${year}&orgPubKey=${orgPubKey}&type=${feestype}`
          }
        },
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
