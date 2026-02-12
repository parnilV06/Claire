import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSarvamGenerate, handleSarvamTTS } from "./routes/sarvam";
import { handleGroqChat } from "./routes/groqChat";
import { handleGroqTools } from "./routes/groqTools";
import { handleHFStatus } from "./routes/hf_status";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  // Proxy route for Sarvam API (server-side, keeps API key secret)
  app.post("/api/sarvam/generate", handleSarvamGenerate);
  app.post("/api/sarvam/tts", handleSarvamTTS);
  // Groq API route for therapy chat
  app.post('/api/groq/chat', handleGroqChat);
  // Groq API route for tools (summary + quiz)
  app.post("/api/groq/tools", handleGroqTools);
  app.get('/api/hf/status', handleHFStatus);

  return app;
}
