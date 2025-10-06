import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Send, Sparkles, Volume2, Square, Download, FileText as FileTextIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AIMessage } from "@/types/ai";
import { toast } from "sonner";
import { AIService } from "@/services/ai";
import { exportTextAsPNG, openPrintForText, downloadJSON } from "@/lib/export";

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
    <div className="chat-container">
      <div className="flex flex-col h-full">
        {isProcessing && (
          <div className="px-6 pt-4">
            <div className="rounded-xl border border-border/60 bg-muted/40 px-4 py-2 text-sm text-muted-foreground flex items-center gap-2 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-foreground/60 mic-pulse" />
              Mindful mode: breathing before responding…
            </div>
          </div>
        )}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 pt-8 pb-36 space-y-6 scrollbar-thin">
          {chatHistory.map((entry, index) => {
            const isUser = entry.role === "user";
            const showButton = showVisualize && index === visualizationMessageIndex && !entry.visualization && !isUser;

            return (
              <div key={`message-${index}`} className="space-y-3 chat-message">
                <div
                  className={cn("flex", isUser ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-3xl px-5 py-4 text-sm leading-6 shadow-sm",
                      isUser
                        ? "bg-foreground text-background"
                        : "bg-muted/40 border border-border/60 text-foreground backdrop-blur",
                    )}
                  >
                    <p className="whitespace-pre-wrap">{entry.content}</p>
                    {entry.visualization && (
                      <div className="mt-5 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                          <Sparkles className="h-4 w-4" />
                          <span>{entry.visualization.diagram.title}</span>
                          {entry.visualization.diagram.relation && (
                            <span className="rounded-full border border-primary/40 px-2 py-0.5 text-xs font-medium text-primary/80">
                              {entry.visualization.diagram.relation}
                            </span>
                          )}
                        </div>
                        <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
                          {entry.visualization.diagram.steps.map((step, stepIndex) => (
                            <li key={`step-${stepIndex}`} className="flex gap-3">
                              <span className="font-semibold text-primary">{stepIndex + 1}.</span>
                              <div className="space-y-1">
                                <p className="font-medium text-foreground">{step.title}</p>
                                {step.detail && <p className="text-muted-foreground/90">{step.detail}</p>}
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>

                {!isUser && (
                  <div className="flex justify-start flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-2 rounded-full border border-border/50 bg-white text-foreground shadow-sm hover:bg-muted/50"
                      onClick={() => speakText(entry.content, index)}
                    >
                      {speakingIndex === index ? (
                        <Square className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                      {speakingIndex === index ? "Stop" : "Speak"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-2 rounded-full border border-border/50 bg-white text-foreground shadow-sm hover:bg-muted/50"
                      onClick={() => onSaveToPath && onSaveToPath(entry.content)}
                    >
                      <Download className="h-4 w-4" />
                      Save to Path
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-2 rounded-full border border-border/50 bg-white text-foreground shadow-sm hover:bg-muted/50"
                      onClick={() => exportTextAsPNG(entry.content, `chat-${index + 1}.png`)}
                    >
                      <Download className="h-4 w-4" />
                      PNG
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-2 rounded-full border border-border/50 bg-white text-foreground shadow-sm hover:bg-muted/50"
                      onClick={() => openPrintForText(entry.content, `Chat ${index + 1}`)}
                    >
                      <FileTextIcon className="h-4 w-4" />
                      PDF
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-2 rounded-full border border-border/50 bg-white text-foreground shadow-sm hover:bg-muted/50"
                      onClick={async () => {
                        try {
                          const quiz = await AIService.generateQuiz(entry.content, 5, "medium");
                          downloadJSON(quiz, `quiz-${index + 1}.json`);
                        } catch (e: any) {
                          toast.error(e?.message || "Failed to generate quiz");
                        }
                      }}
                    >
                      <Sparkles className="h-4 w-4" />
                      Quiz
                    </Button>

                    {showButton && (
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
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="chat-input">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full bg-white/90 backdrop-blur-xl border border-border/60 rounded-2xl px-4 py-3 shadow-2xl">
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
              placeholder="Share the next curiosity on your path..."
              className="resize-none border-none bg-transparent px-0 text-base leading-6 focus-visible:ring-0"
              rows={1}
              disabled={isProcessing}
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {isProcessing ? "Breathing with your question..." : "Press Enter to send"}
              </div>
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
    </div>
  );
};

export default ChatInterface;
