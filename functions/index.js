const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");

// Set global options for all functions
setGlobalOptions({
  region: "europe-west1", // Scegli la regione più vicina
  memory: "1GB",
  timeoutSeconds: 60,
});

// Import the built Remix app
const { createRequestHandler } = require("@remix-run/node");
const { installGlobals } = require("@remix-run/node");

installGlobals();

// Create the request handler
const requestHandler = createRequestHandler({
  build: require("./build/server/index.js"),
  mode: process.env.NODE_ENV,
});

// Export the function
exports.app = onRequest(requestHandler);
