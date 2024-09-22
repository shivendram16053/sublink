import { connectToDatabase } from "@/app/(mongo)/db";
import OrgData from "@/app/(mongo)/OrgSchema";
import userBlink from "@/app/(mongo)/userSchema";
import {
  createActionHeaders,
  NextActionPostRequest,
  ActionError,
  CompletedAction,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import nodemailer from "nodemailer";

const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export const GET = async () => {
  return Response.json(
    { message: "Method not supported" },
    {
      headers: ACTIONS_CORS_HEADERS,
    }
  );
};

export const OPTIONS = GET;

export const POST = async (req: Request) => {
  await connectToDatabase();
  try {
    const body: NextActionPostRequest = await req.json();
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId") ?? "";
    const name = url.searchParams.get("name") ?? "";
    const email = url.searchParams.get("email") ?? "";
    const orgId = url.searchParams.get("orgId") ?? "";
    const type = url.searchParams.get("type") ?? "";
    const amount = url.searchParams.get("amount") ?? "";
    const userPubKey = url.searchParams.get("userPubKey") ?? "";
    const planType = url.searchParams.get("plantype") ?? "";

    const orgdetails = await OrgData.findOne({ org: orgId });

    let signature: string;
    try {
      signature = body.signature;
      if (!signature) throw "Invalid signature";
    } catch (err) {
      throw 'Invalid "signature" provided';
    }

    try {
      let status = await connection.getSignatureStatus(signature);

      if (!status) throw "Unknown signature status";

      if (status.value?.confirmationStatus) {
        if (
          status.value.confirmationStatus != "confirmed" &&
          status.value.confirmationStatus != "finalized"
        ) {
          let actionError: ActionError = {
            message: "Signature not confirmed or finalized",
          };
          return new Response(JSON.stringify(actionError), {
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
          });
        }
      }

      // Store data directly in DB
      const newBlink = new userBlink({
        userId,
        name,
        email,
        orgPrivateId:orgdetails.orgPrivateId,
        orgId,
        amount,
        duration: type,
        UserPubKey: userPubKey,
      });

      await newBlink.save();

      const transaction = await connection.getParsedTransaction(
        signature,
        "confirmed"
      );

      const payload: CompletedAction = {
        type: "completed",
        title: "Subscription Purchase Completed",
        icon: 'https://subslink.vercel.app/logo.png',
        label: "Subscription Bought",
        description: `You have successfully purchased ${planType} for ${orgdetails.name}.`,
      };

      // Send an email notification to the user
      await transporter.sendMail({
        from: `"SUBSLINK" <${process.env.EMAIL}>`,
        to: email,
        subject: `Subscription Purchase Confirmation`,
        text: `Hello ${name},

Thank you for your purchase!

We are pleased to confirm that your subscription to ${orgdetails.name} has been successfully activated. Here are the details of your subscription:

Plan Type : ${planType}
Amount Paid : ${amount} ${orgdetails.feesType}

You will get daily updates and alpha for the project on this email. If you have any questions or need assistance, feel free to reach out to us.

Best regards,
The SUBSLINK Team

SUBSLINK - Simplifying Subscriptions for Everyone
Website: ${process.env.BASE_URL}
Support: subslink22@gmail.com`,
      });

      return new Response(JSON.stringify(payload), {
        headers: ACTIONS_CORS_HEADERS,
      });
    } catch (err) {
      console.error("Error in transaction or saving event:", err);
      if (typeof err == "string") throw err;
      throw "Unable to confirm the provided signature";
    }
  } catch (err) {
    console.error("General error:", err);
    let actionError: ActionError = { message: "An unknown error occurred" };
    if (typeof err == "string") actionError.message = err;
    return new Response(JSON.stringify(actionError), {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};
