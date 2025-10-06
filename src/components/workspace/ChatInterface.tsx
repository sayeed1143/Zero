import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Mic, Sparkles, FileText, Image, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AIMessage } from "@/types/ai";

interface ChatInterfaceProps {
  onSendMessage: (message: string, command?: string) => void;
  chatHistory: AIMessage[];
  isProcessing: boolean;
}

const ChatInterface = ({ onSendMessage, chatHistory, isProcessing }: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickCommands = [
    { icon: <Sparkles className="w-3 h-3" />, label: "Summarize", command: "explain", prompt: "Summarize this content in simple terms" },
    { icon: <FileText className="w-3 h-3" />, label: "Explain", command: "explain", prompt: "Explain this in detail" },
    { icon: <Image className="w-3 h-3" />, label: "Mind Map", command: "mindmap", prompt: "Create a mind map of the key concepts" },
    { icon: <BarChart3 className="w-3 h-3" />, label: "Quiz", command: "quiz", prompt: "Generate a quiz to test my knowledge" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSend = (command?: string) => {
    if (message.trim() && !isProcessing) {
      onSendMessage(message, command);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickCommand = (command: string, prompt: string) => {
    if (!isProcessing) {
      setMessage(prompt);
      setTimeout(() => {
        onSendMessage(prompt, command);
        setMessage("");
      }, 100);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 animate-slide-up">
      {chatHistory.length > 0 && (
        <div className="mx-6 mb-4 rounded-3xl bg-background/95 backdrop-blur-xl border-2 border-border/40 shadow-2xl p-6 max-h-[500px] overflow-y-auto scrollbar-thin">
          <div className="space-y-4">
            {chatHistory.map((msg, index) => (
              <div
                key={`msg-${index}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-6 py-4 shadow-lg border ${
                    msg.role === 'user'
                      ? 'bg-foreground text-background border-foreground/20'
                      : 'bg-muted/80 text-foreground border-border/40'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start animate-fade-in">
                <div className="rounded-2xl px-6 py-4 bg-muted/60 border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-foreground animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-foreground animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-foreground animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                    <span className="text-sm text-foreground/80 font-medium">AI is analyzing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      <div className="mx-6 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {quickCommands.map((cmd, index) => (
            <button
              key={index}
              onClick={() => handleQuickCommand(cmd.command, cmd.prompt)}
              disabled={isProcessing}
              className="bg-background hover:bg-foreground hover:text-background border-2 border-border/40 hover:border-foreground px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 touch-target focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cmd.icon}
              <span>{cmd.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-6 mb-6 rounded-3xl bg-background/95 backdrop-blur-xl border-2 border-border/40 shadow-2xl p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 touch-target rounded-full hover:bg-foreground hover:text-background border border-border/30 focus-ring transition-all"
            title="Attach File"
            disabled={isProcessing}
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask SHUNYA AI anything..."
              disabled={isProcessing}
              className="pr-12 h-14 rounded-2xl bg-muted/50 border-2 border-border/40 focus-visible:border-foreground focus-visible:ring-4 focus-visible:ring-foreground/10 transition-all text-base font-medium placeholder:text-muted-foreground/60"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded-lg bg-muted border border-border/40 px-2 font-mono text-xs font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </div>

          <Button
            onClick={toggleRecording}
            size="icon"
            disabled={isProcessing}
            className={`shrink-0 touch-target rounded-full transition-all focus-ring border-2 ${
              isRecording 
                ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive mic-pulse' 
                : 'bg-muted hover:bg-foreground hover:text-background border-border/40'
            }`}
            title={isRecording ? "Stop Recording" : "Start Voice Input"}
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'pulse-animation' : ''}`} />
          </Button>
          
          <Button
            onClick={() => handleSend()}
            disabled={!message.trim() || isProcessing}
            size="icon"
            className="shrink-0 touch-target rounded-full bg-foreground hover:bg-foreground/90 text-background border-2 border-foreground shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all focus-ring disabled:opacity-40 disabled:cursor-not-allowed"
            title="Send Message"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs font-medium text-muted-foreground px-2">
          <div className="flex items-center gap-3">
            {isRecording && (
              <span className="flex items-center gap-2 text-destructive font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse"></span>
                Recording...
              </span>
            )}
            {isProcessing && (
              <span className="flex items-center gap-2 text-foreground font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-foreground animate-pulse"></span>
                Processing...
              </span>
            )}
          </div>
          <span className="text-muted-foreground/80">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/40 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/40 font-mono text-[10px]">Shift+Enter</kbd> for new line
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
