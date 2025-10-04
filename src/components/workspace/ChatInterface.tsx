import { useEffect, useRef, useState } from "react";
import {
  Send,
  Paperclip,
  Mic,
  Sparkles,
  FileText,
  Image,
  BarChart3,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AIMessage } from "@/types/ai";
import { AIService } from "@/services/ai";
import { toast } from "sonner";

interface ChatInterfaceProps {
  onSendMessage: (message: string, command?: string) => void;
  chatHistory: AIMessage[];
  isProcessing: boolean;
  isTranscribing: boolean;
  isSpeaking: boolean;
  voicePlaybackEnabled: boolean;
  onToggleVoicePlayback: () => void;
  onTranscriptionStateChange: (active: boolean) => void;
}

const ChatInterface = ({
  onSendMessage,
  chatHistory,
  isProcessing,
  isTranscribing,
  isSpeaking,
  voicePlaybackEnabled,
  onToggleVoicePlayback,
  onTranscriptionStateChange,
}: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceInputSupported, setVoiceInputSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const quickCommands = [
    { icon: <Sparkles className="w-3 h-3" />, label: "Summarize", command: "explain", prompt: "Summarize this content in simple terms" },
    { icon: <FileText className="w-3 h-3" />, label: "Explain", command: "explain", prompt: "Explain this in detail" },
    { icon: <Image className="w-3 h-3" />, label: "Mind Map", command: "mindmap", prompt: "Create a mind map of the key concepts" },
    { icon: <BarChart3 className="w-3 h-3" />, label: "Quiz", command: "quiz", prompt: "Generate a quiz to test my knowledge" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasMediaRecorder = "MediaRecorder" in window;
      const hasNavigator = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
      setVoiceInputSupported(hasMediaRecorder && hasNavigator);
    }
  }, []);

  const handleSend = (command?: string) => {
    if (message.trim() && !isProcessing) {
      onSendMessage(message.trim(), command);
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

  const stopStreamTracks = () => {
    const stream = mediaRecorderRef.current?.stream;
    stream?.getTracks().forEach((track) => track.stop());
  };

  const blobToBase64 = (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const cleaned = result.includes(",") ? result.split(",")[1] ?? "" : result;
        resolve(cleaned);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const startRecording = async () => {
    if (!voiceInputSupported) {
      toast.info("Voice input is not supported in this browser yet.");
      return;
    }

    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        stopStreamTracks();

        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
        audioChunksRef.current = [];

        if (blob.size === 0) {
          onTranscriptionStateChange(false);
          toast.info("No audio captured. Please try again.");
          return;
        }

        try {
          onTranscriptionStateChange(true);
          const base64 = await blobToBase64(blob);
          const transcript = await AIService.transcribeAudio(base64, blob.type);

          if (transcript.text?.trim()) {
            const cleanText = transcript.text.trim();
            setMessage(cleanText);
            setTimeout(() => {
              onSendMessage(cleanText);
              setMessage("");
            }, 100);
          } else {
            toast.info("I couldn't detect speech. Please try again.");
          }
        } catch (error: any) {
          console.error("Transcription error:", error);
          toast.error(error.message || "Unable to transcribe audio");
        } finally {
          onTranscriptionStateChange(false);
        }
      };

      recorder.onerror = (event) => {
        console.error("Recorder error:", event);
        toast.error("There was a problem capturing audio");
        stopStreamTracks();
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);
      toast.info("Listening... speak your question");
    } catch (error: any) {
      console.error("Voice recording error:", error);
      toast.error("Microphone access was blocked. Please enable it and try again.");
      stopStreamTracks();
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  };

  const toggleRecording = () => {
    if (isProcessing && !isRecording) {
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 animate-slide-up">
      {chatHistory.length > 0 && (
        <div className="glass-panel mx-6 mb-4 rounded-3xl p-6 max-h-96 overflow-y-auto scrollbar-thin">
          <div className="space-y-4">
            {chatHistory.map((msg, index) => (
              <div
                key={`msg-${index}`}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
                      : "glass-card"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start animate-fade-in">
                <div className="glass-card rounded-2xl px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0s" }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
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
              className="glass-panel px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 glow-hover touch-target focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cmd.icon}
              <span>{cmd.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel mx-6 mb-6 rounded-3xl p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 touch-target rounded-full hover:bg-primary/10 focus-ring"
            title="Attach File"
            disabled={isProcessing}
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </Button>

          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask EduVoice AI anything..."
              disabled={isProcessing}
              className="pr-12 h-12 rounded-2xl glass-card border-2 border-transparent focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/20 transition-all text-base"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded-lg glass-panel px-2 font-mono text-xs font-medium opacity-60">
              ⌘K
            </kbd>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleVoicePlayback}
            className={`shrink-0 touch-target rounded-full focus-ring hover:bg-primary/10 ${
              voicePlaybackEnabled ? "text-primary" : "text-muted-foreground"
            }`}
            title={voicePlaybackEnabled ? "Mute AI voice" : "Enable AI voice responses"}
          >
            {voicePlaybackEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>

          <Button
            onClick={toggleRecording}
            size="icon"
            disabled={isProcessing && !isRecording}
            className={`shrink-0 touch-target rounded-full transition-all focus-ring ${
              isRecording
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground mic-pulse"
                : "bg-accent/10 hover:bg-accent/20 text-accent"
            } ${!voiceInputSupported ? "opacity-50 cursor-not-allowed" : ""}`}
            title={
              voiceInputSupported
                ? isRecording
                  ? "Stop Recording"
                  : "Start Voice Input"
                : "Voice input not supported in this browser"
            }
          >
            <Mic className={`w-5 h-5 ${isRecording ? "pulse-animation" : ""}`} />
          </Button>

          <Button
            onClick={() => handleSend()}
            disabled={!message.trim() || isProcessing}
            size="icon"
            className="shrink-0 touch-target rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg glow-hover focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send Message"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground px-2">
          <div className="flex items-center gap-3 flex-wrap">
            {isRecording && (
              <span className="flex items-center gap-2 text-destructive font-medium">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse"></span>
                Recording...
              </span>
            )}
            {isTranscribing && (
              <span className="flex items-center gap-2 text-primary font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                Transcribing voice...
              </span>
            )}
            {isSpeaking && voicePlaybackEnabled && (
              <span className="flex items-center gap-2 text-accent font-medium">
                <Loader2 className="w-3 h-3 animate-spin" />
                Speaking response...
              </span>
            )}
            {isProcessing && !isTranscribing && (
              <span className="flex items-center gap-2 text-primary font-medium">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Processing...
              </span>
            )}
          </div>
          <span className="opacity-60">Press Enter to send, Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
