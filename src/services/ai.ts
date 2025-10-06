import type {
  AIMessage,
  ChatRequest,
  ChatResponse,
  VisionRequest,
  QuizRequest,
  QuizResponse,
  VisualizeResponse,
} from "@/types/ai";
import { DEFAULT_FEATURE_MODELS } from "@/types/ai";

export class AIService {
  static async chat(messages: AIMessage[], model: string = DEFAULT_FEATURE_MODELS.chat): Promise<ChatResponse> {
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
        const errorText = await response.text();
        let errorMsg = "Failed to get AI response";
        try {
          const error = JSON.parse(errorText);
          errorMsg = error.message || error.error || errorMsg;
        } catch {
          errorMsg = errorText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Empty response from server");
      }
      
      return JSON.parse(responseText);
    } catch (error: any) {
      console.error("AI chat error:", error);
      throw new Error(error.message || "Failed to communicate with AI");
    }
  }

  static async processVision(
    image: string,
    prompt: string,
    model: string = DEFAULT_FEATURE_MODELS.vision
  ): Promise<string> {
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
    model: string = DEFAULT_FEATURE_MODELS.quiz
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

  static async generateMindMap(content: string, model: string = DEFAULT_FEATURE_MODELS.mindmap): Promise<any[]> {
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

  static async visualize(message: string, model: string = DEFAULT_FEATURE_MODELS.explanations): Promise<VisualizeResponse> {
    try {
      const response = await fetch("/api/visualize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          model,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const parsed = JSON.parse(errorText);
          throw new Error(parsed.message || parsed.error || "Failed to visualize message");
        } catch {
          throw new Error(errorText || "Failed to visualize message");
        }
      }

      const data: VisualizeResponse = await response.json();
      return data;
    } catch (error: any) {
      console.error("Visualization error:", error);
      throw new Error(error.message || "Failed to visualize message");
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
