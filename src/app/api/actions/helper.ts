import { NextActionLink } from "@solana/actions-spec";

// just a helper function to get the completed action at final stage [ last action in the chain ]
export const getCompletedAction = (orgid:string): NextActionLink => {
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