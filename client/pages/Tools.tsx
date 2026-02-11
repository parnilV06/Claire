import { ToolsShowcase } from "@/components/sections/ToolsShowcase";
import { useCallback } from "react";

export default function ToolsPage() {
  const handleSaveToHistory = useCallback((content: string) => {
    try {
      const raw = localStorage.getItem("claire.history");
      const list = raw ? (JSON.parse(raw) as Array<any>) : [];
      const item = { id: crypto.randomUUID(), content, createdAt: Date.now() };
      localStorage.setItem("claire.history", JSON.stringify([item, ...list]));
    } catch {}
  }, []);
  return (
    <div className="space-y-24">
      <ToolsShowcase />
      <div className="text-right">
        <button
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow"
          onClick={() => {
            const area = document.querySelector("textarea");
            const content = area ? (area as HTMLTextAreaElement).value : "";
            handleSaveToHistory(content);
          }}
        >
          Save to history
        </button>
      </div>
    </div>
  );
}


