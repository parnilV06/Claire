import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type HistoryItem = {
  id: string;
  content: string;
  summary?: string;
  createdAt: number;
};

export type QuizHistoryItem = {
  id: string;
  questions: any[];
  score: number;
  totalQuestions: number;
  text: string;
  createdAt: number;
};
