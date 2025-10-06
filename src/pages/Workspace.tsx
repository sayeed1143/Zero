import { useState, useEffect } from "react";
import Canvas from "@/components/workspace/Canvas";
import ChatInterface from "@/components/workspace/ChatInterface";
import WorkspaceNav from "@/components/workspace/WorkspaceNav";
import LearningPath, { LearningNode } from "@/components/workspace/LearningPath";
import { AIService } from "@/services/ai";
import { toast } from "sonner";
import type { AIMessage, QuizResponse } from "@/types/ai";
import { DEFAULT_FEATURE_MODELS } from "@/types/ai";
import { extractPdfHighlights } from "@/lib/pdfHighlights";

const Workspace = () => {
  const [canvasItems, setCanvasItems] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<AIMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelPreferences] = useState(DEFAULT_FEATURE_MODELS);
  const [pendingQuiz, setPendingQuiz] = useState<QuizResponse | null>(null);

  // New states to support 'View on Canvas' flow
  const [lastAddedNodeIds, setLastAddedNodeIds] = useState<string[]>([]);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const [showLearningPath, setShowLearningPath] = useState(false);


  useEffect(() => {
    if (canvasItems.length > 0) return;
    const baseX = 150;
    const baseY = 120;
    const onboarding = [
      { id: 'A', type: 'text', title: 'Welcome to Shunya: The Geometry of Learning', x: baseX, y: baseY, connections: ['B','C','D'], color: 'monochrome_accent' },
      { id: 'B', type: 'text', title: 'How to use: Ask a topic', x: baseX + 240, y: baseY + 180, connections: [] },
      { id: 'C', type: 'text', title: 'Start a new subject: Quantum Physics', x: baseX - 240, y: baseY + 180, connections: [] },
      { id: 'D', type: 'text', title: 'Say: “Can you test me?”', x: baseX, y: baseY + 360, connections: [] },
    ];
    setCanvasItems(onboarding);
  }, []);

  const addNodesToCanvas = (nodes: any[]) => {
    if (!nodes || nodes.length === 0) return;
    const formatted = nodes.map((node: any, index: number) => ({
      id: node.id || `node-${Date.now()}-${index}`,
      type: node.type || 'text',
      title: node.title || node.content || `Node ${index + 1}`,
      x: node.x !== undefined ? node.x : 150 + (index % 4) * 200,
      y: node.y !== undefined ? node.y : 150 + Math.floor(index / 4) * 200,
      connections: node.connections || node.children || [],
      color: node.color
    }));

    setCanvasItems(prev => [...prev, ...formatted]);
    setLastAddedNodeIds(formatted.map((n: any) => n.id));
    // focus the first of the newly added nodes
    if (formatted.length > 0) setFocusNodeId(formatted[0].id);
  };

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
          const formattedNodes = nodes.map((node: any, index) => ({
            id: node.id || `node-${Date.now()}-${index}`,
            type: 'text',
            title: node.title || node.content || 'Concept',
            x: 150 + (index % 4) * 200,
            y: 150 + Math.floor(index / 4) * 200,
            connections: node.children || [],
            color: index === 0 ? 'monochrome_accent' : undefined,
          }));
          addNodesToCanvas(formattedNodes);
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
          type: node.type || 'text',
          title: node.title || node.content || 'Topic',
          x: 150 + (index % 4) * 200,
          y: 150 + Math.floor(index / 4) * 200,
          connections: node.children || []
        }));
        addNodesToCanvas(formattedNodes);
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
            addNodesToCanvas(items);
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

      addNodesToCanvas([newNode]);

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

  const handlePdfUpload = async (file: File) => {
    try {
      setIsProcessing(true);
      toast.info("Extracting highlights from PDF...");
      const highlights = await extractPdfHighlights(file);

      if (!highlights.length) {
        toast.info("No highlights found in the PDF");
        return;
      }

      const nodes = highlights.map((h, i) => ({
        id: `pdf-hl-${Date.now()}-${i}`,
        type: 'text',
        title: h.text.length > 120 ? `${h.text.slice(0, 117)}...` : h.text || `Highlight p${h.page}`,
        x: 150 + (i % 4) * 220,
        y: 150 + Math.floor(i / 4) * 180,
        connections: [],
        color: i === 0 ? 'monochrome_accent' : undefined,
      }));

      addNodesToCanvas(nodes);

      const summary = `Extracted ${highlights.length} highlight${highlights.length > 1 ? 's' : ''} from ${file.name}.`;
      const aiMessage: AIMessage = { role: 'assistant', content: summary };
      setChatHistory(prev => [...prev, aiMessage]);
      toast.success("Highlights added to canvas");
    } catch (err: any) {
      console.error('PDF highlight extraction error:', err);
      toast.error(err?.message || 'Failed to analyze PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewOnCanvas = () => {
    if (lastAddedNodeIds.length > 0) {
      setFocusNodeId(lastAddedNodeIds[0]);
    }
  };

  const handleFocusCompleted = () => {
    setFocusNodeId(null);
    setLastAddedNodeIds([]);
  };

  // derive simple learning nodes from canvas items
  const learningNodes: LearningNode[] = canvasItems.map((c, idx) => ({
    id: c.id || `node-${idx}`,
    label: c.title || c.name || `Node ${idx + 1}`,
    prereqs: Array.isArray(c.connections) ? c.connections : (c.children || []),
    mastery: typeof c.mastery === 'number' ? c.mastery : (c.color === 'monochrome_accent' ? 0.85 : Math.max(0.12, Math.min(0.9, 0.2 + (c.connections ? c.connections.length * 0.12 : 0))))
  }));

  return (
    <div className="h-screen flex flex-col bg-background">
      <WorkspaceNav />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 bg-white relative">
          <Canvas items={canvasItems} onFileUpload={handleFileUpload} focusNodeId={focusNodeId} onFocusCompleted={handleFocusCompleted} />

          {/* Floating control to open Learning Path visualization */}
          <div className="absolute top-6 right-6 z-20">
            <button
              onClick={() => setShowLearningPath(true)}
              className="bg-foreground text-background px-4 py-2 rounded-full shadow-lg hover:shadow-xl focus-ring"
            >
              Learning Path
            </button>
          </div>

          {showLearningPath && (
            <LearningPath
              nodes={learningNodes}
              onSelect={(id) => { setFocusNodeId(id); setShowLearningPath(false); }}
              onClose={() => setShowLearningPath(false)}
            />
          )}
        </div>
        <aside className="w-full md:w-1/3 border-l border-[#E0E0E0] bg-[#F4F4F4] flex flex-col">
          <ChatInterface
            onSendMessage={handleSendMessage}
            chatHistory={chatHistory}
            isProcessing={isProcessing}
            lastAddedNodeIds={lastAddedNodeIds}
            onViewCanvas={handleViewOnCanvas}
          />
        </aside>
      </div>
    </div>
  );
};

export default Workspace;
