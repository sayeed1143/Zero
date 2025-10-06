import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Mic, Sparkles, FileText, Image, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AIMessage } from "@/types/ai";

interface ChatInterfaceProps {
  onSendMessage: (message: string, command?: string) => void;
  chatHistory: AIMessage[];
  isProcessing: boolean;
  lastAddedNodeIds?: string[];
  onViewCanvas?: () => void;
}

const ChatInterface = ({ onSendMessage, chatHistory, isProcessing, lastAddedNodeIds = [], onViewCanvas }: ChatInterfaceProps) => {
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
    <div className="h-full w-full flex flex-col bg-[#F4F4F4]">
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 flex-wrap">
          {quickCommands.map((cmd, index) => (
            <button
              key={index}
              onClick={() => handleQuickCommand(cmd.command, cmd.prompt)}
              disabled={isProcessing}
              className="bg-primary text-primary-foreground border border-black/10 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all hover:opacity-90 touch-target focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cmd.icon}
              <span>{cmd.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto px-4">
        <div className="space-y-3 pb-4">
          {chatHistory.map((msg, index) => (
            <div
              key={`msg-${index}`}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm text-sm leading-relaxed whitespace-pre-wrap font-medium ${
                  msg.role === 'user'
                    ? 'bg-[#EDEDED] text-black border border-black/10'
                    : 'bg-white text-black border border-accent/30'
                } ${msg.role !== 'user' ? 'border-l-4 border-l-accent' : ''}`}
              >
                <div>{msg.content}</div>

                {/* Show 'View on Canvas' when assistant message and new nodes were added recently */}
                {msg.role === 'assistant' && index === chatHistory.length - 1 && lastAddedNodeIds && lastAddedNodeIds.length > 0 && (
                  <div className="mt-3 flex items-center justify-end">
                    <Button size="sm" variant="glow" className="px-3 py-1" onClick={() => onViewCanvas && onViewCanvas()}>
                      View on Canvas
                    </Button>
                  </div>
                )}

              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-5 py-3 bg-white border border-accent/30 text-black">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                  <span className="text-sm text-black/80 font-medium">AI is analyzing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-[#E0E0E0] bg-[#F4F4F4] p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 touch-target rounded-full hover:bg-black/10 border border-black/10 focus-ring transition-all"
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
              className="pr-12 h-12 rounded-2xl bg-white border border-black/15 focus-visible:border-black focus-visible:ring-4 focus-visible:ring-accent/20 transition-all text-base font-medium placeholder:text-black/40"
            />
          </div>

          <Button
            onClick={toggleRecording}
            size="icon"
            disabled={isProcessing}
            className={`shrink-0 touch-target rounded-full transition-all focus-ring border ${
              isRecording 
                ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive'
                : 'bg-white hover:bg-black/5 text-black border-black/10'
            }`}
            title={isRecording ? "Stop Recording" : "Start Voice Input"}
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
          </Button>
          
          <Button
            onClick={() => handleSend()}
            disabled={!message.trim() || isProcessing}
            size="icon"
            className="shrink-0 touch-target rounded-full bg-primary hover:bg-primary/90 text-primary-foreground border border-black/10 shadow-sm transition-all focus-ring disabled:opacity-40 disabled:cursor-not-allowed"
            title="Send Message"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
