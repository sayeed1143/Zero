import type {
  AIMessage,
  ChatRequest,
  ChatResponse,
  QuizRequest,
  QuizResponse,
  SpeechToTextResponse,
  TextToSpeechResponse,
  VisionRequest,
} from "@/types/ai";
import { AI_MODEL_DEFAULTS } from "@/types/ai";

export class AIService {
  static async chat(messages: AIMessage[], model: string = AI_MODEL_DEFAULTS.chat): Promise<ChatResponse> {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          model,
          temperature: 0.7,
          maxTokens: 2000,
        } as ChatRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get AI response");
      }

      return await response.json();
    } catch (error: any) {
      console.error("AI chat error:", error);
      throw new Error(error.message || "Failed to communicate with AI");
    }
  }

  static async processVision(image: string, prompt: string, model: string = AI_MODEL_DEFAULTS.vision): Promise<string> {
    try {
      const response = await fetch("/api/vision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image,
          prompt,
          model,
        } as VisionRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process image");
      }

      const data = await response.json();
      return data.content;
    } catch (error: any) {
      console.error("Vision processing error:", error);
      throw new Error(error.message || "Failed to process image");
    }
  }

  static async generateQuiz(
    content: string,
    numQuestions = 5,
    difficulty: "easy" | "medium" | "hard" = "medium",
    model: string = AI_MODEL_DEFAULTS.quiz,
  ): Promise<QuizResponse> {
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          numQuestions,
          difficulty,
          model,
        } as QuizRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate quiz");
      }

      return await response.json();
    } catch (error: any) {
      console.error("Quiz generation error:", error);
      throw new Error(error.message || "Failed to generate quiz");
    }
  }

  static async generateMindMap(content: string, model: string = AI_MODEL_DEFAULTS.mindmap): Promise<any[]> {
    try {
      const response = await fetch("/api/mindmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          model,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate mind map");
      }

      const data = await response.json();
      return data.nodes;
    } catch (error: any) {
      console.error("Mind map generation error:", error);
      throw new Error(error.message || "Failed to generate mind map");
    }
  }

  static async transcribeAudio(
    audio: string,
    mimeType: string,
    model: string = AI_MODEL_DEFAULTS.stt,
  ): Promise<SpeechToTextResponse> {
    try {
      const response = await fetch("/api/stt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audio, mimeType, model }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to transcribe audio");
      }

      return await response.json();
    } catch (error: any) {
      console.error("Speech-to-text error:", error);
      throw new Error(error.message || "Failed to transcribe audio");
    }
  }

  static async textToSpeech(
    text: string,
    voice = "alloy",
    model: string = AI_MODEL_DEFAULTS.tts,
    format: "mp3" | "wav" | "ogg" = "mp3",
  ): Promise<TextToSpeechResponse> {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, voice, model, format }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate speech");
      }

      return await response.json();
    } catch (error: any) {
      console.error("Text-to-speech error:", error);
      throw new Error(error.message || "Failed to generate speech");
    }
  }

  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
