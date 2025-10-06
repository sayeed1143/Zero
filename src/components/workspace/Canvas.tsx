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
  color?: string;
}

interface CanvasProps {
  items: any[];
  onFileUpload?: (file: File) => void;
  focusNodeId?: string | null;
  onFocusCompleted?: () => void;
}

const Canvas = ({ items, onFileUpload, focusNodeId, onFocusCompleted }: CanvasProps) => {
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
            connections: normalizeConnections(item.connections || item.children || []),
            color: item.color
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

  useEffect(() => {
    if (!focusNodeId) return;
    const node = nodes.find(n => n.id === focusNodeId);
    if (!node || !canvasRef.current) return;

    // center node in view
    const rect = canvasRef.current.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    const nodeWidth = 150;
    const nodeHeight = 150;

    const targetPanX = containerWidth / 2 - (node.x + nodeWidth / 2) * zoom;
    const targetPanY = containerHeight / 2 - (node.y + nodeHeight / 2) * zoom;

    setPan({ x: targetPanX, y: targetPanY });
    setSelectedNode(node.id);

    // clear selection after a short time, and notify workspace
    const t = setTimeout(() => {
      setSelectedNode(null);
      if (onFocusCompleted) onFocusCompleted();
    }, 3000);

    return () => clearTimeout(t);
  }, [focusNodeId]);

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
    <div className="flex-1 relative bg-white">
      <div className="pointer-events-none absolute top-6 right-6 z-0 opacity-10 transform rotate-6 text-2xl font-bold text-black/80 select-none">SHUNYA CANVAS</div>
      <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur rounded-2xl p-2 border border-black/10 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            onClick={handleZoomOut}
            size="icon"
            variant="ghost"
            className="touch-target rounded-xl hover:bg-black/5 focus-ring"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <div className="px-3 py-1 text-sm font-medium bg-white/80 rounded-lg min-w-[4rem] text-center border border-black/10">
            {Math.round(zoom * 100)}%
          </div>
          <Button
            onClick={handleZoomIn}
            size="icon"
            variant="ghost"
            className="touch-target rounded-xl hover:bg-black/5 focus-ring"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <div className="w-px h-6 bg-black/10 mx-1" />
          <Button
            onClick={handleResetView}
            size="icon"
            variant="ghost"
            className="touch-target rounded-xl hover:bg-black/5 focus-ring"
            title="Reset View"
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="touch-target rounded-xl hover:bg-black/5 focus-ring"
            title="Pan Mode"
          >
            <Move className="w-5 h-5" />
          </Button>
          <div className="w-px h-6 bg-black/10 mx-1" />
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
            className="touch-target bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl focus-ring"
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
        className="absolute inset-0 overflow-hidden cursor-move bg-dot-grid"
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
              <div className="text-center max-w-4xl">
                <h1 className="text-5xl font-bold mb-3 text-black">Welcome to SHUNYA AI</h1>
                <p className="text-lg text-black/70 mb-10">Your monochrome sanctuary for visual intelligence</p>
                <div className="flex items-center justify-center gap-3 text-sm">
                  <div className="flex items-center gap-3 px-5 py-3 rounded-full border border-black/20 bg-white">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                    <span className="font-medium">Drop files onto canvas</span>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 rounded-full border border-black/20 bg-white">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                    <span className="font-medium">Ask AI anything</span>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 rounded-full border border-black/20 bg-white">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                    <span className="font-medium">Get amazing results</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
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
                    const offset = 40;
                    
                    return (
                      <path
                        key={`${node.id}-${targetId}`}
                        d={`M ${x1} ${y1} Q ${midX} ${midY - offset} ${x2} ${y2}`}
                        stroke="black"
                        strokeOpacity={0.25}
                        strokeWidth="2"
                        fill="none"
                        filter="url(#glow)"
                      />
                    );
                  })
                )}
              </svg>

              {nodes.map(node => (
                <div
                  key={node.id}
                  className={`absolute rounded-3xl p-5 cursor-move bg-gradient-to-br from-white to-white/95 border border-black/10 shadow-lg transform transition-all hover:scale-105 ${
                    selectedNode === node.id ? 'ring-4 ring-accent/40 ring-offset-2' : node.color === 'monochrome_accent' ? 'ring-2 ring-accent ring-offset-2' : ''
                  } ${connectFrom === node.id ? 'ring-4 ring-accent/30' : ''}`}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: '180px',
                    height: '160px',
                  }}
                  onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                  onMouseMove={(e) => handleNodeDrag(e, node.id)}
                  onMouseUp={() => setDraggedNode(null)}
                  onClick={() => handleNodeClick(node.id)}
                >
                  <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent text-primary-foreground flex items-center justify-center mb-1 shadow-inner">
                      {getNodeIcon(node.type)}
                    </div>
                    <p className="font-semibold text-sm leading-tight line-clamp-3 text-black">{node.title}</p>
                    <div className="mt-2 text-xs text-black/60">{node.type}</div>
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
