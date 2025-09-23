import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../lib/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { redirect: authRedirect } = await authenticate.admin(request);
  return authRedirect;
};