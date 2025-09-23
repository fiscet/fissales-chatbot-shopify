import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../lib/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    // Se non c'è shop, mostra una pagina per inserire l'URL dello shop
    throw new Response("Shop parameter is required. Please add ?shop=your-shop.myshopify.com to the URL", {
      status: 400,
      headers: { "Content-Type": "text/html" }
    });
  }

  try {
    const { redirect: authRedirect } = await authenticate.admin(request);
    return authRedirect;
  } catch (error) {
    // Se l'autenticazione fallisce, vai alla pagina principale
    return redirect("/");
  }
};
