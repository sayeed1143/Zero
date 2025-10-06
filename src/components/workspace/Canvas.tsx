import { useState, useRef, useEffect } from "react";
import { Upload, Image, FileText, BarChart3, ZoomIn, ZoomOut, Maximize2, Move, Plus, Trash2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CanvasNode {
  id: string;
  type: 'image' | 'text' | 'chart' | 'file';
  title: string;
  x: number;
  y: number;
  connections: string[];
}

interface CanvasProps {
  items: any[];
  onFileUpload?: (file: File) => void;
}

const Canvas = ({ items, onFileUpload }: CanvasProps) => {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [connectMode, setConnectMode] = useState(false);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (items && items.length > 0) {
      setNodes(prev => {
        const userNodes = prev.filter(node => 
          node.id.startsWith('manual-') || node.id.startsWith('file-')
        );
        
        const itemNodes: CanvasNode[] = items.map((item, index) => {
          const existingNode = prev.find(n => n.id === item.id);
          if (existingNode) {
            return {
              ...existingNode,
              title: item.title || existingNode.title,
              type: item.type || existingNode.type,
              connections: normalizeConnections(item.connections || item.children || existingNode.connections)
            };
          }
          
          return {
            id: item.id || `ai-${Date.now()}-${index}`,
            type: item.type || 'text',
            title: item.title || item.name || `Node ${index + 1}`,
            x: item.x !== undefined ? item.x : 100 + (index % 4) * 200,
            y: item.y !== undefined ? item.y : 100 + Math.floor(index / 4) * 200,
            connections: normalizeConnections(item.connections || item.children || [])
          };
        });
        
        return [...userNodes, ...itemNodes];
      });
    } else if (items && items.length === 0) {
      setNodes(prev => prev.filter(node => 
        node.id.startsWith('manual-') || node.id.startsWith('file-')
      ));
    }
  }, [items]);

  const normalizeConnections = (connections: any): string[] => {
    if (!Array.isArray(connections)) return [];
    return connections
      .map(conn => {
        if (typeof conn === 'string') return conn;
        if (conn && typeof conn === 'object' && conn.id) return conn.id;
        return null;
      })
      .filter((id): id is string => id !== null);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (!connectMode) {
      setDraggedNode(nodeId);
      setSelectedNode(nodeId);
    }
  };

  const handleNodeDrag = (e: React.MouseEvent, nodeId: string) => {
    if (draggedNode === nodeId && !connectMode) {
      setNodes(prev => prev.map(node => 
        node.id === nodeId 
          ? { ...node, x: node.x + e.movementX / zoom, y: node.y + e.movementY / zoom }
          : node
      ));
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (connectMode) {
      if (connectFrom === null) {
        setConnectFrom(nodeId);
        toast.info("Select another node to connect to");
      } else if (connectFrom !== nodeId) {
        setNodes(prev => prev.map(node => 
          node.id === connectFrom 
            ? { ...node, connections: [...node.connections, nodeId] }
            : node
        ));
        toast.success("Nodes connected!");
        setConnectFrom(null);
        setConnectMode(false);
      }
    } else {
      setSelectedNode(nodeId);
    }
  };

  const handleAddNode = () => {
    const newNode: CanvasNode = {
      id: `manual-${Date.now()}`,
      type: 'text',
      title: 'New Idea',
      x: Math.random() * 300 + 150,
      y: Math.random() * 200 + 150,
      connections: []
    };
    setNodes(prev => [...prev, newNode]);
    toast.success("New node added!");
  };

  const handleDeleteNode = () => {
    if (selectedNode) {
      setNodes(prev => {
        const filtered = prev.filter(node => node.id !== selectedNode);
        return filtered.map(node => ({
          ...node,
          connections: node.connections.filter(id => id !== selectedNode)
        }));
      });
      setSelectedNode(null);
      toast.success("Node deleted");
    }
  };

  const toggleConnectMode = () => {
    setConnectMode(!connectMode);
    setConnectFrom(null);
    if (!connectMode) {
      toast.info("Connect mode: Click two nodes to link them");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (onFileUpload && files[0].type.startsWith('image/')) {
        onFileUpload(files[0]);
      } else {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left - pan.x) / zoom;
          const y = (e.clientY - rect.top - pan.y) / zoom;
          
          const newNodes: CanvasNode[] = files.map((file, index) => {
            let type: CanvasNode['type'] = 'file';
            if (file.type.startsWith('image/')) type = 'image';
            else if (file.type.includes('pdf') || file.type.includes('document')) type = 'text';
            
            return {
              id: `file-${Date.now()}-${index}`,
              type,
              title: file.name,
              x: x + index * 20,
              y: y + index * 20,
              connections: []
            };
          });
          
          setNodes(prev => [...prev, ...newNodes]);
          toast.success(`${files.length} file(s) added to canvas!`);
        }
      }
    }
  };

  const getNodeIcon = (type: CanvasNode['type']) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5" />;
      case 'text': return <FileText className="w-5 h-5" />;
      case 'chart': return <BarChart3 className="w-5 h-5" />;
      case 'file': return <Upload className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex-1 relative bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="absolute top-6 left-6 z-10 glass-panel rounded-2xl p-2 animate-slide-up">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleZoomOut}
            size="icon"
            variant="ghost"
            className="touch-target hover:bg-primary/10 rounded-xl focus-ring"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <div className="px-3 py-1 text-sm font-medium bg-background/50 rounded-lg min-w-[4rem] text-center">
            {Math.round(zoom * 100)}%
          </div>
          <Button
            onClick={handleZoomIn}
            size="icon"
            variant="ghost"
            className="touch-target hover:bg-primary/10 rounded-xl focus-ring"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            onClick={handleResetView}
            size="icon"
            variant="ghost"
            className="touch-target hover:bg-primary/10 rounded-xl focus-ring"
            title="Reset View"
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="touch-target hover:bg-primary/10 rounded-xl focus-ring"
            title="Pan Mode"
          >
            <Move className="w-5 h-5" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            onClick={toggleConnectMode}
            size="icon"
            variant={connectMode ? "default" : "ghost"}
            className="touch-target rounded-xl focus-ring"
            title="Connect Nodes"
          >
            <Link2 className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleAddNode}
            size="icon"
            className="touch-target bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl focus-ring glow-hover"
            title="Add Node"
          >
            <Plus className="w-5 h-5" />
          </Button>
          {selectedNode && (
            <Button
              onClick={handleDeleteNode}
              size="icon"
              variant="ghost"
              className="touch-target hover:bg-destructive/10 text-destructive rounded-xl focus-ring"
              title="Delete Node"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <div 
        ref={canvasRef}
        className="absolute inset-0 overflow-hidden cursor-move"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div 
          className="relative w-full h-full transition-transform duration-100"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center max-w-4xl animate-fade-in">
                <h1 className="text-5xl font-bold mb-6 gradient-text">
                  Welcome to SHUNYA AI
                </h1>
                <p className="text-xl text-muted-foreground mb-12">
                  Your monochrome sanctuary for visual intelligence
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card rounded-3xl p-8 glow-hover cursor-pointer group">
                    <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mb-6 node-glow group-hover:scale-105 transition-transform">
                      <Upload className="w-16 h-16 text-primary" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-lg font-bold text-foreground">Upload Files</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Drag & drop PDFs, images, videos onto the canvas to get started.
                      </p>
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-8 glow-hover cursor-pointer group">
                    <div className="aspect-square bg-gradient-to-br from-secondary/30 to-primary/20 rounded-2xl flex flex-col items-center justify-center mb-6 gap-3 group-hover:scale-105 transition-transform">
                      <div className="flex gap-2 text-xs">
                        <div className="flex items-center gap-2 glass-panel px-3 py-2 rounded-full">
                          <Image className="w-4 h-4 text-primary" />
                          <span className="font-medium">Visualize</span>
                        </div>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <div className="flex items-center gap-2 glass-panel px-3 py-2 rounded-full">
                          <FileText className="w-4 h-4 text-accent" />
                          <span className="font-medium">Analyze</span>
                        </div>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <div className="flex items-center gap-2 glass-panel px-3 py-2 rounded-full">
                          <BarChart3 className="w-4 h-4 text-secondary-foreground" />
                          <span className="font-medium">Create</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-lg font-bold text-foreground">AI Processing</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Select content and ask anything. Get instant mind maps and explanations.
                      </p>
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl p-8 glow-hover cursor-pointer group">
                    <div className="aspect-square bg-gradient-to-br from-accent/20 to-secondary/30 rounded-2xl flex items-center justify-center mb-6 p-6 group-hover:scale-105 transition-transform">
                      <div className="relative w-full h-full">
                        <div className="absolute top-4 right-4 w-20 h-24 glass-card rounded-2xl shadow-lg transform rotate-6 node-glow"></div>
                        <div className="absolute top-6 left-6 w-20 h-24 glass-card rounded-2xl shadow-lg transform -rotate-3 node-glow"></div>
                        <div className="absolute bottom-4 right-8 w-20 h-24 glass-card rounded-2xl shadow-lg transform rotate-12 node-glow"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-lg font-bold text-foreground">Learn Visually</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Collaborate, organize, and master concepts with personalized quizzes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm">
                  <div className="flex items-center gap-3 glass-panel px-6 py-3 rounded-full">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg">
                      1
                    </div>
                    <span className="font-medium">Drop files onto canvas</span>
                  </div>
                  <div className="flex items-center gap-3 glass-panel px-6 py-3 rounded-full">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg">
                      2
                    </div>
                    <span className="font-medium">Ask AI anything</span>
                  </div>
                  <div className="flex items-center gap-3 glass-panel px-6 py-3 rounded-full">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg">
                      3
                    </div>
                    <span className="font-medium">Get amazing results</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                <defs>
                  <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(147, 51, 234)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.6" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {nodes.map(node => 
                  node.connections.map(targetId => {
                    const targetNode = nodes.find(n => n.id === targetId);
                    if (!targetNode) return null;
                    
                    const x1 = node.x + 75;
                    const y1 = node.y + 75;
                    const x2 = targetNode.x + 75;
                    const y2 = targetNode.y + 75;
                    
                    const midX = (x1 + x2) / 2;
                    const midY = (y1 + y2) / 2;
                    const offset = 50;
                    
                    return (
                      <path
                        key={`${node.id}-${targetId}`}
                        d={`M ${x1} ${y1} Q ${midX} ${midY - offset} ${x2} ${y2}`}
                        stroke="url(#connectionGradient)"
                        strokeWidth="3"
                        fill="none"
                        filter="url(#glow)"
                        className="animate-pulse"
                      />
                    );
                  })
                )}
              </svg>

              {nodes.map(node => (
                <div
                  key={node.id}
                  className={`absolute glass-card rounded-2xl p-6 cursor-move glow-hover node-glow touch-target ${
                    selectedNode === node.id ? 'ring-4 ring-primary ring-offset-2' : ''
                  } ${connectFrom === node.id ? 'ring-4 ring-accent ring-offset-2' : ''}`}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: '150px',
                    height: '150px',
                  }}
                  onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                  onMouseMove={(e) => handleNodeDrag(e, node.id)}
                  onMouseUp={() => setDraggedNode(null)}
                  onClick={() => handleNodeClick(node.id)}
                >
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-3 text-white shadow-lg">
                      {getNodeIcon(node.type)}
                    </div>
                    <p className="font-semibold text-sm line-clamp-2">{node.title}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
