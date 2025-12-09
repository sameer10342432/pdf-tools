import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Network, Plus, Trash2, Download, ZoomIn, ZoomOut } from "lucide-react";

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  parentId: string | null;
  color: string;
}

const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];

export function OnlineMindMap() {
  const [nodes, setNodes] = useState<MindMapNode[]>([
    { id: "1", text: "Central Idea", x: 400, y: 300, parentId: null, color: "#3B82F6" }
  ]);
  const [selectedNode, setSelectedNode] = useState<string | null>("1");
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const addNode = useCallback(() => {
    if (!selectedNode) return;
    
    const parent = nodes.find(n => n.id === selectedNode);
    if (!parent) return;

    const siblingCount = nodes.filter(n => n.parentId === selectedNode).length;
    const angle = (Math.PI / 4) * siblingCount - Math.PI / 2;
    const distance = 120;

    const newNode: MindMapNode = {
      id: Date.now().toString(),
      text: "New Idea",
      x: parent.x + Math.cos(angle) * distance,
      y: parent.y + Math.sin(angle) * distance,
      parentId: selectedNode,
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode.id);
  }, [selectedNode, nodes]);

  const deleteNode = useCallback(() => {
    if (!selectedNode || selectedNode === "1") return;
    
    const nodesToDelete = new Set<string>();
    const findChildren = (id: string) => {
      nodesToDelete.add(id);
      nodes.filter(n => n.parentId === id).forEach(n => findChildren(n.id));
    };
    findChildren(selectedNode);
    
    setNodes(prev => prev.filter(n => !nodesToDelete.has(n.id)));
    setSelectedNode("1");
  }, [selectedNode, nodes]);

  const startEditing = useCallback((id: string) => {
    const node = nodes.find(n => n.id === id);
    if (node) {
      setEditingNode(id);
      setEditText(node.text);
    }
  }, [nodes]);

  const finishEditing = useCallback(() => {
    if (editingNode) {
      setNodes(prev => prev.map(n => 
        n.id === editingNode ? { ...n, text: editText } : n
      ));
      setEditingNode(null);
    }
  }, [editingNode, editText]);

  const handleNodeDrag = useCallback((id: string, e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;

    setNodes(prev => prev.map(n => 
      n.id === id ? { ...n, x, y } : n
    ));
  }, [zoom, offset]);

  const exportAsSVG = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    
    const blob = new Blob([clone.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "mindmap.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Mind Map
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} data-testid="button-zoom-out">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm">{Math.round(zoom * 100)}%</span>
              <Button size="icon" variant="ghost" onClick={() => setZoom(z => Math.min(2, z + 0.1))} data-testid="button-zoom-in">
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={addNode} disabled={!selectedNode} data-testid="button-add-node">
              <Plus className="w-4 h-4 mr-2" />
              Add Child
            </Button>
            <Button onClick={deleteNode} variant="outline" disabled={!selectedNode || selectedNode === "1"} data-testid="button-delete-node">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button onClick={exportAsSVG} variant="outline" data-testid="button-export-mindmap">
              <Download className="w-4 h-4 mr-2" />
              Export SVG
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden bg-muted/20" style={{ height: "500px" }}>
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              viewBox="0 0 800 600"
              style={{ transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)` }}
              data-testid="mindmap-canvas"
            >
              {nodes.map(node => {
                if (!node.parentId) return null;
                const parent = nodes.find(n => n.id === node.parentId);
                if (!parent) return null;
                return (
                  <line
                    key={`line-${node.id}`}
                    x1={parent.x}
                    y1={parent.y}
                    x2={node.x}
                    y2={node.y}
                    stroke={node.color}
                    strokeWidth={2}
                    opacity={0.6}
                  />
                );
              })}
              
              {nodes.map(node => (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node.id)}
                  onDoubleClick={() => startEditing(node.id)}
                  onMouseMove={(e) => handleNodeDrag(node.id, e)}
                  style={{ cursor: "pointer" }}
                  data-testid={`mindmap-node-${node.id}`}
                >
                  <ellipse
                    cx={node.x}
                    cy={node.y}
                    rx={60}
                    ry={25}
                    fill={node.color}
                    stroke={selectedNode === node.id ? "#000" : "transparent"}
                    strokeWidth={2}
                    opacity={0.9}
                  />
                  {editingNode === node.id ? (
                    <foreignObject x={node.x - 50} y={node.y - 12} width={100} height={24}>
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={finishEditing}
                        onKeyDown={(e) => e.key === "Enter" && finishEditing()}
                        autoFocus
                        className="h-6 text-xs text-center"
                        data-testid="input-node-text"
                      />
                    </foreignObject>
                  ) : (
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill="white"
                      fontSize={12}
                      fontWeight={500}
                    >
                      {node.text.length > 12 ? node.text.slice(0, 12) + "..." : node.text}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>

          <p className="text-sm text-muted-foreground mt-2">
            Click to select, double-click to edit, drag to move nodes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
