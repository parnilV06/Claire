import { useEffect, useMemo, useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CanvasPage() {
  const [content, setContent] = useState<string>(sampleText);
  const [summary, setSummary] = useState<string[]>([]);
  const [mindMap, setMindMap] = useState<MindMapNode[]>([]);

  const containerClasses = useMemo(
    () =>
      cn(
        "flex w-full flex-col md:flex-row",
        "h-[70vh]", // windowed height inside page layout
        "bg-white/80",
      ),
    [],
  );

  useEffect(() => {
    setSummary(generateSummary(content));
    setMindMap(createMindMap(content));
  }, [content]);

  return (
    <div className={cn("w-full")}> 
      <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 py-2">
        <p className="text-sm font-medium text-foreground/80">Calming Canvas</p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 px-3" type="button">
            <Upload className="mr-1 h-3.5 w-3.5" /> Import
          </Button>
          <Button size="sm" className="h-8 px-3" type="button" onClick={() => exportText(content)}>
            <Download className="mr-1 h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      <div className={containerClasses}>
        <section className="flex-1 p-4 md:p-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-full w-full resize-none rounded-2xl border border-border/70 bg-white/70 p-4 text-base text-foreground shadow-inner focus:outline-none focus:ring-2 focus:ring-primary"
            spellCheck={false}
          />
        </section>
        <aside className="w-full overflow-auto border-t border-border/60 bg-muted/30 p-4 md:h-full md:w-[360px] md:border-l md:border-t-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Tools</h3>
          </div>
          <article className="mt-4 rounded-2xl border border-border/70 bg-white/85 p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-foreground">AI summaries</h4>
            <ul className="mt-3 space-y-2">
              {summary.map((item) => (
                <li key={item} className="rounded-xl bg-muted/60 px-3 py-2 text-sm text-foreground/80">
                  {item}
                </li>
              ))}
              {summary.length === 0 ? (
                <li className="text-xs text-muted-foreground">Type on the left to see summaries.</li>
              ) : null}
            </ul>
          </article>
          <article className="mt-4 rounded-2xl border border-border/70 bg-white/85 p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-foreground">Mind map preview</h4>
            <div className="mt-3 space-y-3">
              {mindMap.map((node) => (
                <div key={node.topic} className="rounded-xl bg-muted/50 p-3">
                  <p className="text-sm font-semibold text-foreground">{node.topic}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {node.children.map((child) => (
                      <span key={child} className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {child}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {mindMap.length === 0 ? (
                <p className="text-xs text-muted-foreground">We will extract topics as you type.</p>
              ) : null}
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}

const sampleText = `Paste or type your passage here. Use full-screen for a calm, focused reading space.`;

type MindMapNode = {
  topic: string;
  children: string[];
};

function exportText(text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "canvas-notes.txt";
  link.click();
  URL.revokeObjectURL(url);
}

function generateSummary(text: string) {
  if (!text.trim()) return [];
  const sentences = text
    .replace(/\n+/g, " ")
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const insights = sentences.slice(0, 3);
  if (sentences.length > 3) insights.push("Encourage reflection based on the final idea.");
  return insights;
}

function createMindMap(text: string): MindMapNode[] {
  if (!text.trim()) return [];
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  const frequency = new Map<string, number>();
  for (const w of words) frequency.set(w, (frequency.get(w) ?? 0) + 1);
  const topics = Array.from(frequency.entries())
    .filter(([w]) => !stopWords.has(w))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([w]) => w);
  return topics.map((topic) => {
    const related = words
      .filter((w) => w !== topic && !stopWords.has(w))
      .filter((w, i, arr) => arr.indexOf(w) === i)
      .slice(0, 6);
    return { topic, children: related.length > 0 ? related : ["Add your own ideas"] };
  });
}

const stopWords = new Set([
  "with",
  "this",
  "that",
  "have",
  "from",
  "they",
  "them",
  "there",
  "their",
  "about",
  "into",
  "while",
  "where",
  "could",
  "would",
  "should",
  "along",
  "over",
  "these",
  "those",
]);


