import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Send,
  Paperclip,
  Mic,
  Sparkles,
  FileText,
  Image,
  BarChart3,
  Hash,
  BookOpen,
  Zap,
  Volume2,
  VolumeX,
  GitBranch,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AIMessage } from "@/types/ai";

interface ChatInterfaceProps {
  onSendMessage: (message: string, command?: string) => void;
  chatHistory: AIMessage[];
  isProcessing: boolean;
  lastAddedNodeIds?: string[];
  onViewCanvas?: () => void;
}

type Persona = "student" | "teacher" | "tutor";

type AttachmentKind = "image" | "pdf" | "other";

type AttachmentItem = {
  id: string;
  file: File;
  progress: number;
  preview?: string;
  kind: AttachmentKind;
};

const humanLabel = (p: Persona) => (p === "student" ? "Student" : p === "teacher" ? "Teacher" : "Tutor");

const ChatInterface = ({ onSendMessage, chatHistory, isProcessing, lastAddedNodeIds = [], onViewCanvas }: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Edu-first UI states
  const [persona, setPersona] = useState<Persona>("student");
  const [showWorkMode, setShowWorkMode] = useState(true);
  const [assignments, setAssignments] = useState<{ id: string; title: string; status: "draft" | "assigned" | "submitted" | "graded" }[]>([]);

  // Voice capabilities
  const recognitionRef = useRef<any>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState(false);

  // Attachments upload simulation / preview
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [lastSeenMessageIndex, setLastSeenMessageIndex] = useState(() => (chatHistory.length ? chatHistory.length - 1 : -1));
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [highlightedCommandIndex, setHighlightedCommandIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const slashCommands = useMemo(
    () => [
      {
        id: "mindmap",
        label: "Mindmap",
        description: "Visualize relationships instantly.",
        prompt: "Create a mindmap that organizes the core ideas from this topic in a structured way.",
        shortcut: "/mindmap",
      },
      {
        id: "quiz",
        label: "Quiz",
        description: "Generate questions to check understanding.",
        prompt: "Generate a five-question quiz with answers to evaluate understanding of this topic.",
        shortcut: "/quiz",
      },
    ],
    [],
  );

  const quickCommands = useMemo(
    () => [
      { icon: <Sparkles className="h-3 w-3" />, label: "Summarize", command: "explain", prompt: "Summarize this content in simple terms." },
      { icon: <FileText className="h-3 w-3" />, label: "Explain", command: "explain", prompt: "Explain this in detail." },
      { icon: <BookOpen className="h-3 w-3" />, label: "Flashcards", command: "flashcards", prompt: "Create spaced-repetition flashcards from this content." },
      {
        icon: <GitBranch className="h-3 w-3" />,
        label: "Mindmap",
        command: "mindmap",
        prompt: slashCommands.find(cmd => cmd.id === "mindmap")?.prompt ?? "Create a mindmap from this topic.",
      },
      {
        icon: <BarChart3 className="h-3 w-3" />,
        label: "Quiz",
        command: "quiz",
        prompt: slashCommands.find(cmd => cmd.id === "quiz")?.prompt ?? "Generate a short quiz to test my knowledge.",
      },
      { icon: <Hash className="h-3 w-3" />, label: "Math", command: "math", prompt: "Solve this math problem step-by-step." },
    ],
    [slashCommands],
  );

  const filteredSlashCommands = useMemo(() => {
    const trimmed = message.trim().toLowerCase();
    if (!trimmed.startsWith("/")) return [] as typeof slashCommands;
    const query = trimmed.slice(1);
    if (!query) return slashCommands;
    return slashCommands.filter(cmd => cmd.id.includes(query) || cmd.label.toLowerCase().includes(query));
  }, [message, slashCommands]);

  useEffect(() => {
    if (filteredSlashCommands.length === 0) {
      setHighlightedCommandIndex(0);
    } else {
      setHighlightedCommandIndex(prev => Math.min(prev, filteredSlashCommands.length - 1));
    }
  }, [filteredSlashCommands]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSpeechSupported(Boolean(SpeechRecognition));
    setTtsSupported(typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined");

    return () => {
      try {
        if (recognitionRef.current) recognitionRef.current.stop();
      } catch {}
      try {
        if (window && window.speechSynthesis) window.speechSynthesis.cancel();
      } catch {}
    };
  }, []);

  useEffect(() => {
    if (!voiceOutput || !ttsSupported || chatHistory.length === 0) return;
    const last = chatHistory[chatHistory.length - 1];
    if (last.role !== "assistant" || !last.content) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(last.content);
      utter.rate = 1;
      utter.pitch = 1;
      utter.lang = "en-US";
      window.speechSynthesis.speak(utter);
    } catch {}
  }, [chatHistory, voiceOutput, ttsSupported]);

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const minHeight = 48;
    const maxHeight = 200;
    const contentHeight = Math.max(el.scrollHeight, minHeight);
    const nextHeight = Math.min(contentHeight, maxHeight);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = contentHeight > maxHeight ? "auto" : "hidden";
  }, []);

  useLayoutEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  const scheduleTextareaResize = useCallback(() => {
    if (typeof window === "undefined") {
      adjustTextareaHeight();
      return;
    }
    requestAnimationFrame(adjustTextareaHeight);
  }, [adjustTextareaHeight]);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior, block: "end" });
      }
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior });
      }
    },
    [],
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = 48;
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
      setIsScrolledToBottom(atBottom);
      setShowScrollToBottom(!atBottom);
      if (atBottom) {
        setLastSeenMessageIndex(chatHistory.length ? chatHistory.length - 1 : -1);
      }
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [chatHistory.length]);

  useEffect(() => {
    if (chatHistory.length === 0) {
      setLastSeenMessageIndex(-1);
      setIsScrolledToBottom(true);
      setShowScrollToBottom(false);
      return;
    }

    if (isScrolledToBottom) {
      scrollToBottom(chatHistory.length > 5 ? "smooth" : "auto");
      setLastSeenMessageIndex(chatHistory.length - 1);
      setShowScrollToBottom(false);
    } else {
      setShowScrollToBottom(true);
    }
  }, [chatHistory, isScrolledToBottom, scrollToBottom]);

  const startRecognition = () => {
    if (!speechSupported || isProcessing) return;
    try {
      const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;

      let finalTranscript = "";

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interim += transcript;
          }
        }
        setMessage(prev => (finalTranscript ? `${prev ? `${prev} ` : ""}${finalTranscript}` : prev || interim));
      };

      recognition.onerror = () => {
        setIsRecording(false);
        try {
          recognition.stop();
        } catch {}
      };

      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
      };

      recognition.start();
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  };

  const stopRecognition = () => {
    try {
      if (recognitionRef.current) recognitionRef.current.stop();
    } catch {}
    setIsRecording(false);
  };

  const parseSlashCommand = useCallback(
    (value: string): { command?: string; body: string } => {
      const trimmed = value.trim();
      if (!trimmed.startsWith("/")) {
        return { body: trimmed };
      }

      const [firstToken, ...restTokens] = trimmed.split(/\s+/);
      const normalized = firstToken.slice(1).toLowerCase();
      const match = slashCommands.find(cmd => cmd.id === normalized);
      if (!match) {
        return { body: trimmed };
      }

      const remainder = restTokens.join(" ").trim();
      return {
        command: match.id,
        body: remainder || match.prompt,
      };
    },
    [slashCommands],
  );

  const handleSend = useCallback(
    (explicitCommand?: string, overrideBody?: string) => {
      if (isProcessing) return;

      if (explicitCommand === "broadcast") {
        const trimmed = (overrideBody ?? message).trim();
        if (!trimmed) return;
        onSendMessage(`[Broadcast - ${humanLabel(persona)}] ${trimmed}`, "broadcast");
        setMessage("");
        scheduleTextareaResize();
        return;
      }

      const rawValue = overrideBody ?? message;
      const parsed = parseSlashCommand(rawValue);
      const finalCommand = explicitCommand ?? parsed.command;
      const body = (overrideBody ?? parsed.body).trim();

      if (!body) return;

      const prefix = persona === "student" ? "[Student] " : persona === "teacher" ? "[Teacher] " : "[Tutor] ";
      onSendMessage(prefix + body, finalCommand);
      setMessage("");
      scheduleTextareaResize();
    },
    [adjustTextareaHeight, isProcessing, message, onSendMessage, parseSlashCommand, persona],
  );

  const handleQuickCommand = (command: string, prompt: string) => {
    if (!isProcessing) {
      handleSend(command, prompt);
    }
  };

  const handleComposerChange = (value: string) => {
    setMessage(value);
    scheduleTextareaResize();
  };

  const handleSlashSuggestionClick = (commandId: string) => {
    const entry = slashCommands.find(cmd => cmd.id === commandId);
    const base = entry ? `${entry.shortcut} ` : `/${commandId} `;
    setMessage(base);
    scheduleTextareaResize();
    if (typeof window === "undefined") {
      textareaRef.current?.focus();
    } else {
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  };

  const handleComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (filteredSlashCommands.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedCommandIndex(prev => (prev + 1) % filteredSlashCommands.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedCommandIndex(prev => (prev - 1 + filteredSlashCommands.length) % filteredSlashCommands.length);
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const command = filteredSlashCommands[highlightedCommandIndex];
        if (command) {
          handleSlashSuggestionClick(command.id);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMessage("");
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (filteredSlashCommands.length > 0) {
        const command = filteredSlashCommands[highlightedCommandIndex];
        handleSend(command?.id);
      } else {
        handleSend();
      }
    }
  };

  const toggleRecording = () => {
    if (!speechSupported) return;
    if (isRecording) stopRecognition();
    else startRecognition();
  };

  // Assignments
  const createAssignment = () => {
    const id = String(Date.now());
    setAssignments(prev => [{ id, title: message.trim() ? message.trim() : `Assignment ${prev.length + 1}`, status: "draft" }, ...prev]);
    setMessage("");
    scheduleTextareaResize();
  };

  const publishAssignment = (id: string) => {
    setAssignments(prev => prev.map(a => (a.id === id ? { ...a, status: "assigned" } : a)));
  };

  // Attachments handling (client-side preview + simulated upload progress)
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: AttachmentItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      const kind: AttachmentKind = isImage ? "image" : isPdf ? "pdf" : "other";
      const id = `${Date.now()}-${i}`;
      const reader = new FileReader();
      const item: AttachmentItem = { id, file, progress: 0, preview: undefined, kind };
      newItems.push(item);
      reader.onload = (e) => {
        const preview = typeof e.target?.result === "string" ? e.target?.result : undefined;
        if (preview) {
          setAttachments(prev => prev.map(p => (p.id === id ? { ...p, preview } : p)));
        }
      };
      if (isImage) {
        reader.readAsDataURL(file);
      }
    }
    setAttachments(prev => [...newItems, ...prev]);

    newItems.forEach(it => {
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
          return prev.map(p =>
            p.id === it.id
              ? { ...p, progress: Math.min(100, p.progress + 12 + Math.random() * 20) }
              : p,
          );
        });
      }, 300 + Math.random() * 300);
    });
  };

  const removeAttachment = (id: string) => setAttachments(prev => prev.filter(p => p.id !== id));

  const firstUnreadIndex = !isScrolledToBottom && chatHistory.length - 1 > lastSeenMessageIndex ? Math.max(lastSeenMessageIndex + 1, 0) : -1;
  const showStreamingCaret = (role: AIMessage["role"], index: number) => role === "assistant" && index === chatHistory.length - 1 && isProcessing;

  return (
    <TooltipProvider delayDuration={120}>
      <div className="flex h-full w-full flex-col bg-[#F4F4F4]">
        {/* Top controls: persona selector, show work, assignment list */}
        <div className="px-4 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white p-1">
              {(["student", "teacher", "tutor"] as Persona[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPersona(p)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                    persona === p ? "bg-primary text-primary-foreground" : "text-black/70 hover:bg-black/5",
                  )}
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
              <div className="hidden items-center gap-2 md:flex">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (message.trim()) createAssignment();
                  }}
                  disabled={!message.trim() || isProcessing}
                >
                  Create Assignment
                </Button>
                {persona === "teacher" && (
                  <Button
                    size="sm"
                    variant="glow"
                    onClick={() => onSendMessage(`[Teacher Broadcast] ${message || "Announcement"}`, "broadcast")}
                    disabled={isProcessing}
                  >
                    Broadcast
                  </Button>
                )}
              </div>
              <div className="text-xs text-black/60 md:hidden">{assignments.length} assignments</div>
            </div>
          </div>

          {/* Assignment chips */}
          {assignments.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {assignments.map(a => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border border-black/10 bg-white px-3 py-1 text-sm">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-black/60">{a.status}</div>
                  {a.status === "draft" && (
                    <Button size="xs" variant="ghost" onClick={() => publishAssignment(a.id)}>
                      Publish
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quick commands */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {quickCommands.map((cmd, index) => (
              <button
                key={`${cmd.label}-${index}`}
                onClick={() => handleQuickCommand(cmd.command, cmd.prompt)}
                disabled={isProcessing}
                className="flex items-center gap-2 rounded-full border border-black/10 bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cmd.icon}
                <span>{cmd.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div ref={scrollContainerRef} className="relative mt-3 flex-1 overflow-y-auto px-4 pb-6">
          <div className="space-y-3 pb-8">
            {chatHistory.map((msg, index) => {
              const showDivider = firstUnreadIndex === index;
              const isUser = msg.role === "user";

              return (
                <React.Fragment key={`msg-${index}`}>
                  {showDivider && (
                    <div className="flex items-center gap-3 py-2 text-xs font-semibold uppercase tracking-wide text-black/50">
                      <span className="h-px flex-1 bg-black/10" />
                      New messages
                      <span className="h-px flex-1 bg-black/10" />
                    </div>
                  )}

                  <div className={cn("flex", isUser ? "justify-end" : "justify-start")}> 
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl border px-5 py-3 text-sm font-medium leading-relaxed shadow-sm transition-shadow",
                        isUser
                          ? "border-black/10 bg-[#EDEDED] text-black"
                          : "border-accent/30 bg-white text-black",
                        !isUser && "border-l-4 border-l-accent",
                      )}
                    >
                      <div className="mb-1 text-xs text-black/60">{isUser ? "You" : "SHUNYA AI"}</div>
                      <div className="whitespace-pre-wrap">
                        {msg.content}
                        {showStreamingCaret(msg.role, index) && (
                          <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-black/70 align-middle" />
                        )}
                      </div>

                      {showWorkMode && msg.role === "assistant" && (
                        <details className="mt-3 rounded-md bg-black/5 p-3">
                          <summary className="cursor-pointer text-sm font-medium">Show work / steps</summary>
                          <div className="mt-2 whitespace-pre-wrap text-sm">
                            {extractSteps(msg.content).length > 0 ? (
                              extractSteps(msg.content).map((s, i) => (
                                <div key={i} className="mb-2">
                                  {s}
                                </div>
                              ))
                            ) : (
                              <div className="text-black/60">No detailed steps detected. Ask the assistant to "show work" for detailed steps.</div>
                            )}
                          </div>
                        </details>
                      )}

                      {msg.role === "assistant" && index === chatHistory.length - 1 && lastAddedNodeIds && lastAddedNodeIds.length > 0 && (
                        <div className="mt-3 flex items-center justify-end">
                          <Button size="sm" variant="glow" className="px-3 py-1" onClick={() => onViewCanvas && onViewCanvas()}>
                            View on Canvas
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl border border-accent/30 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-black/60">
                    <span className="flex h-2 w-2 animate-ping rounded-full bg-primary" />
                    SHUNYA AI is typing
                  </div>
                  <div className="mb-3 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-black/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-black/60 animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="h-2 w-2 rounded-full bg-black/60 animate-bounce" style={{ animationDelay: "240ms" }} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-3 w-5/6 animate-pulse rounded bg-black/10" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-black/10" />
                    <div className="h-3 w-3/4 animate-pulse rounded bg-black/10" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {showScrollToBottom && (
            <div className="pointer-events-none sticky bottom-4 flex justify-center">
              <Button
                size="sm"
                variant="secondary"
                className="pointer-events-auto flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs font-semibold shadow-md backdrop-blur"
                onClick={() => scrollToBottom("smooth")}
              >
                <ChevronDown className="h-4 w-4" />
                Jump to latest
              </Button>
            </div>
          )}
        </div>

        {/* Attachments preview list */}
        {attachments.length > 0 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {attachments.map(a => {
                const isUploading = a.progress < 100;
                return (
                  <div
                    key={a.id}
                    className="group flex items-center gap-3 rounded-full border border-black/10 bg-white/90 px-3 py-2 text-xs shadow-sm backdrop-blur"
                  >
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-black/5">
                      {a.kind === "image" && a.preview ? (
                        <img src={a.preview} alt={a.file.name} className="h-full w-full object-cover" />
                      ) : a.kind === "pdf" ? (
                        <FileText className="h-4 w-4 text-black/70" />
                      ) : (
                        <Paperclip className="h-4 w-4 text-black/70" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-black/80">{a.file.name}</div>
                      <div className="text-[10px] text-black/60">
                        {isUploading ? `Uploading… ${Math.min(100, Math.round(a.progress))}%` : `${Math.max(1, Math.round(a.file.size / 1024))} KB`}
                      </div>
                      {isUploading && (
                        <div className="mt-1 h-[2px] w-16 overflow-hidden rounded-full bg-black/10">
                          <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, Math.round(a.progress))}%` }} />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(a.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-transparent text-black/50 transition hover:border-black/20 hover:bg-black/5 hover:text-black"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div
          className="sticky bottom-0 border-t border-[#E0E0E0] bg-[#F4F4F4]/95 px-4 pb-4 pt-3 backdrop-blur supports-[backdrop-filter]:bg-[#F4F4F4]/70"
          aria-busy={isProcessing}
        >
          <div className="flex items-end gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="touch-target shrink-0 rounded-full border border-black/10 bg-white p-2 transition hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Attach image or PDF</TooltipContent>
            </Tooltip>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              className="hidden"
              onChange={e => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />

            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={e => handleComposerChange(e.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder={`Ask SHUNYA AI anything… (${humanLabel(persona)})`}
                disabled={isProcessing}
                rows={1}
                className="min-h-[48px] max-h-52 resize-none rounded-2xl border border-black/15 bg-white pr-24 text-base font-medium leading-relaxed placeholder:text-black/40 focus-visible:border-black focus-visible:ring-4 focus-visible:ring-accent/20"
              />

              {filteredSlashCommands.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 w-full max-w-sm rounded-2xl border border-black/10 bg-white p-2 shadow-lg">
                  {filteredSlashCommands.map((cmd, index) => (
                    <button
                      key={cmd.id}
                      type="button"
                      onMouseDown={event => {
                        event.preventDefault();
                        handleSlashSuggestionClick(cmd.id);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                        index === highlightedCommandIndex ? "bg-primary text-primary-foreground" : "hover:bg-black/5",
                      )}
                    >
                      <span className="flex flex-col">
                        <span className="font-semibold">{cmd.label}</span>
                        <span className="text-xs text-black/60">{cmd.description}</span>
                      </span>
                      <span className={cn("rounded-full border px-2 py-0.5 text-xs", index === highlightedCommandIndex ? "border-white/60" : "border-black/15 text-black/50")}>{cmd.shortcut}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setVoiceOutput(v => !v)}
                  size="icon"
                  variant="ghost"
                  disabled={!ttsSupported}
                  className={cn(
                    "touch-target shrink-0 rounded-full border border-black/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40",
                    voiceOutput ? "bg-black/80 text-white" : "bg-white text-black",
                  )}
                >
                  {voiceOutput ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Toggle voice responses</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleRecording}
                  size="icon"
                  disabled={isProcessing || !speechSupported}
                  className={cn(
                    "touch-target shrink-0 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40",
                    isRecording
                      ? "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      : "border-black/10 bg-white text-black hover:bg-black/5",
                  )}
                >
                  <Mic className={cn("h-5 w-5", isRecording && "animate-pulse")}>{""}</Mic>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{speechSupported ? (isRecording ? "Stop recording" : "Start voice input") : "Voice input unavailable"}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleSend()}
                  disabled={!message.trim() || isProcessing}
                  size="icon"
                  className="touch-target shrink-0 rounded-full border border-black/10 bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Send message</TooltipContent>
            </Tooltip>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-black/60">
            <div className="inline-flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Tools: Math • Code • LaTeX • Whiteboard</span>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <span>Persona: <strong>{humanLabel(persona)}</strong></span>
              <span>Voice: <strong>{voiceOutput ? "On" : "Off"}</strong></span>
              <span>Enter to send • Shift+Enter for newline • Try /mindmap or /quiz</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

function extractSteps(content: string) {
  if (!content) return [] as string[];
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const steps = lines.filter(l => /^step\b|^\d+\.|^\d+\)/i.test(l));
  if (steps.length > 0) return steps;
  return lines.filter(l => l.length > 40).slice(0, 6);
}

export default ChatInterface;
