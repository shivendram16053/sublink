import { ACTIONS_CORS_HEADERS, ActionsJson } from "@solana/actions";

export const GET = async (req: Request) => {
  const payload: ActionsJson = {
    rules: [
      {
        pathPattern: "/pay",
        apiPath: "/api/actions/pay",
      },
      {
        pathPattern: "/create",
        apiPath: "/api/actions/create",
      },
    ],
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

export const OPTIONS = GET;