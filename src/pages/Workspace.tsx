import { useCallback, useMemo, useState } from "react";
import ChatInterface from "@/components/workspace/ChatInterface";
import { AIService } from "@/services/ai";
import type { AIMessage } from "@/types/ai";
import { DEFAULT_FEATURE_MODELS } from "@/types/ai";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
          content: response.content?.trim() || "I am here, breathing with your question.",
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
        content: visualization.explanation,
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7f7f7] via-[#ffffff] to-[#ededed] text-foreground">
      <header className="px-6 pt-10 pb-6 flex flex-col items-center text-center gap-2">
        <span className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
          Shunya AI
        </span>
        <h1 className="text-3xl font-semibold text-foreground">The Mindful Learning Space</h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Ask freely, breathe deeply, and let insight unfold at your own rhythm.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <label htmlFor="userRole" className="text-xs text-muted-foreground">Role</label>
          <select
            id="userRole"
            className="role-selector rounded-xl border border-border/50 bg-background px-3 py-2 text-sm shadow-sm"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as UserRole)}
          >
            <option value="student">School Student</option>
            <option value="college">College Student</option>
            <option value="teacher">Teacher</option>
            <option value="tutor">Private Tutor</option>
          </select>
        </div>
      </header>
      <main className="flex flex-1 justify-center px-4 pb-24">
        <ChatInterface
          chatHistory={chatHistory}
          isProcessing={isProcessing}
          isVisualizing={isVisualizing}
          onSendMessage={handleSendMessage}
          onVisualize={handleVisualize}
          canVisualize={canVisualize}
          showVisualize={shouldShowVisualize}
        />
      </main>
    </div>
  );
};

export default Workspace;
