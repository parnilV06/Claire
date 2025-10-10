import { Handler } from '@netlify/functions';
import { createServer } from "../../server";
import express from 'express';
import serverless from "serverless-http";

// Create Express app with JSON body parsing
const app = createServer();

// Ensure proper body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add CORS headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }
  next();
});

// Wrap the Express app with additional body parsing safety
const handler: Handler = async (event, context) => {
  // Handle raw body parsing for Netlify functions
  if (event.body && !event.isBase64Encoded) {
    try {
      event.body = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: e instanceof Error ? e.message : String(e)
        })
      };
    }
  }

  // Use serverless-http but with our wrapped Express app
  const serverlessHandler = serverless(app);
  return serverlessHandler(event, context);
};

export { handler };
