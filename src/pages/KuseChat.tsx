import { useState, useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Controls,
  Background,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { toPng } from 'html-to-image';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import SideToolbar from '@/components/kuse/SideToolbar';
import CanvasControls from '@/components/kuse/CanvasControls';
import ChatInput from '@/components/kuse/ChatInput';
import MessageNode from '@/components/kuse/MessageNode';
import AnimatedEdge from '@/components/kuse/AnimatedEdge';
import { AIService } from '@/services/ai';
import { AIMessage } from '@/types/ai';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'messageNode',
    position: { x: 100, y: 100 },
    data: { role: 'assistant', label: 'Welcome to Shunya AI. How can I guide your intelligence today?' },
  },
];

const nodeTypes = { messageNode: MessageNode };
const edgeTypes = { animated: AnimatedEdge };

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 256, height: 150 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';
    node.position = {
      x: nodeWithPosition.x - 256 / 2,
      y: nodeWithPosition.y - 150 / 2,
    };
  });

  return { nodes, edges };
};


const KuseChatFlow = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setViewport, fitView } = useReactFlow();

  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const handleSendMessage = useCallback(async (message: string) => {
    setIsProcessing(true);
    const userNodeId = `user-${Date.now()}`;
    const aiNodeId = `ai-${Date.now()}`;
    const lastNode = nodes[nodes.length - 1];

    const userNode: Node = {
      id: userNodeId,
      type: 'messageNode',
      position: { x: lastNode.position.x + 350, y: lastNode.position.y - 100 },
      data: { role: 'user', label: message },
    };

    const aiNode: Node = {
      id: aiNodeId,
      type: 'messageNode',
      position: { x: lastNode.position.x + 350, y: lastNode.position.y + 100 },
      data: { role: 'assistant', label: 'Thinking...' },
    };

    const newEdge: Edge = {
      id: `edge-${userNodeId}-${aiNodeId}`,
      source: userNodeId,
      target: aiNodeId,
      type: 'animated',
    };
    
    setNodes((nds) => nds.concat(userNode, aiNode));
    setEdges((eds) => eds.concat(newEdge));

    try {
      const chatHistory: AIMessage[] = nodes.map(n => ({ role: n.data.role, content: n.data.label }));
      const response = await AIService.chat([...chatHistory, { role: 'user', content: message }]);
      
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === aiNodeId) {
            node.data = { ...node.data, label: response.content };
          }
          return node;
        })
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to get response from Shunya AI.");
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === aiNodeId) {
            node.data = { ...node.data, label: 'Error fetching response.' };
          }
          return node;
        })
      );
    } finally {
      setIsProcessing(false);
    }
  }, [nodes, setNodes, setEdges]);
  
  const handleLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    window.requestAnimationFrame(() => {
        fitView();
    });
  }, [nodes, edges, setNodes, setEdges, fitView]);

  const handleExport = useCallback(() => {
    if (reactFlowWrapper.current) {
      toPng(reactFlowWrapper.current, { cacheBust: true })
        .then((dataUrl) => {
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = 'shunya-ai-canvas.png';
          a.click();
          toast.success("Canvas exported as PNG!");
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to export canvas.");
        });
    }
  }, [reactFlowWrapper]);

  const handleReset = useCallback(() => {
    fitView({duration: 800});
  }, [fitView]);

  const mode = 'Student'; // Example mode

  return (
    <div className="h-screen w-screen bg-background font-sans relative overflow-hidden" ref={reactFlowWrapper}>
      <header className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-start">
        <div className="flex flex-col items-start">
          <h1 className="glow-text text-3xl">SHUNYA AI</h1>
          <p className="font-orbitron text-white/60 text-xs tracking-wider">The Beginning of Infinite Intelligence</p>
        </div>
        <div className="text-center">
            <div className="flex items-center gap-2 glass-pane p-2 rounded-2xl">
                {['Student', 'College', 'Teacher', 'Explorer'].map(m => (
                    <Button key={m} variant={mode === m ? 'secondary' : 'ghost'} className={`rounded-xl h-12 w-28 font-orbitron ${mode === m ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
                        {m}
                    </Button>
                ))}
            </div>
            <p className="font-orbitron text-white/50 text-sm mt-3 italic">"Within a quiet mind, the universe speaks."</p>
        </div>
        <div className="w-64" />
      </header>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-transparent"
      >
        <Background gap={24} color="#27272a" />
      </ReactFlow>

      <SideToolbar />
      <CanvasControls onLayout={handleLayout} onExport={handleExport} onReset={handleReset} />
      <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} />
    </div>
  );
};

export default function KuseChat() {
  return (
    <ReactFlowProvider>
      <KuseChatFlow />
    </ReactFlowProvider>
  );
}
