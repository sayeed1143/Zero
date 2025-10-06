import { useCallback, useMemo, useState } from "react";
import ChatInterface from "@/components/workspace/ChatInterface";
import { AIService } from "@/services/ai";
import type { AIMessage } from "@/types/ai";
import { DEFAULT_FEATURE_MODELS } from "@/types/ai";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LearningPath, { type LearningNode } from "@/components/workspace/LearningPath";
import { cleanPlainText } from "@/lib/utils";
import { Volume2, Download, FileText as FileTextIcon, Sparkles, Home } from "lucide-react";
import { exportTextAsPNG, openPrintForText, downloadJSON } from "@/lib/export";
import BrandMark from "@/components/BrandMark";
import { Link } from "react-router-dom";

type UserRole = 'student' | 'college' | 'teacher' | 'tutor';

const ROLE_SYSTEM_PROMPTS: Record<UserRole, string> = {
  student: "You are a mindful AI guide for school students. Use clear, age-appropriate language, concrete examples, and gentle encouragement.",
  college: "You are an academic coach who explains with depth and references. Provide rigorous reasoning, cite relevant concepts, and suggest credible sources.",
  teacher: "You are a teaching assistant who creates learning materials, formative assessments, and differentiated scaffolding aligned to outcomes.",
  tutor: "You are a private tutor focused on concept mastery. Teach step-by-step with Socratic questions and targeted practice.",
};

const BASE_SYSTEM_PROMPT = "Operate in Mind Mode: respond with calm, lucid guidance.";


const Workspace = () => {
  const [chatHistory, setChatHistory] = useState<AIMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [savedPathItems, setSavedPathItems] = useState<string[]>([]);
  const [showLearningPath, setShowLearningPath] = useState(false);
  const [learningNodes, setLearningNodes] = useState<LearningNode[]>([]);
  const [learningSummary, setLearningSummary] = useState<string | null>(null);

  const latestAssistantMessage = useMemo(() => {
    if (!chatHistory.length) return null;
    const last = chatHistory[chatHistory.length - 1];
    return last.role === "assistant" ? last : null;
  }, [chatHistory]);

  const handleSendMessage = useCallback(
    async (rawMessage: string) => {
      const content = rawMessage.trim();
      if (!content || isProcessing || isVisualizing) {
        return;
      }

      const userMessage: AIMessage = { role: "user", content };
      const optimisticHistory = [...chatHistory, userMessage];
      setChatHistory(optimisticHistory);
      setIsProcessing(true);

      try {
        const response = await AIService.chat(
          [
            { role: "system", content: `${BASE_SYSTEM_PROMPT}\n${ROLE_SYSTEM_PROMPTS[userRole]}` },
            ...optimisticHistory,
          ],
          DEFAULT_FEATURE_MODELS.chat,
        );
        const assistantReply: AIMessage = {
          role: "assistant",
          content: cleanPlainText(response.content?.trim() || "I am here, breathing with your question."),
        };
        setChatHistory(prev => [...prev, assistantReply]);
      } catch (error: any) {
        console.error("Chat error:", error);
        toast.error(error?.message || "Failed to reach Shunya AI. Please try again.");
        setChatHistory(prev => [
          ...prev,
          {
            role: "assistant",
            content: "I could not reach our insight just now. Let's breathe and try again shortly.",
          },
        ]);
      } finally {
        setIsProcessing(false);
      }
    },
    [chatHistory, isProcessing, isVisualizing, userRole],
  );

  const handleVisualize = useCallback(async () => {
    if (!latestAssistantMessage || latestAssistantMessage.visualization || isProcessing || isVisualizing) {
      return;
    }

    setIsVisualizing(true);
    try {
      const visualization = await AIService.visualize(latestAssistantMessage.content, DEFAULT_FEATURE_MODELS.explanations);
      const visualizationMessage: AIMessage = {
        role: "assistant",
        content: cleanPlainText(visualization.explanation),
        visualization,
      };
      setChatHistory(prev => [...prev, visualizationMessage]);
    } catch (error: any) {
      console.error("Visualization error:", error);
      toast.error(error?.message || "Visualization failed. Please try again.");
    } finally {
      setIsVisualizing(false);
    }
  }, [latestAssistantMessage, isProcessing, isVisualizing]);

  const shouldShowVisualize = Boolean(latestAssistantMessage && !latestAssistantMessage.visualization);
  const canVisualize = shouldShowVisualize && !isProcessing && !isVisualizing;

  const addToLearningPath = useCallback((content: string) => {
    setSavedPathItems(prev => [...prev, content]);
    toast.success("Saved to Learning Path");
  }, []);

  const openLearningPath = useCallback(async () => {
    if (savedPathItems.length === 0) {
      toast.info("Save some answers first");
      return;
    }
    try {
      const seed = savedPathItems.join("\n\n");
      const nodesRaw = await AIService.generateMindMap(seed);
      const nodes: LearningNode[] = (nodesRaw || []).map((n: any, i: number) => ({
        id: String(n.id ?? i + 1),
        label: String(n.label ?? `Concept ${i + 1}`),
        prereqs: Array.isArray(n.prereqs) ? n.prereqs.map((p: any) => String(p)) : [],
        mastery: typeof n.mastery === 'number' ? Math.max(0, Math.min(1, n.mastery)) : 0.5,
      }));
      setLearningNodes(nodes);
      setShowLearningPath(true);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to build learning path");
    }
  }, [savedPathItems]);

  const generateStudySummary = useCallback(async () => {
    try {
      const seed = savedPathItems.map((s, i) => `(${i + 1}) ${s}`).join("\n\n");
      const system = "Create a concise study path with milestones, prerequisites, and practice tasks from the provided notes. Use clear numbered steps and short bullet points.";
      const res = await AIService.chat([
        { role: "system", content: system },
        { role: "user", content: seed },
      ]);
      setLearningSummary(cleanPlainText(res.content?.trim() || ""));
      toast.success("Study path summary generated");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to summarize");
    }
  }, [savedPathItems]);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakLatest = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.info('Voice not supported in this browser');
      return;
    }
    if (!latestAssistantMessage) {
      toast.info('No assistant answer to speak');
      return;
    }
    const text = latestAssistantMessage.content;
    const synth = window.speechSynthesis;
    if (synth.speaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }
    const ensureVoices = () => {
      const voices = synth.getVoices();
      const candidates = voices.filter(v => /en|US|UK/i.test(v.lang));
      const softPreferred = candidates.find(v => /female|soft|zira|samantha|google uk english female/i.test(v.name));
      const voice = softPreferred || candidates[0] || voices[0] || null;
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.rate = 0.95;
      u.pitch = 1.0;
      u.volume = 0.95;
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      synth.speak(u);
    };
    ensureVoices();
  }, [latestAssistantMessage]);

  const exportLatestPNG = useCallback(() => {
    if (!latestAssistantMessage) { toast.info('No assistant answer to export'); return; }
    exportTextAsPNG(latestAssistantMessage.content, `chat-latest.png`);
  }, [latestAssistantMessage]);

  const printLatest = useCallback(() => {
    if (!latestAssistantMessage) { toast.info('No assistant answer to print'); return; }
    openPrintForText(latestAssistantMessage.content, 'Latest Chat');
  }, [latestAssistantMessage]);

  const quizLatest = useCallback(async () => {
    if (!latestAssistantMessage) { toast.info('No assistant answer to quiz'); return; }
    try {
      const quiz = await AIService.generateQuiz(latestAssistantMessage.content, 5, 'medium');
      downloadJSON(quiz, `quiz-latest.json`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to generate quiz');
    }
  }, [latestAssistantMessage]);

  const saveLatest = useCallback(() => {
    if (!latestAssistantMessage) { toast.info('No assistant answer to save'); return; }
    addToLearningPath(latestAssistantMessage.content);
  }, [latestAssistantMessage, addToLearningPath]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="px-4 py-3 border-b">
        <div className="mx-auto w-full max-w-5xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center">
              <BrandMark size="sm" />
            </Link>
            <span className="text-sm text-muted-foreground hidden sm:inline">Mindful Learning Space</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button size="sm" variant="ghost" className="mr-1">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <span className="text-xs text-muted-foreground">Role</span>
            <div className="flex gap-1">
              <Button size="sm" variant={userRole === 'student' ? 'default' : 'outline'} onClick={() => setUserRole('student')} className={userRole === 'student' ? 'bg-foreground text-background hover:bg-foreground/90' : ''}>Student</Button>
              <Button size="sm" variant={userRole === 'college' ? 'default' : 'outline'} onClick={() => setUserRole('college')} className={userRole === 'college' ? 'bg-foreground text-background hover:bg-foreground/90' : ''}>College</Button>
              <Button size="sm" variant={userRole === 'teacher' ? 'default' : 'outline'} onClick={() => setUserRole('teacher')} className={userRole === 'teacher' ? 'bg-foreground text-background hover:bg-foreground/90' : ''}>Teacher</Button>
              <Button size="sm" variant={userRole === 'tutor' ? 'default' : 'outline'} onClick={() => setUserRole('tutor')} className={userRole === 'tutor' ? 'bg-foreground text-background hover:bg-foreground/90' : ''}>Tutor</Button>
            </div>
            <Button size="sm" variant="outline" onClick={openLearningPath} className="rounded-full ml-2">Path</Button>
            {savedPathItems.length > 0 && (
              <span className="text-xs text-muted-foreground">{savedPathItems.length}</span>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 min-h-0">
        <div className="mx-auto w-full max-w-5xl h-full px-4 flex">
          <aside className="w-44 pr-4">
            <div className="flex flex-col gap-2 sticky top-6">
              <Button size="sm" variant="ghost" className="justify-start" onClick={speakLatest} disabled={!latestAssistantMessage || isSpeaking || isProcessing}>
                <Volume2 className="mr-2 h-4 w-4" /> Speak
              </Button>
              <Button size="sm" variant="ghost" className="justify-start" onClick={saveLatest} disabled={!latestAssistantMessage}>
                <Download className="mr-2 h-4 w-4" /> Save
              </Button>
              <Button size="sm" variant="ghost" className="justify-start" onClick={exportLatestPNG} disabled={!latestAssistantMessage}>
                <Download className="mr-2 h-4 w-4" /> PNG
              </Button>
              <Button size="sm" variant="ghost" className="justify-start" onClick={printLatest} disabled={!latestAssistantMessage}>
                <FileTextIcon className="mr-2 h-4 w-4" /> Print
              </Button>
              <Button size="sm" variant="ghost" className="justify-start" onClick={quizLatest} disabled={!latestAssistantMessage || isProcessing}>
                <Sparkles className="mr-2 h-4 w-4" /> Quiz
              </Button>
              <Button size="sm" variant="ghost" className="justify-start" onClick={handleVisualize} disabled={!canVisualize || isProcessing || isVisualizing}>
                <Sparkles className="mr-2 h-4 w-4" /> Visualize
              </Button>
            </div>
          </aside>

          <div className="flex-1 h-full">
            <ChatInterface
              chatHistory={chatHistory}
              isProcessing={isProcessing}
              isVisualizing={isVisualizing}
              onSendMessage={handleSendMessage}
              onVisualize={handleVisualize}
              canVisualize={canVisualize}
              showVisualize={shouldShowVisualize}
              onSaveToPath={addToLearningPath}
            />
          </div>
        </div>
      </main>

      {showLearningPath && (
        <LearningPath
          nodes={learningNodes}
          onSelect={() => {}}
          onClose={() => setShowLearningPath(false)}
          summary={learningSummary}
          onGenerateSummary={generateStudySummary}
        />
      )}
    </div>
  );
};

export default Workspace;
