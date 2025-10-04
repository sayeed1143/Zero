import { useCallback, useEffect, useRef, useState } from "react";
import Canvas from "@/components/workspace/Canvas";
import ChatInterface from "@/components/workspace/ChatInterface";
import WorkspaceNav from "@/components/workspace/WorkspaceNav";
import { AIService } from "@/services/ai";
import { toast } from "sonner";
import type { AIMessage } from "@/types/ai";
import { AI_MODEL_DEFAULTS } from "@/types/ai";

const Workspace = () => {
  const [canvasItems, setCanvasItems] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<AIMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voicePlaybackEnabled, setVoicePlaybackEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenIndexRef = useRef<number>(-1);

  const stopVoicePlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speakAssistantResponse = useCallback(
    async (text: string) => {
      if (!voicePlaybackEnabled || !text.trim()) {
        return;
      }

      stopVoicePlayback();
      setIsSpeaking(true);

      try {
        const { audio, mimeType } = await AIService.textToSpeech(text, "alloy", AI_MODEL_DEFAULTS.tts);
        const audioElement = new Audio(`data:${mimeType};base64,${audio}`);
        audioRef.current = audioElement;

        audioElement.onended = () => {
          setIsSpeaking(false);
          audioRef.current = null;
        };
        audioElement.onerror = () => {
          setIsSpeaking(false);
          audioRef.current = null;
        };

        await audioElement.play();
      } catch (error: any) {
        console.error("Voice playback error:", error);
        audioRef.current = null;

        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
          return;
        }

        setIsSpeaking(false);
        toast.error(error.message || "Unable to play voice response");
      }
    },
    [stopVoicePlayback, voicePlaybackEnabled],
  );

  useEffect(() => {
    if (!voicePlaybackEnabled) {
      stopVoicePlayback();
      return;
    }

    const lastAssistantIndex = (() => {
      for (let i = chatHistory.length - 1; i >= 0; i -= 1) {
        if (chatHistory[i].role === "assistant") {
          return i;
        }
      }
      return -1;
    })();

    if (lastAssistantIndex !== -1 && lastAssistantIndex > lastSpokenIndexRef.current) {
      lastSpokenIndexRef.current = lastAssistantIndex;
      void speakAssistantResponse(chatHistory[lastAssistantIndex].content);
    }
  }, [chatHistory, speakAssistantResponse, voicePlaybackEnabled, stopVoicePlayback]);

  useEffect(() => {
    return () => {
      stopVoicePlayback();
    };
  }, [stopVoicePlayback]);

  const handleSendMessage = async (message: string, command?: string) => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    const userMessage: AIMessage = { role: "user", content: message };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);

    try {
      if (command === "mindmap") {
        toast.info("Generating mind map...");
        const nodes = await AIService.generateMindMap(message, AI_MODEL_DEFAULTS.mindmap);

        const formattedNodes = nodes.map((node, index) => ({
          id: node.id || `node-${Date.now()}-${index}`,
          type: node.type || "text",
          title: node.title || node.content || "Topic",
          x: 150 + (index % 4) * 200,
          y: 150 + Math.floor(index / 4) * 200,
          connections: node.children || node.connections || [],
        }));

        setCanvasItems((prevItems) => [...prevItems, ...formattedNodes]);
        toast.success("Mind map created! Check the canvas.");

        const aiMessage: AIMessage = {
          role: "assistant",
          content:
            "I've created a mind map on the canvas based on your content. You can drag nodes to organize them and connect related concepts.",
        };
        setChatHistory([...newHistory, aiMessage]);
      } else if (command === "quiz") {
        toast.info("Generating quiz...");
        const quizResponse = await AIService.generateQuiz(message, 5, "medium", AI_MODEL_DEFAULTS.quiz);

        const aiMessage: AIMessage = {
          role: "assistant",
          content: `I've generated a ${quizResponse.questions.length}-question quiz for you:\n\n${quizResponse.questions
            .map(
              (q, i) =>
                `**Question ${i + 1}:** ${q.question}\n${q.options
                  .map((opt, j) => `${String.fromCharCode(65 + j)}. ${opt}`)
                  .join("\n")}`,
            )
            .join("\n\n")}`,
        };
        setChatHistory([...newHistory, aiMessage]);
        toast.success("Quiz generated!");
      } else {
        const response = await AIService.chat(newHistory, AI_MODEL_DEFAULTS.chat);
        const aiMessage: AIMessage = {
          role: "assistant",
          content: response.content,
        };
        setChatHistory([...newHistory, aiMessage]);
      }
    } catch (error: any) {
      console.error("AI error:", error);
      toast.error(error.message || "Failed to process your request");
      const errorMessage: AIMessage = {
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please make sure the OpenRouter API key is configured in your environment variables.",
      };
      setChatHistory([...newHistory, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.info("Currently only images are supported for vision processing");
      return;
    }

    try {
      setIsProcessing(true);
      toast.info("Processing image...");

      const base64 = await AIService.fileToBase64(file);
      const analysis = await AIService.processVision(
        base64,
        "Analyze this image in detail. Describe what you see, identify key concepts, and suggest how this could be used for learning.",
        AI_MODEL_DEFAULTS.vision,
      );

      const newNode = {
        id: `file-${Date.now()}`,
        type: "image",
        title: file.name,
        x: 150,
        y: 150,
        connections: [],
        data: { analysis },
      };

      setCanvasItems((prevItems) => [...prevItems, newNode]);

      const aiMessage: AIMessage = {
        role: "assistant",
        content: `Image Analysis:\n\n${analysis}`,
      };
      setChatHistory((prev) => [...prev, aiMessage]);

      toast.success("Image processed and added to canvas!");
    } catch (error: any) {
      console.error("Vision processing error:", error);
      toast.error(error.message || "Failed to process image");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranscriptionStateChange = (active: boolean) => {
    setIsTranscribing(active);
  };

  const toggleVoicePlayback = () => {
    setVoicePlaybackEnabled((prev) => !prev);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-secondary/10 to-primary/5">
      <WorkspaceNav />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Canvas items={canvasItems} onFileUpload={handleFileUpload} />
        <ChatInterface
          onSendMessage={handleSendMessage}
          chatHistory={chatHistory}
          isProcessing={isProcessing || isTranscribing}
          isTranscribing={isTranscribing}
          voicePlaybackEnabled={voicePlaybackEnabled}
          onToggleVoicePlayback={toggleVoicePlayback}
          isSpeaking={isSpeaking}
          onTranscriptionStateChange={handleTranscriptionStateChange}
        />
      </div>
    </div>
  );
};

export default Workspace;
