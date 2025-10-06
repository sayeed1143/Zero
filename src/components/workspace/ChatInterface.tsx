import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AIMessage } from "@/types/ai";
import { toast } from "sonner";
import VisualizationBlock from "./VisualizationBlock";

interface ChatInterfaceProps {
  chatHistory: AIMessage[];
  isProcessing: boolean;
  isVisualizing: boolean;
  onSendMessage: (message: string) => void;
  onVisualize: () => void;
  canVisualize: boolean;
  showVisualize: boolean;
  onSaveToPath?: (content: string) => void;
}

const ChatInterface = ({
  chatHistory,
  isProcessing,
  isVisualizing,
  onSendMessage,
  onVisualize,
  canVisualize,
  showVisualize,
  onSaveToPath,
}: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  const submitMessage = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || isProcessing) return;
    onSendMessage(trimmed);
    setMessage("");
  }, [isProcessing, message, onSendMessage]);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: "smooth" });
  }, [chatHistory.length]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
  }, [message]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitMessage();
  };

  const visualizationMessageIndex = useMemo(() => {
    if (!showVisualize || chatHistory.length === 0) return -1;
    return chatHistory.length - 1;
  }, [chatHistory.length, showVisualize]);

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeakingIndex(null);
  }, []);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  const getPreferredVoice = (voices: SpeechSynthesisVoice[]) => {
    const candidates = voices.filter(v => /en|US|UK/i.test(v.lang));
    const softPreferred = candidates.find(v => /female|soft|zira|samantha|google uk english female/i.test(v.name));
    return softPreferred || candidates[0] || voices[0] || null;
  };

  const speakText = useCallback((text: string, index: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.info("Voice not supported in this browser");
      return;
    }
    const synth = window.speechSynthesis;

    if (speakingIndex !== null) {
      synth.cancel();
      if (speakingIndex === index) {
        setSpeakingIndex(null);
        return;
      }
    }

    const ensureVoices = () => {
      const voices = synth.getVoices();
      if (!voices || voices.length === 0) {
        // Some browsers load voices asynchronously
        setTimeout(() => ensureVoices(), 200);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getPreferredVoice(voices);
      if (voice) utterance.voice = voice;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      utterance.onend = () => setSpeakingIndex(null);
      utterance.onerror = () => setSpeakingIndex(null);
      setSpeakingIndex(index);
      synth.speak(utterance);
    };

    ensureVoices();
  }, [speakingIndex]);

  return (
    <div className="w-full h-full flex flex-col">
      {isProcessing && (
        <div className="px-4 pt-3">
          <div className="rounded-xl border border-border/60 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-2 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-foreground/60 mic-pulse" />
            Mindful mode: breathing before responding…
          </div>
        </div>
      )}

      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-0 space-y-4 scrollbar-thin scroll-smooth">
        {chatHistory.map((entry, index) => {
          const isUser = entry.role === "user";
          const showButton = showVisualize && index === visualizationMessageIndex && !entry.visualization && !isUser;

          return (
            <div key={`message-${index}`} className="space-y-2">
              <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[92%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6",
                    isUser ? "bg-foreground text-background" : "bg-muted/30 border border-border/60 text-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap">{entry.content}</p>
                  {entry.visualization && (
                    <VisualizationBlock diagram={entry.visualization.diagram} />
                  )}
                </div>
              </div>

              {!isUser && showButton && (
                <div className="pl-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2 rounded-full border border-primary/30 bg-primary/5 text-primary shadow-sm hover:bg-primary/10"
                    onClick={onVisualize}
                    disabled={!canVisualize}
                  >
                    {isVisualizing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {isVisualizing ? "Visualizing..." : "Visualize This"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-5xl px-4 py-3">
          <div className="flex items-end gap-2 rounded-xl border px-3 py-2 bg-card">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={event => setMessage(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitMessage();
                }
              }}
              placeholder="How can I support your learning today?"
              className="resize-none border-none bg-transparent px-0 text-base leading-6 focus-visible:ring-0"
              rows={1}
              disabled={isProcessing}
            />
            <Button
              type="submit"
              disabled={isProcessing || !message.trim()}
              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
