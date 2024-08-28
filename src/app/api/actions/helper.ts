import { NextActionLink } from "@solana/actions-spec";

// just a helper function to get the completed action at final stage [ last action in the chain ]
export const getCompletedAction = (orgid: string): NextActionLink => {
  
  const blinkUrl = `https://subslink.vercel.app/pay/${orgid}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=Check%20out%20my%20new%20Blink%20link:%20${encodeURIComponent(blinkUrl)}`;

  // Generate the QR code URL for the Twitter share link
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(twitterShareUrl)}`;

  return {
    type: "inline",
    action: {
      description: `Your Blink is created. Access it from ${blinkUrl}`,
      icon: qrCodeUrl, 
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
              href: `/api/actions/create?stage=${month}&name=${name}&email=${email}&month=${month}&year=${year}`, // api endpoint
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
export const getUserAction = (name:string,email:string,plan:string,orgname:string): NextActionLink => {
  return {
    type: "inline",
    action: {
      description: `Thank ${name}(${email}) for subscribing to ${orgname}'s ${plan}`,
      icon: "https://subslink.vercel.app/logo.png", 
      label: `Thank You`,
      title: `Subscription Buy Completed`,
      type: "completed",
    },
  };
};

export const saveUserData = (
  name: string,
  email: string,
  type: string,
  userKey: string,
  amount:number,
  orgId:string,
): NextActionLink => {
  try {
    return {
      type: "inline",
      action: {
        description: `Confirm the details and Pay the remaining fees
         Name : ${name}
         Email : ${email}
         Subscription Type : ${type}
         Wallet address : ${userKey}
        `,

        icon: `https://subslink.vercel.app/logo.png`,
        label: `Confirm detail`,
        title: `Confirmation`,
        type: "action",
        links: {
          actions: [
            {
              label: `Confirm`, // button text
              href: `/api/actions/pay/${orgId}?stage=${name}&name=${name}&email=${email}&amount=${amount}`, // api endpoint
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
