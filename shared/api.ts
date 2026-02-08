/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Response type for /api/groq/chat (Groq AI therapy chat)
 */
export interface GroqChatResponse {
  success: boolean;
  content?: string;
  isCrisis?: boolean;
  model?: string;
  error?: string;
  details?: string;
}
