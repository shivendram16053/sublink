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
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export const GET = async (req: Request) => {
  return Response.json({ message: "Method not supported" } as ActionError, {
    status: 403,
    headers: ACTIONS_CORS_HEADERS,
  });
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

    const orgdetails = await OrgData.findOne({org:orgId});

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
          return Response.json(actionError, {
            status: 400,
            headers: ACTIONS_CORS_HEADERS,
          });
        }
      }

      const newBlink = new userBlink({
        userId,
        name,
        email,
        orgId,
        amount,
        duration:type,
        UserPubKey:userPubKey,
      });

      await newBlink.save();

      const transaction = await connection.getParsedTransaction(
        signature,
        "confirmed"
      );

      const blinkUrl = `https://subslink.vercel.app/pay/${orgId}`;
      const twitterShareUrl = `https://twitter.com/intent/tweet?text=Check%20out%20my%20new%20Blink%20link:%20${encodeURIComponent(
        blinkUrl
      )}`;

      // Generate the QR code URL for the Twitter share link
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        twitterShareUrl
      )}`;

      const payload: CompletedAction = {
        type: "completed",
        title: "Subscription buy completed",
        icon: 'https://subslink.vercel.app/logo.png',
        label: "Subscription Bought",
        description: `You bought  ${planType} of ${orgdetails.name}`,
      };

      return Response.json(payload, {
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
    return Response.json(actionError, {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};
