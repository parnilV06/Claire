import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSarvamGenerate, handleSarvamTTS } from "./routes/sarvam";

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

  return app;
}
