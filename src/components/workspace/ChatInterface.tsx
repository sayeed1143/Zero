import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AIMessage } from "@/types/ai";

interface ChatInterfaceProps {
  chatHistory: AIMessage[];
  isProcessing: boolean;
  isVisualizing: boolean;
  onSendMessage: (message: string) => void;
  onVisualize: () => void;
  canVisualize: boolean;
  showVisualize: boolean;
}

const ChatInterface = ({
  chatHistory,
  isProcessing,
  isVisualizing,
  onSendMessage,
  onVisualize,
  canVisualize,
  showVisualize,
}: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  return (
    <div className="chat-container overflow-hidden">
      <div className="flex flex-col h-full">
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
                        ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground"
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

                {showButton && (
                  <div className="flex justify-start">
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
