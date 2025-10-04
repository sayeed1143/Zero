import { useState } from "react";
import Canvas from "@/components/workspace/Canvas";
import ChatInterface from "@/components/workspace/ChatInterface";
import WorkspaceNav from "@/components/workspace/WorkspaceNav";
import { AIService } from "@/services/ai";
import { toast } from "sonner";
import type { AIMessage } from "@/types/ai";

const Workspace = () => {
  const [canvasItems, setCanvasItems] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<AIMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendMessage = async (message: string, command?: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    const userMessage: AIMessage = { role: 'user', content: message };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);

    try {
      if (command === 'mindmap') {
        toast.info("Generating mind map...");
        const nodes = await AIService.generateMindMap(message);
        
        const formattedNodes = nodes.map((node, index) => ({
          id: node.id || `node-${Date.now()}-${index}`,
          type: 'text',
          title: node.title || node.content || 'Topic',
          x: 150 + (index % 4) * 200,
          y: 150 + Math.floor(index / 4) * 200,
          connections: node.children || []
        }));
        
        setCanvasItems(prevItems => [...prevItems, ...formattedNodes]);
        toast.success("Mind map created! Check the canvas.");
        
        const aiMessage: AIMessage = {
          role: 'assistant',
          content: "I've created a mind map on the canvas based on your content. You can drag nodes to organize them and connect related concepts."
        };
        setChatHistory([...newHistory, aiMessage]);
        
      } else if (command === 'quiz') {
        toast.info("Generating quiz...");
        const quizResponse = await AIService.generateQuiz(message);
        
        const aiMessage: AIMessage = {
          role: 'assistant',
          content: `I've generated a ${quizResponse.questions.length}-question quiz for you:\n\n${quizResponse.questions.map((q, i) => 
            `**Question ${i + 1}:** ${q.question}\n${q.options.map((opt, j) => `${String.fromCharCode(65 + j)}. ${opt}`).join('\n')}`
          ).join('\n\n')}`
        };
        setChatHistory([...newHistory, aiMessage]);
        toast.success("Quiz generated!");
        
      } else {
        const response = await AIService.chat(newHistory);
        const aiMessage: AIMessage = {
          role: 'assistant',
          content: response.content
        };
        setChatHistory([...newHistory, aiMessage]);
      }
    } catch (error: any) {
      console.error('AI error:', error);
      toast.error(error.message || 'Failed to process your request');
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please make sure the OpenRouter API key is configured in your environment variables.'
      };
      setChatHistory([...newHistory, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
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
        'anthropic/claude-3-opus'
      );

      const newNode = {
        id: `file-${Date.now()}`,
        type: 'image',
        title: file.name,
        x: 150,
        y: 150,
        connections: [],
        data: { analysis }
      };
      
      setCanvasItems(prevItems => [...prevItems, newNode]);
      
      const aiMessage: AIMessage = {
        role: 'assistant',
        content: `Image Analysis:\n\n${analysis}`
      };
      setChatHistory(prev => [...prev, aiMessage]);
      
      toast.success("Image processed and added to canvas!");
    } catch (error: any) {
      console.error('Vision processing error:', error);
      toast.error(error.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-secondary/10 to-primary/5">
      <WorkspaceNav />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Canvas items={canvasItems} onFileUpload={handleFileUpload} />
        <ChatInterface 
          onSendMessage={handleSendMessage}
          chatHistory={chatHistory}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
};

export default Workspace;
