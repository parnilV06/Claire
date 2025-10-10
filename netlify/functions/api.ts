import serverless from "serverless-http";
import { createServer } from "../../server";

// Create Express app instance
const app = createServer();

// Wrap with serverless handler
const handler = serverless(app, {
  basePath: "/api"
});

export { handler };
