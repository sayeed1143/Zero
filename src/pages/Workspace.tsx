import { useState } from "react";
import Canvas from "@/components/workspace/Canvas";
import ChatInterface from "@/components/workspace/ChatInterface";
import WorkspaceNav from "@/components/workspace/WorkspaceNav";
import { AIService } from "@/services/ai";
import { toast } from "sonner";
import type { AIMessage, QuizResponse } from "@/types/ai";
import { DEFAULT_FEATURE_MODELS } from "@/types/ai";

const Workspace = () => {
  const [canvasItems, setCanvasItems] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<AIMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelPreferences] = useState(DEFAULT_FEATURE_MODELS);
  const [pendingQuiz, setPendingQuiz] = useState<QuizResponse | null>(null);

  const extractArtifact = (text: string) => {
    const artifactMatch = text.match(/\{[\s\S]*?\}\s*$/m);
    if (!artifactMatch) return { caption: text, artifact: null as any };
    try {
      const artifact = JSON.parse(artifactMatch[0]);
      const caption = text.slice(0, artifactMatch.index).trim();
      return { caption, artifact };
    } catch {
      return { caption: text, artifact: null as any };
    }
  };

  const buildItemsFromArtifact = (artifact: any) => {
    if (!artifact || !artifact.nodes || !Array.isArray(artifact.nodes)) return [] as any[];
    const rawNodes = artifact.nodes as Array<{ id: string; label: string; parent?: string; color?: string }>;
    const map: Record<string, any> = {};
    rawNodes.forEach((n, idx) => {
      map[n.id] = {
        id: n.id,
        type: 'text',
        title: n.label,
        x: 150 + (idx % 4) * 200,
        y: 150 + Math.floor(idx / 4) * 200,
        connections: [] as string[],
        color: n.color,
      };
    });
    rawNodes.forEach(n => {
      if (n.parent && map[n.parent]) {
        map[n.parent].connections.push(n.id);
      }
    });
    return Object.values(map);
  };

  const parseAnswers = (input: string, count: number) => {
    const letters = input.toUpperCase().match(/[A-D]/g) || [];
    if (letters.length === count) return letters.map(l => l.charCodeAt(0) - 65);
    const numbered = Array.from(input.matchAll(/(\d+)\s*[:\-\.]?\s*([A-D])/gi)).map((m) => ({ idx: parseInt(m[1],10)-1, ans: m[2].toUpperCase().charCodeAt(0)-65 }));
    const arr = new Array(count).fill(null);
    numbered.forEach(({idx, ans}) => { if (idx>=0 && idx<count) arr[idx]=ans; });
    if (arr.every(v => v !== null)) return arr as number[];
    return null;
  };

  const handleSendMessage = async (message: string, command?: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    const userMessage: AIMessage = { role: 'user', content: message };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);

    try {
      const triggers = ["i don't get it", 'can you test me', 'am i ready', 'help me with this weak area'];
      if (!command && pendingQuiz) {
        const answers = parseAnswers(message, pendingQuiz.questions.length);
        if (!answers) {
          toast.info('Please answer like A B C D or 1:A 2:B ...');
          setIsProcessing(false);
          return;
        }
        const incorrectIdxs = answers.map((a, i) => a === pendingQuiz.questions[i].correctAnswer ? null : i).filter(v => v !== null) as number[];
        const resultSummary = pendingQuiz.questions.map((q, i) => `Q${i+1}: ${answers[i] === q.correctAnswer ? 'Correct' : 'Needs work'}`).join('\n');
        const aiMessage: AIMessage = { role: 'assistant', content: `Evaluation:\n${resultSummary}\nTo compose this concept in lucidity, the Geometric Mind Map is forming now on your canvas.` };
        const newHist = [...newHistory, aiMessage];
        setChatHistory(newHist);
        if (incorrectIdxs.length > 0) {
          toast.info('Composing micro mind map...');
          const content = incorrectIdxs.map(i => `Prerequisite concepts needed to answer: ${pendingQuiz.questions[i].question}`).join('\n');
          const nodes = await AIService.generateMindMap(content, modelPreferences.mindmap);
          const formattedNodes = nodes.map((node: any, index: number) => ({
            id: node.id || `node-${Date.now()}-${index}`,
            type: 'text',
            title: node.title || node.content || 'Concept',
            x: 150 + (index % 4) * 200,
            y: 150 + Math.floor(index / 4) * 200,
            connections: node.children || [],
            color: index === 0 ? 'monochrome_accent' : undefined,
          }));
          setCanvasItems(prevItems => [...prevItems, ...formattedNodes]);
          toast.success('Micro mind map added to canvas.');
        }
        setPendingQuiz(null);
        setIsProcessing(false);
        return;
      }

      if (!command && triggers.some(t => message.toLowerCase().includes(t))) {
        toast.info('Generating adaptive diagnostic...');
        const content = canvasItems.map((n) => n.title).join(', ') || message;
        const quizResponse = await AIService.generateQuiz(content, 6, 'medium', modelPreferences.quiz);
        setPendingQuiz(quizResponse);
        const aiMessage: AIMessage = {
          role: 'assistant',
          content: `The void reveals an opportunity for focused mastery. I will compose an Adaptive Diagnostic.\n\nAnswer using letters (e.g., A B C D E F).\n\n${quizResponse.questions.map((q, i) => `Question ${i + 1}: ${q.question}\n${q.options.map((opt, j) => `${String.fromCharCode(65 + j)}. ${opt}`).join('\n')}`).join('\n\n')}`
        };
        setChatHistory([...newHistory, aiMessage]);
        setIsProcessing(false);
        return;
      }

      if (command === 'mindmap') {
        toast.info("Generating mind map...");
        const nodes = await AIService.generateMindMap(message, modelPreferences.mindmap);
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
        const quizResponse = await AIService.generateQuiz(message, 5, 'medium', modelPreferences.quiz);
        setPendingQuiz(quizResponse);
        const aiMessage: AIMessage = {
          role: 'assistant',
          content: `I've generated a ${quizResponse.questions.length}-question quiz for you. Answer using letters (e.g., A B C ...).\n\n${quizResponse.questions.map((q, i) =>
            `Question ${i + 1}: ${q.question}\n${q.options.map((opt, j) => `${String.fromCharCode(65 + j)}. ${opt}`).join('\n')}`
          ).join('\n\n')}`
        };
        setChatHistory([...newHistory, aiMessage]);
        toast.success("Quiz generated!");
      } else {
        const selectedChatModel = command === 'explain' ? modelPreferences.explanations : modelPreferences.chat;
        const response = await AIService.chat(newHistory, selectedChatModel);
        const { caption, artifact } = extractArtifact(response.content || '');
        if (artifact && artifact.artifact_type) {
          if (artifact.artifact_type === 'Geometric Mind Map' && artifact.action === 'RENDER') {
            const items = buildItemsFromArtifact(artifact);
            setCanvasItems(prevItems => [...prevItems, ...items]);
            toast.success('Mind map rendered on canvas.');
          }
          const aiMessage: AIMessage = { role: 'assistant', content: caption || 'To compose this concept in lucidity, the Geometric Mind Map is forming now on your canvas.' };
          setChatHistory([...newHistory, aiMessage]);
        } else {
          const aiMessage: AIMessage = { role: 'assistant', content: response.content };
          setChatHistory([...newHistory, aiMessage]);
        }
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
        modelPreferences.vision
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
