import { useCallback, useMemo, useState } from "react";
import Canvas from "@/components/workspace/Canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ChatInterface from "@/components/workspace/ChatInterface";
import type { AIMessage } from "@/types/ai";
import { DEFAULT_FEATURE_MODELS } from "@/types/ai";
import { AIService } from "@/services/ai";
import { toast } from "sonner";
import { extractPdfText } from "@/lib/pdfText";
import { cleanPlainText } from "@/lib/utils";
import { exportTextAsPNG, openPrintForText } from "@/lib/export";
import BrandMark from "@/components/BrandMark";
import { Link } from "react-router-dom";
import { BookOpenText, Brain, FilePlus2, Home, Link2, MessageCircle, Network, Sparkles, Trash2 } from "lucide-react";

type SourceType = 'pdf' | 'image' | 'video' | 'url' | 'note' | 'other';

interface SourceItem {
  id: string;
  type: SourceType;
  name: string;
  url?: string;
  text?: string;
  file?: File;
}

const MAX_CONTEXT_CHARS = 18000; // guardrails for prompt size

const CanvasMode = () => {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [aiItems, setAiItems] = useState<any[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [citationStyle, setCitationStyle] = useState<'APA' | 'MLA' | 'Harvard'>("APA");
  const [draftText, setDraftText] = useState<string>("");

  const [chatHistory, setChatHistory] = useState<AIMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVisualizing] = useState(false);

  const aggregatedContext = useMemo(() => {
    const lines: string[] = [];
    for (const s of sources) {
      if (s.text && s.text.trim()) {
        lines.push(`[${s.type.toUpperCase()}] ${s.name}${s.url ? ` (${s.url})` : ''}`);
        lines.push(s.text.trim());
      } else if (s.url) {
        lines.push(`[URL] ${s.name}: ${s.url}`);
      } else {
        lines.push(`[${s.type.toUpperCase()}] ${s.name}`);
      }
    }
    const joined = lines.join("\n\n");
    return joined.length > MAX_CONTEXT_CHARS ? joined.slice(0, MAX_CONTEXT_CHARS) : joined;
  }, [sources]);

  const addSourcesFromFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    const updates: SourceItem[] = [];
    for (const f of list) {
      const lower = f.name.toLowerCase();
      if (lower.endsWith('.pdf') || f.type.includes('pdf')) {
        try {
          const text = await extractPdfText(f);
          updates.push({ id: `src-${Date.now()}-${Math.random()}`, type: 'pdf', name: f.name, text, file: f });
        } catch (e: any) {
          console.error(e);
          updates.push({ id: `src-${Date.now()}-${Math.random()}`, type: 'pdf', name: f.name, text: '', file: f });
          toast.error(`Failed to extract text from ${f.name}`);
        }
      } else if (f.type.startsWith('image/')) {
        updates.push({ id: `src-${Date.now()}-${Math.random()}`, type: 'image', name: f.name, file: f });
      } else if (f.type.startsWith('video/')) {
        updates.push({ id: `src-${Date.now()}-${Math.random()}`, type: 'video', name: f.name, file: f });
      } else {
        updates.push({ id: `src-${Date.now()}-${Math.random()}`, type: 'other', name: f.name, file: f });
      }
    }
    if (updates.length) setSources(prev => [...prev, ...updates]);
  }, []);

  const handlePdfUpload = useCallback(async (file: File) => {
    try {
      const text = await extractPdfText(file);
      setSources(prev => [...prev, { id: `src-${Date.now()}`, type: 'pdf', name: file.name, text, file }]);
      toast.success(`${file.name} added`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to read PDF');
    }
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    setSources(prev => [...prev, { id: `src-${Date.now()}`, type: 'image', name: file.name, file }]);
    toast.success(`${file.name} added`);
  }, []);

  const addUrl = useCallback(() => {
    const url = urlInput.trim();
    if (!url) return;
    try {
      const u = new URL(url);
      setSources(prev => [...prev, { id: `src-${Date.now()}`, type: 'url', name: u.hostname, url }]);
      setUrlInput("");
      toast.success("URL added");
    } catch {
      toast.error("Enter a valid URL");
    }
  }, [urlInput]);

  const addNote = useCallback(() => {
    const text = noteInput.trim();
    if (!text) return;
    setSources(prev => [...prev, { id: `src-${Date.now()}`, type: 'note', name: `Notes ${new Date().toLocaleString()}`, text }]);
    setNoteInput("");
    toast.success("Notes added");
  }, [noteInput]);

  const removeSource = useCallback((id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  }, []);

  const generateMindMap = useCallback(async () => {
    if (!aggregatedContext) {
      toast.info("Add PDFs or notes first");
      return;
    }
    try {
      const nodes = await AIService.generateMindMap(aggregatedContext, DEFAULT_FEATURE_MODELS.mindmap);
      setAiItems(nodes);
      toast.success("Concept map generated");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to generate concept map");
    }
  }, [aggregatedContext]);

  const generateDraft = useCallback(async () => {
    if (!aggregatedContext) { toast.info("Add sources first"); return; }
    setDraftText("");
    try {
      const system = `You are an academic writing assistant. Draft a clear outline, thesis, and section plan using only the provided sources. Include properly formatted ${citationStyle} style references at the end. Keep it concise and structured with headings and bullet points. Avoid markdown symbols.`;
      const res = await AIService.chat([
        { role: 'system', content: system },
        { role: 'user', content: `Project sources and notes (use only this material):\n\n${aggregatedContext}` },
        { role: 'user', content: 'Produce: 1) Thesis statement 2) Outline with sections and bullet points 3) References in ' + citationStyle + ' style.' }
      ], DEFAULT_FEATURE_MODELS.chat);
      setDraftText(cleanPlainText(res.content?.trim() || ""));
      toast.success("Draft ready");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to generate draft');
    }
  }, [aggregatedContext, citationStyle]);

  const handleSendMessage = useCallback(async (raw: string) => {
    const content = raw.trim();
    if (!content || isProcessing) return;
    const userMsg: AIMessage = { role: 'user', content };
    setChatHistory(prev => [...prev, userMsg]);
    setIsProcessing(true);
    try {
      const system = `AI Tutor Mode. Answer only using the provided sources below. If the answer is not present, say you cannot find it in the sources. Be concise, cite the source name in parentheses.`;
      const contextMsg: AIMessage = { role: 'system', content: `Sources:\n\n${aggregatedContext}` };
      const response = await AIService.chat([
        { role: 'system', content: system },
        contextMsg,
        ...chatHistory,
        userMsg,
      ], DEFAULT_FEATURE_MODELS.chat);
      const assistant: AIMessage = { role: 'assistant', content: cleanPlainText(response.content?.trim() || "") };
      setChatHistory(prev => [...prev, assistant]);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Chat failed');
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'I could not find that in the provided sources.' }]);
    } finally {
      setIsProcessing(false);
    }
  }, [aggregatedContext, chatHistory, isProcessing]);

  const exportDraftPNG = useCallback(() => {
    if (!draftText) return; exportTextAsPNG(draftText, 'auto-draft.png');
  }, [draftText]);
  const printDraft = useCallback(() => {
    if (!draftText) return; openPrintForText(draftText, 'Assignment Draft');
  }, [draftText]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="px-4 py-3 border-b">
        <div className="mx-auto w-full max-w-7xl flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center">
            <BrandMark size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button size="sm" variant="ghost" className="mr-1">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <span className="text-xs text-muted-foreground">Canvas Mode</span>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        <div className="mx-auto w-full max-w-7xl h-full px-4 grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)_400px] gap-4 py-4">
          {/* Source Hub */}
          <aside className="border rounded-xl p-3 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <BookOpenText className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Source Hub</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input placeholder="Paste website URL" value={urlInput} onChange={e => setUrlInput(e.target.value)} />
                <Button size="sm" onClick={addUrl}><Link2 className="h-4 w-4" /></Button>
              </div>
              <div>
                <Textarea placeholder="Paste lecture notes or summaries" value={noteInput} onChange={e => setNoteInput(e.target.value)} />
                <div className="flex justify-end pt-2">
                  <Button size="sm" onClick={addNote}>Add Notes</Button>
                </div>
              </div>
              <div>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="file" multiple className="hidden" onChange={e => e.target.files && addSourcesFromFiles(e.target.files)} />
                  <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent/30">
                    <FilePlus2 className="h-4 w-4" /> Upload Files
                  </span>
                </label>
                <p className="mt-2 text-xs text-muted-foreground">Tip: You can also drag and drop files onto the canvas.</p>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">{sources.length} sources</span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={generateMindMap}>
                      <Network className="h-4 w-4 mr-1" /> Concept Map
                    </Button>
                  </div>
                </div>
                <ul className="space-y-2 max-h-[40vh] overflow-auto scrollbar-thin">
                  {sources.map(s => (
                    <li key={s.id} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{s.type.toUpperCase()} {s.url ? `• ${s.url}` : ''}</p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => removeSource(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4" />
                  <h3 className="text-sm font-semibold">Assignment Auto-Drafter</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={citationStyle} onValueChange={(v) => setCitationStyle(v as any)}>
                    <SelectTrigger className="w-[140px]"><SelectValue placeholder="Style" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APA">APA</SelectItem>
                      <SelectItem value="MLA">MLA</SelectItem>
                      <SelectItem value="Harvard">Harvard</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={generateDraft}><Sparkles className="h-4 w-4 mr-1" /> Draft</Button>
                </div>
                {draftText && (
                  <div className="mt-3 rounded-md border p-2 text-sm max-h-64 overflow-auto scrollbar-thin">
                    <pre className="whitespace-pre-wrap leading-6">{draftText}</pre>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={exportDraftPNG}>Export PNG</Button>
                      <Button size="sm" variant="outline" onClick={printDraft}>Print</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Canvas */}
          <section className="relative min-h-[60vh] rounded-xl border overflow-hidden">
            <div className="absolute z-10 left-3 top-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={generateMindMap}>
                <Network className="h-4 w-4 mr-1" /> Generate Concept Map
              </Button>
            </div>
            <Canvas
              items={aiItems}
              onPdfUpload={handlePdfUpload}
              onFileUpload={handleImageUpload}
            />
          </section>

          {/* AI Tutor Chat */}
          <aside className="rounded-xl border p-3 bg-card min-h-[40vh] flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4" />
              <h2 className="text-sm font-semibold">AI-Tutor Chat on Sources</h2>
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              Questions are answered only using your Source Hub materials.
            </div>
            <div className="flex-1 min-h-0">
              <ChatInterface
                chatHistory={chatHistory}
                isProcessing={isProcessing}
                isVisualizing={false}
                onSendMessage={handleSendMessage}
                onVisualize={() => {}}
                canVisualize={false}
                showVisualize={false}
              />
            </div>
            <div className="pt-2 text-[11px] text-muted-foreground flex items-center gap-2">
              <Brain className="h-3.5 w-3.5" />
              <span>Context length: {aggregatedContext.length.toLocaleString()} chars</span>
            </div>
          </aside>
        </div>
      </main>

      <footer className="px-4 py-3 border-t text-xs text-muted-foreground">
        <div className="mx-auto w-full max-w-7xl flex items-center justify-between">
          <span className="inline-flex items-center gap-2">
            <Network className="h-3.5 w-3.5" /> Visual Concept Map
            <Sparkles className="h-3.5 w-3.5" /> Auto-Drafter
            <MessageCircle className="h-3.5 w-3.5" /> Tutor Chat
          </span>
          <span className="inline-flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            <Link to="/workspace" className="underline">Back to Workspace</Link>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default CanvasMode;
