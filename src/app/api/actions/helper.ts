import { NextActionLink } from "@solana/actions-spec";

// just a helper function to get the completed action at final stage [ last action in the chain ]
export const getCompletedAction = (orgid: string): NextActionLink => {
  return {
    type: "inline",
    action: {
      description: `Your Blink is create . Access it from /pay/${orgid}`,
      icon: `https://subslink.vercel.app/logo.png`,
      label: `Scan the QR to share on Twitter`,
      title: `Blink Created`,
      type: "completed",
    },
  };
};
export const saveOrgData = (
  name: string,
  email: string,
  month: number,
  year: number,
  orgKey: string
): NextActionLink => {
  try {
    return {
      type: "inline",
      action: {
        description: `Confirm the details and create you blink
         Name : ${name}
         Email : ${email}
         Monthly fees : ${month}
         Yearly Fees : ${year}
         Public Key to recieve fees : ${orgKey}
        `,

        icon: `https://subslink.vercel.app/logo.png`,
        label: `Confirm detail`,
        title: `Confirmation`,
        type: "action",
        links: {
          actions: [
            {
              label: `Confirm`, // button text
              href: `/api/action/create`, // api endpoint
            },
          ],
        },
      },
    };
  } catch (error) {
    console.error("Error saving organization data:", error);
    throw new Error("Failed to save organization data.");
  }
};
