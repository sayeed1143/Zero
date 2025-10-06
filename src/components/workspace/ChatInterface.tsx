import React, { useEffect, useRef, useState } from "react";
import React, { useEffect, useRef, useState } from "react";
import { Send, Paperclip, Mic, Sparkles, FileText, Image, BarChart3, Hash, BookOpen, Zap } from "lucide-react";
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

type Persona = "student" | "teacher" | "tutor";

const humanLabel = (p: Persona) => (p === "student" ? "Student" : p === "teacher" ? "Teacher" : "Tutor");

const ChatInterface = ({ onSendMessage, chatHistory, isProcessing, lastAddedNodeIds = [], onViewCanvas }: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Edu-first UI states
  const [persona, setPersona] = useState<Persona>("student");
  const [showWorkMode, setShowWorkMode] = useState(true);
  const [assignments, setAssignments] = useState<{ id: string; title: string; status: "draft" | "assigned" | "submitted" | "graded" }[]>([]);

  // Attachments upload simulation / preview
  const [attachments, setAttachments] = useState<{
    id: string;
    file: File;
    progress: number;
    preview?: string;
  }[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, assignments, attachments]);

  const quickCommands = [
    { icon: <Sparkles className="w-3 h-3" />, label: "Summarize", command: "explain", prompt: "Summarize this content in simple terms" },
    { icon: <FileText className="w-3 h-3" />, label: "Explain", command: "explain", prompt: "Explain this in detail" },
    { icon: <BookOpen className="w-3 h-3" />, label: "Flashcards", command: "flashcards", prompt: "Create spaced-repetition flashcards from this content" },
    { icon: <BarChart3 className="w-3 h-3" />, label: "Quiz", command: "quiz", prompt: "Generate a short quiz to test my knowledge" },
    { icon: <Hash className="w-3 h-3" />, label: "Math", command: "math", prompt: "Solve this math problem step-by-step" },
  ];

  const handleSend = (command?: string) => {
    if (message.trim() && !isProcessing) {
      // If persona is teacher and command is broadcast, treat specially
      if (command === "broadcast") {
        onSendMessage(`[Broadcast - ${humanLabel(persona)}] ${message}`, "broadcast");
      } else {
        // Attach basic persona context prefix so backend can use it for tailoring
        const prefix = persona === "student" ? "[Student] " : persona === "teacher" ? "[Teacher] " : "[Tutor] ";
        const full = prefix + message;
        onSendMessage(full, command);
      }
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
      const prefix = persona === "student" ? "[Student] " : persona === "teacher" ? "[Teacher] " : "[Tutor] ";
      const full = prefix + prompt;
      setMessage("");
      onSendMessage(full, command);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  // Assignments
  const createAssignment = () => {
    const id = String(Date.now());
    setAssignments(prev => [{ id, title: message.trim() ? message.trim() : `Assignment ${prev.length + 1}`, status: "draft" }, ...prev]);
    setMessage("");
  };

  const publishAssignment = (id: string) => {
    setAssignments(prev => prev.map(a => (a.id === id ? { ...a, status: "assigned" } : a)));
  };

  // Attachments handling (client-side preview + simulated upload progress)
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: typeof attachments = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = `${Date.now()}-${i}`;
      const reader = new FileReader();
      const item = { id, file, progress: 0, preview: undefined };
      newItems.push(item);
      reader.onload = (e) => {
        const preview = typeof e.target?.result === "string" ? e.target?.result : undefined;
        setAttachments(prev => prev.map(p => p.id === id ? { ...p, preview } : p));
      };
      // create preview for images and text files
      if (file.type.startsWith("image/") || file.type.startsWith("text/")) {
        reader.readAsDataURL(file);
      }
    }
    setAttachments(prev => [...newItems, ...prev]);

    // simulate upload progress
    newItems.forEach((it, idx) => {
      const interval = setInterval(() => {
        setAttachments(prev => {
          const found = prev.find(p => p.id === it.id);
          if (!found) {
            clearInterval(interval);
            return prev;
          }
          if (found.progress >= 100) {
            clearInterval(interval);
            return prev.map(p => (p.id === it.id ? { ...p, progress: 100 } : p));
          }
          return prev.map(p => (p.id === it.id ? { ...p, progress: Math.min(100, p.progress + 12 + Math.random() * 20) } : p));
        });
      }, 300 + Math.random() * 300);
    });
  };

  const removeAttachment = (id: string) => setAttachments(prev => prev.filter(p => p.id !== id));

  return (
    <div className="h-full w-full flex">
      {/* Left vertical tools column */}
      <div className="w-16 bg-transparent flex flex-col items-center py-4 gap-3 border-r border-black/5">
        {quickCommands.map((cmd, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickCommand(cmd.command, cmd.prompt)}
            disabled={isProcessing}
            title={cmd.label}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 touch-target focus-ring disabled:opacity-50"
          >
            {cmd.icon}
          </button>
        ))}
        {/* Canvas button */}
        <button
          onClick={() => onViewCanvas && onViewCanvas()}
          title="Canvas"
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-black border border-black/10 hover:shadow-md mt-4"
        >
          <BookOpen className="w-5 h-5" />
        </button>
      </div>

      {/* Right main chat column */}
      <div className="flex-1 flex flex-col bg-[#F4F4F4]">
        {/* Top row: persona, show-work, create assignment */}
        <div className="px-4 pt-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white border border-black/10 rounded-full p-1">
              {(["student", "teacher", "tutor"] as Persona[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPersona(p)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${persona === p ? 'bg-primary text-primary-foreground' : 'text-black/70 hover:bg-black/5'}`}
                >
                  {humanLabel(p)}
                </button>
              ))}
            </div>

            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showWorkMode} onChange={() => setShowWorkMode(s => !s)} className="accent-primary" />
              <span className="text-sm">Show work</span>
            </label>

            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => { if (message.trim()) createAssignment(); }} disabled={!message.trim() || isProcessing}>
                Create Assignment
              </Button>
              {persona === 'teacher' && (
                <Button size="sm" variant="glow" onClick={() => onSendMessage('[Teacher Broadcast] ' + (message || 'Announcement'), 'broadcast')} disabled={isProcessing}>
                  Broadcast
                </Button>
              )}
            </div>
          </div>

          {/* Assignment chips */}
          {assignments.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {assignments.map(a => (
                <div key={a.id} className="bg-white border border-black/10 px-3 py-1 rounded-lg text-sm flex items-center gap-3">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-black/60">{a.status}</div>
                  {a.status === 'draft' && (
                    <Button size="xs" variant="ghost" onClick={() => publishAssignment(a.id)}>Publish</Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat messages area */}
        <div className="mt-3 flex-1 overflow-y-auto px-4">
          <div className="space-y-3 pb-4">
            {chatHistory.map((msg, index) => (
              <div key={`msg-${index}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm text-sm leading-relaxed whitespace-pre-wrap font-medium ${msg.role === 'user' ? 'bg-[#EDEDED] text-black border border-black/10' : 'bg-white text-black border border-accent/30'} ${msg.role !== 'user' ? 'border-l-4 border-l-accent' : ''}`}>
                  <div className="text-xs text-black/60 mb-1">{msg.role === 'user' ? 'You' : 'SHUNYA AI'}</div>
                  <div>{msg.content}</div>

                  {showWorkMode && msg.role === 'assistant' && (
                    <details className="mt-3 bg-black/5 p-3 rounded-md">
                      <summary className="cursor-pointer text-sm font-medium">Show work / steps</summary>
                      <div className="mt-2 text-sm whitespace-pre-wrap">
                        {extractSteps(msg.content).length > 0 ? (
                          extractSteps(msg.content).map((s, i) => (
                            <div key={i} className="mb-2">{s}</div>
                          ))
                        ) : (
                          <div className="text-black/60">No detailed steps detected. Ask the assistant to "show work" for detailed steps.</div>
                        )}
                      </div>
                    </details>
                  )}

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
                      <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-black animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                    </div>
                    <span className="text-sm text-black/80 font-medium">AI is analyzing...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Attachments preview list */}
        {attachments.length > 0 && (
          <div className="px-4 pb-2">
            <div className="flex flex-col gap-2">
              {attachments.map(a => (
                <div key={a.id} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-black/10">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{a.file.name}</div>
                    <div className="text-xs text-black/60">{Math.round(a.file.size / 1024)} KB</div>
                    <div className="w-full bg-black/5 h-2 rounded mt-2 overflow-hidden">
                      <div style={{ width: `${a.progress}%` }} className="h-2 bg-primary" />
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button size="xs" variant="ghost" onClick={() => removeAttachment(a.id)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-[#E0E0E0] bg-[#F4F4F4] p-4">
          <div className="flex items-center gap-2">
            <button
              title="Attach File"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="shrink-0 touch-target rounded-full hover:bg-black/10 border border-black/10 focus-ring transition-all p-2 bg-white"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />

            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask SHUNYA AI anything... (${humanLabel(persona)})`}
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

          <div className="mt-3 flex items-center gap-3 text-xs text-black/60">
            <div className="inline-flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Tools: Math • Code • LaTeX • Whiteboard</span>
            </div>

            <div className="ml-auto">
              <span className="text-xs">Persona: <strong>{humanLabel(persona)}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function extractSteps(content: string) {
  if (!content) return [];
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  // find lines that look like step markers
  const steps = lines.filter(l => /^step\b|^\d+\.|^\d+\)/i.test(l));
  // if many contiguous lines look like steps, return them; otherwise return any long lines that look explanatory
  if (steps.length > 0) return steps;
  return lines.filter(l => l.length > 40).slice(0, 6);
}

export default ChatInterface;
