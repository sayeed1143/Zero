import { useState } from "react";
import { Send, Paperclip, Mic, Sparkles, FileText, Image, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
}

const ChatInterface = ({ onSendMessage }: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const quickCommands = [
    { icon: <Sparkles className="w-3 h-3" />, label: "Summarize", command: "Summarize this content" },
    { icon: <FileText className="w-3 h-3" />, label: "Explain", command: "Explain this in simple terms" },
    { icon: <Image className="w-3 h-3" />, label: "Visualize", command: "Create a mind map" },
    { icon: <BarChart3 className="w-3 h-3" />, label: "Quiz", command: "Generate a quiz" },
  ];

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickCommand = (command: string) => {
    setMessage(command);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 animate-slide-up">
      {/* Chat Messages Area - Translucent glassmorphism */}
      {messages.length > 0 && (
        <div className="glass-panel mx-6 mb-4 rounded-3xl p-6 max-h-96 overflow-y-auto scrollbar-thin">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg'
                      : 'glass-card'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Command Pills */}
      <div className="mx-6 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {quickCommands.map((cmd, index) => (
            <button
              key={index}
              onClick={() => handleQuickCommand(cmd.command)}
              className="glass-panel px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 glow-hover touch-target focus-ring"
            >
              {cmd.icon}
              <span>{cmd.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Panel - Glassmorphism */}
      <div className="glass-panel mx-6 mb-6 rounded-3xl p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 touch-target rounded-full hover:bg-primary/10 focus-ring"
            title="Attach File"
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask EduVoice AI anything..."
              className="pr-12 h-12 rounded-2xl glass-card border-2 border-transparent focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/20 transition-all text-base"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded-lg glass-panel px-2 font-mono text-xs font-medium opacity-60">
              ⌘K
            </kbd>
          </div>

          <Button
            onClick={toggleRecording}
            size="icon"
            className={`shrink-0 touch-target rounded-full transition-all focus-ring ${
              isRecording 
                ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground mic-pulse' 
                : 'bg-accent/10 hover:bg-accent/20 text-accent'
            }`}
            title={isRecording ? "Stop Recording" : "Start Voice Input"}
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'pulse-animation' : ''}`} />
          </Button>
          
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            size="icon"
            className="shrink-0 touch-target rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg glow-hover focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send Message"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        {/* Status text */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground px-2">
          <div className="flex items-center gap-2">
            {isRecording && (
              <span className="flex items-center gap-2 text-destructive font-medium">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
                Recording...
              </span>
            )}
          </div>
          <span className="opacity-60">
            Press Enter to send, Shift + Enter for new line
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
