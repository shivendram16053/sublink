import { NextActionLink } from "@solana/actions-spec";

// just a helper function to get the completed action at final stage [ last action in the chain ]
export const getCompletedAction = (orgid:string): NextActionLink => {
  return {
    type: "inline",
    action: {
      description: `Your Blink is create . Access it from /pay/${orgid}`,
      icon: `new URL("/logo.png", new URL(req.url).origin).toString()`,
      label: `Scan the QR to share on Twitter`,
      title: `Blink Created`,
      type: "completed",
    },
  };
};

export const getNextAction = (stage: string): NextActionLink => {
  return {
    type: "inline",
    action: {
      description: `Action ${stage}`,
      icon: `https://action-chaining-example.vercel.app/${stage}.webp`,
      label: `Action ${stage} Label`,
      title: `Action ${stage}`,
      type: "action",
      links: {
        actions: [
          {
            label: `Submit ${stage}`, // button text
            href: `/api/action?amount={amount}&stage=${stage}`, // api endpoint
            parameters: [
              {
                name: "amount", // field name
                label: "Enter a custom SOL amount", // text input placeholder
              },
            ],
          },
        ],
      },
    },
  };
};