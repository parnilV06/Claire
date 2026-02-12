import { ToolsShowcase } from "@/components/sections/ToolsShowcase";
import { useCallback, useState } from "react";

export default function ToolsPage() {
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const handleSaveToHistory = useCallback((content: string) => {
    try {
      const raw = localStorage.getItem("brightpath.history");
      const list = raw ? (JSON.parse(raw) as Array<any>) : [];
      const item = { id: crypto.randomUUID(), content, createdAt: Date.now() };
      localStorage.setItem("brightpath.history", JSON.stringify([item, ...list]));
      setSaveMessage("Saved to history.");
      setTimeout(() => setSaveMessage(null), 2200);
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
        {saveMessage ? (
          <div className="mt-2 text-xs text-emerald-600">{saveMessage}</div>
        ) : null}
      </div>
    </div>
  );
}


