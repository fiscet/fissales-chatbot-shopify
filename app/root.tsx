import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import { PolarisProvider } from "./lib/polaris-provider";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: polarisStyles },
];

export default function App() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <PolarisProvider>
          <Outlet />
        </PolarisProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
