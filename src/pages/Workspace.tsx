import { useCallback, useMemo, useState } from "react";
import ChatInterface from "@/components/workspace/ChatInterface";
import { AIService } from "@/services/ai";
import type { AIMessage } from "@/types/ai";
import { DEFAULT_FEATURE_MODELS } from "@/types/ai";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LearningPath, { type LearningNode } from "@/components/workspace/LearningPath";
import { cleanPlainText } from "@/lib/utils";

type UserRole = 'student' | 'college' | 'teacher' | 'tutor';

const ROLE_SYSTEM_PROMPTS: Record<UserRole, string> = {
  student: "You are a mindful AI guide for school students. Use clear, age-appropriate language, concrete examples, and gentle encouragement.",
  college: "You are an academic coach who explains with depth and references. Provide rigorous reasoning, cite relevant concepts, and suggest credible sources.",
  teacher: "You are a teaching assistant who creates learning materials, formative assessments, and differentiated scaffolding aligned to outcomes.",
  tutor: "You are a private tutor focused on concept mastery. Teach step-by-step with Socratic questions and targeted practice.",
};

const BASE_SYSTEM_PROMPT = "Operate in Mind Mode: respond with calm, lucid guidance.";

const INITIAL_ASSISTANT_MESSAGE: AIMessage = {
  role: "assistant",
  content: "Stillness invites understanding. How can I support your learning today?",
};

const Workspace = () => {
  const [chatHistory, setChatHistory] = useState<AIMessage[]>([INITIAL_ASSISTANT_MESSAGE]);
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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="px-4 py-3 border-b">
        <div className="mx-auto w-full max-w-5xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Shunya AI</span>
            <span className="text-sm text-muted-foreground hidden sm:inline">Mindful Learning Space</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Role</span>
            <div className="flex gap-1">
              <Button size="xs" variant={userRole === 'student' ? 'default' : 'outline'} onClick={() => setUserRole('student')} className={userRole === 'student' ? 'bg-foreground text-background hover:bg-foreground/90' : ''}>Student</Button>
              <Button size="xs" variant={userRole === 'college' ? 'default' : 'outline'} onClick={() => setUserRole('college')} className={userRole === 'college' ? 'bg-foreground text-background hover:bg-foreground/90' : ''}>College</Button>
              <Button size="xs" variant={userRole === 'teacher' ? 'default' : 'outline'} onClick={() => setUserRole('teacher')} className={userRole === 'teacher' ? 'bg-foreground text-background hover:bg-foreground/90' : ''}>Teacher</Button>
              <Button size="xs" variant={userRole === 'tutor' ? 'default' : 'outline'} onClick={() => setUserRole('tutor')} className={userRole === 'tutor' ? 'bg-foreground text-background hover:bg-foreground/90' : ''}>Tutor</Button>
            </div>
            <Button size="xs" variant="outline" onClick={openLearningPath} className="rounded-full ml-2">Path</Button>
            {savedPathItems.length > 0 && (
              <span className="text-xs text-muted-foreground">{savedPathItems.length}</span>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 min-h-0">
        <div className="mx-auto w-full max-w-5xl h-full px-4">
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
