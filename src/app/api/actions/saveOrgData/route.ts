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

const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

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
    const orgId = url.searchParams.get("orgId") ?? "";
    const name = url.searchParams.get("name") ?? "";
    const email = url.searchParams.get("email") ?? "";
    const month = url.searchParams.get("month") ?? "";
    const year = url.searchParams.get("year") ?? "";
    const orgPubKey = url.searchParams.get("orgPubKey") ?? "";
    const type = url.searchParams.get("type") ?? "";

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

      const newBlink = new OrgData({
        org: orgId,
        name,
        email,
        type,
        month,
        year,
        orgPubKey,
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
        title: "Subscription created Successfully",
        icon: qrCodeUrl,
        label: "Subscription Created",
        description: `Your Blink Url to share is
        https://subslink.vercel.app/pay/${orgId}
        Or just scan the qrcode to share`,
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
