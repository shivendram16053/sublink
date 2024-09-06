import { connectToDatabase } from "@/app/(mongo)/db";
import OrgData from "@/app/(mongo)/OrgSchema";
import {
  createActionHeaders,
  NextActionPostRequest,
  ActionError,
  CompletedAction,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { randomBytes } from "crypto";
import { customAlphabet } from "nanoid";
import nodemailer from "nodemailer";
const generateRandomId = customAlphabet(`${process.env.SECRET_KEY}`, 10);
const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export const GET = async (req: Request) => {
  return new Response(
    JSON.stringify({ message: "Method not supported" } as ActionError),
    {
      status: 403,
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
    const name = url.searchParams.get("name") ?? "";
    const email = url.searchParams.get("email") ?? "";
    const website = url.searchParams.get("website") ?? "";
    const discord = url.searchParams.get("discord") ?? "";
    const twitter = url.searchParams.get("twitter") ?? "";
    const month = parseFloat(url.searchParams.get("month") ?? "0");
    const year = parseFloat(url.searchParams.get("year") ?? "0");
    const orgPubKey = url.searchParams.get("orgPubKey") ?? "";
    const feesType = url.searchParams.get("feesType") ?? "";

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
      const org = generateRandomId();
      const orgPrivateId = randomBytes(16).toString('hex');


      const newOrgData = new OrgData({
        org,
        orgPrivateId,
        name,
        email,
        website,
        discord,
        twitter,
        feesType,
        month,
        year,
        orgPubKey,
      });

      await newOrgData.save();

      const transaction = await connection.getParsedTransaction(
        signature,
        "confirmed"
      );

      const blinkUrl = `https://dial.to/?action=solana-action:${process.env.BASE_URL}/api/actions/pay/${org}`;
      const twitterShareUrl = `https://twitter.com/intent/tweet?text=Check%20out%20my%20new%20Blink%20link:%20${encodeURIComponent(
        blinkUrl
      )}`;

      // Generate the QR code URL for the Twitter share link
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        twitterShareUrl
      )}`;

      // Send an email notification
      await transporter.sendMail({
        from: `"SUBSLINK" <${process.env.EMAIL}>`,
        to: email,
        subject: `Thanks ${name} for using SUBSLINK`,
        text: `Hello ${name},

Thank you for choosing SUBSLINK!

We are excited to inform you that your subscription Blink has been created successfully. You can share the below blink link on your socials:

Your Private ID : ${orgPrivateId} . This will be used to send information,message and contents to your users so keep it safe.
Blink URL: ${blinkUrl}
To send emails to your subscriber :- ${process.env.BASE_URL}/send-email

We hope you enjoy the ease and flexibility that SUBSLINK offers. If you have any questions or need assistance, feel free to reach out to us.

Best regards,
The SUBSLINK Team

SUBSLINK - Simplifying Subscriptions for Everyone
Website: ${process.env.BASE_URL}
Support: subslink22@gmail.com`,
      });

      const payload: CompletedAction = {
        type: "completed",
        title: "Subscription created Successfully .Check Email",
        icon: qrCodeUrl,
        label: "Subscription Created",
        description: `Your Blink URL to share is 
        ${blinkUrl}
        or just scan the QR code to share . Check Your email for more info.`,
      };

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
